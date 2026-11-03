import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Security', () => {
    it('should block path traversal on error boundaries', async () => {
        const errorConfig = `
errors {
    404 = "../etc/passwd"
}
        `;
        const app = elysiaCustomStatic(errorConfig);
        app.get('/test', () => 'Test'); // only /test exists

        const response = await app.handle(new Request('http://localhost/not-found-route'));

        // It should fallback to default 404 because file path is invalid/blocked
        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).toBe('NOT_FOUND');
    });

    it('should block absolute path traversal on error boundaries', async () => {
        const errorConfig = `
errors {
    500 = "/etc/passwd"
}
        `;
        const app = elysiaCustomStatic(errorConfig);
        app.get('/error', () => { throw new Error('Test Error') });

        const response = await app.handle(new Request('http://localhost/error'));

        expect(response.status).toBe(500);
        const text = await response.text();
        expect(text).toContain('Error');
    });
});