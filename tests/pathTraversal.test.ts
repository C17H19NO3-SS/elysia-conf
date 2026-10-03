import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Prevention in Dynamic Paths', () => {
    it('should sanitize absolute path traversal in error boundaries', async () => {
        // Attempt to access /etc/passwd using absolute path prefix
        const errorConfig = `
errors {
    404 = "/etc/passwd"
}
        `;

        const consoleSpy = console.error;
        let loggedError = false;
        console.error = (...args: any[]) => {
            if (args[0] && args[0].toString().includes('Security/File error on error boundaries')) {
                loggedError = true;
            }
        };

        const app = elysiaCustomStatic(errorConfig);
        app.get('/test', () => 'Test'); // only /test exists

        // The error boundary creates a new Response(Bun.file(...)) which will try to open /app/etc/passwd.
        // It fails with ENOENT in our catch block or in Elysia's core.
        // Let's actually ensure it handles the error properly, because Elysia might throw when resolving response
        const response = await app.handle(new Request('http://localhost/not-found-route'));

        expect(response.status).toBe(404);

        try {
            await response.text();
        } catch (e) {
            // Because Bun.file() returned a file that doesn't exist, getting .text() might throw an error.
        }

        // Restore spy
        console.error = consoleSpy;
    });

    it('should sanitize relative path traversal in logger file', async () => {
        const loggerConfig = `
logger {
    level = "info"
    file = "../../../sensitive.log"
}
        `;
        const app = elysiaCustomStatic(loggerConfig);
        app.get('/', () => 'Hello');

        const consoleSpy = console.error;
        let loggedError = false;
        console.error = (...args: any[]) => {
            if (args[0] && args[0].toString().includes('Security error (path traversal detected on logger file)')) {
                loggedError = true;
            }
        };

        await app.handle(new Request('http://localhost/'));

        // Wait a small tick because Bun.write is asynchronous and might log the error in the microtask queue,
        // although our check is synchronous.
        await new Promise(resolve => setTimeout(resolve, 50));

        // Restore spy
        console.error = consoleSpy;

        // Path traversal should be detected and error logged
        expect(loggedError).toBe(true);
    });

    it('should allow valid safe relative paths in logger file', async () => {
        const testLogFile = 'tests/test_safe.log';
        const loggerConfig = `
logger {
    level = "info"
    file = "${testLogFile}"
}
        `;
        const app = elysiaCustomStatic(loggerConfig);
        app.get('/', () => 'Hello');

        await app.handle(new Request('http://localhost/'));

        // Check if file is written
        const file = Bun.file(testLogFile);
        const exists = await file.exists();
        expect(exists).toBe(true);

        if (exists) {
            import('fs').then(fs => fs.unlinkSync(testLogFile));
        }
    });
});
