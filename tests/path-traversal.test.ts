import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Security: Path Traversal Prevention', () => {
    it('should not allow path traversal in errors configuration', async () => {
        const errorConfig = `
errors {
    404 = "../../package.json"
}
        `;
        const app = elysiaCustomStatic(errorConfig);
        app.get('/test', () => 'Test'); // Ensure app has a route

        const response = await app.handle(new Request('http://localhost/not-found-route'));

        expect(response.status).toBe(404);
        const text = await response.text();

        // It should fallback to the default error handling mechanism (usually "NOT_FOUND" in Elysia)
        // and absolutely not contain the contents of package.json.
        expect(text).not.toContain('"name":');
        expect(text).not.toContain('dependencies');
        expect(text).toBe('NOT_FOUND');
    });
});
