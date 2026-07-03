import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Error handler path traversal', () => {
    it('should catch path traversal and respond cleanly (not expose file or crash ungracefully)', async () => {
        const errorConfig = `
errors {
    404 = "../../../../etc/passwd"
}
        `;
        const app = elysiaCustomStatic(errorConfig);
        app.get('/test', () => 'Test'); // only /test exists

        const response = await app.handle(new Request('http://localhost/not-found-route'));

        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).toBe('NOT_FOUND'); // default elysia error message, we expect fallback to happen cleanly
    });
});
