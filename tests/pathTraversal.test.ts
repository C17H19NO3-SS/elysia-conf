import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Defenses', () => {
    it('should prevent directory traversal in error boundaries', async () => {
        const errorConfig = `
errors {
    404 = "../../../../etc/passwd"
}
        `;
        const app = elysiaCustomStatic(errorConfig);
        app.get('/test', () => 'Test');

        const response = await app.handle(new Request('http://localhost/not-found-route'));

        // Before fix, it might read /etc/passwd if it exists, or just not throw.
        // After fix, it should throw or handle it as a fallback (fallback returns nothing, so status 404).
        // Let's see what happens.
        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).not.toContain('root:x:0:0');
    });
});
