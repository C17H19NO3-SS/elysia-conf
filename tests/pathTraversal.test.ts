import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Prevention', () => {
    it('should prevent directory traversal in logger file path', async () => {
        const configText = `
logger {
    level = "info"
    file = "../../../tmp/pwned.log"
}
`;
        const app = elysiaCustomStatic(configText);
        app.get('/', () => 'Hello');

        // It should catch the security error and log to console instead of crashing or writing outside process.cwd()
        const response = await app.handle(new Request('http://localhost/'));
        await response.text();
    });

    it('should prevent directory traversal in error boundary file path', async () => {
        const configText = `
errors {
    404 = "../../../etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);
        app.get('/', () => 'Hello');

        const response = await app.handle(new Request('http://localhost/not-found'));
        expect(response.status).toBe(404);
        const text = await response.text();

        // It shouldn't crash or return the host's /etc/passwd.
        expect(text).not.toContain("root:x:0:0");
    });
});
