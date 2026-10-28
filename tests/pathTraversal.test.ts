import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Vulnerability', () => {
    it('should not allow path traversal in error configurations', async () => {
        const configText = `
errors {
    404 = "../../../../etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);
        // The error boundary shouldn't expose files outside process.cwd(). Since Bun.file throws when trying to read safeFilePath or safeJoin throws, we will catch it in our app flow and fail securely. Let's test if the response returns standard 404 text instead of file contents.
        const response = await app.handle(new Request('http://localhost/not-found-route'));

        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).toBe('NOT_FOUND'); // Elysia default error response
    });

    it('should safely log without path traversal', async () => {
        const configText = `
logger {
    level = "info"
    file = "../../var/log/app.log"
}
`;
        const app = elysiaCustomStatic(configText);
        app.get('/', () => 'OK');

        const response = await app.handle(new Request('http://localhost/'));

        expect(response.status).toBe(200);
        // We know from catch block that safeJoin will throw, which is caught and console.error is invoked. The app shouldn't crash.
    });
});
