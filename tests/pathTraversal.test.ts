import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Prevention', () => {
    it('should throw or handle securely when a malicious path is provided in config.logger.file', async () => {
        const configText = `
logger {
    level = "info"
    file = "../../../etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);

        // Mock a request to trigger the logger
        app.get('/', () => 'Hello');

        // Should not throw app error, but log security error gracefully.
        // We'll capture console.error.
        const originalError = console.error;
        let errorMessage = '';
        console.error = (msg: string, e: any) => {
            if (e && e.message) {
                errorMessage = e.message;
            }
        };

        const response = await app.handle(new Request('http://localhost/'));
        console.error = originalError;

        expect(errorMessage).toBe('Directory traversal attempt detected');
    });

    it('should throw or handle securely when a malicious path is provided in config.static.dir', async () => {
        const configText = `
static {
    dir = "../../../etc"
}
`;
        const originalError = console.error;
        let errorMessage = '';
        console.error = (msg: string, e: any) => {
            if (e && e.message) {
                errorMessage = e.message;
            }
        };

        const app = elysiaCustomStatic(configText);
        console.error = originalError;

        expect(errorMessage).toBe('Directory traversal attempt detected');
    });

    it('should throw or handle securely when a malicious path is provided in config.errors', async () => {
        const configText = `
errors {
    404 = "../../../etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);

        // Trigger a 404
        const response = await app.handle(new Request('http://localhost/does-not-exist'));
        expect(response.status).toBe(404);

        // It shouldn't return contents of /etc/passwd
        const text = await response.text();
        expect(text).not.toContain('root:x:0:0');
    });

    it('should handle valid paths securely', async () => {
        const configText = `
logger {
    level = "info"
    file = "tests/temp_logger.log"
}
static {
    dir = "tests"
}
errors {
    404 = "tests/temp_404.html"
}
`;
        await Bun.write('tests/temp_404.html', 'Custom 404');
        const app = elysiaCustomStatic(configText);

        app.get('/log-test', () => 'Log test');
        const responseLog = await app.handle(new Request('http://localhost/log-test'));

        const response404 = await app.handle(new Request('http://localhost/not-found'));
        expect(response404.status).toBe(404);
        const text = await response404.text();
        expect(text).toBe('Custom 404');

        import('fs').then(fs => {
            if (fs.existsSync('tests/temp_logger.log')) fs.unlinkSync('tests/temp_logger.log');
            if (fs.existsSync('tests/temp_404.html')) fs.unlinkSync('tests/temp_404.html');
        });
    });
});
