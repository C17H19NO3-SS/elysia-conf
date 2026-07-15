import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Security: Path Traversal Prevention', () => {
    it('should block directory traversal attempts in error boundary paths', async () => {
        const errorConfig = `
errors {
    404 = "../../../../etc/passwd"
}
        `;
        const app = elysiaCustomStatic(errorConfig);

        const response = await app.handle(new Request('http://localhost/not-found-route'));
        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).not.toContain('root:x:0:0:root');
        expect(text).toBe('NOT_FOUND');
    });

    it('should block absolute path injections in error boundary paths', async () => {
        const errorConfig = `
errors {
    500 = "/etc/shadow"
}
        `;
        const app = elysiaCustomStatic(errorConfig);

        // Mock a 500 by creating a failing route
        app.get('/error-route', () => { throw new Error('Boom'); });

        const response = await app.handle(new Request('http://localhost/error-route'));
        expect(response.status).toBe(500);
        const text = await response.text();
        expect(text).not.toContain('root:');
        expect(text).toBe('Boom');
    });
});
