import { describe, expect, it, afterAll } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';
import { unlink } from 'node:fs/promises';
import { join } from 'path';

describe('Security: Path Traversal Defenses', () => {
    afterAll(async () => {
        try {
            await unlink(join(process.cwd(), 'tmp/hacked.log'));
            await unlink(join(process.cwd(), 'tmp'));
        } catch (e) {}
    });

    it('should prevent directory traversal on error boundaries', async () => {
        const errorConfig = `
errors {
    404 = "../../../../../../etc/passwd"
}
        `;
        const app = elysiaCustomStatic(errorConfig);
        app.get('/test', () => 'Test');

        const response = await app.handle(new Request('http://localhost/not-found-route'));

        expect(response.status).toBe(404);

        // When resolving an unknown file (due to sanitization forcing it to /app/etc/passwd which doesn't exist),
        // Bun.file will cause text() to throw ENOENT, which is safe behaviour.
        let text = '';
        try {
            text = await response.text();
        } catch (e) {
            // expected
        }
        expect(text).not.toContain('root:x:0:0:root');
    });

    it('should prevent directory traversal on logger file', async () => {
        const configText = `
logger {
    level = "info"
    file = "../../../../../tmp/hacked.log"
}
        `;
        const app = elysiaCustomStatic(configText);
        app.get('/', () => 'Hello');

        const response = await app.handle(new Request('http://localhost/'));
        expect(response.status).toBe(200);

        const fileExists = await Bun.file('/tmp/hacked.log').exists();
        expect(fileExists).toBe(false);
    });
});
