import { describe, it, expect } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Prevention', () => {
    it('should prevent logger from writing outside cwd', async () => {
        const configText = `
logger {
    level = "info"
    file = "../../../../../tmp/pwned.log"
}
        `;
        const app = elysiaCustomStatic(configText);
        let errorLogged = false;
        const originalConsoleError = console.error;
        console.error = (msg: string, err: any) => {
            if (err && err.message === 'Directory traversal attempt detected') {
                errorLogged = true;
            }
        };
        await app.handle(new Request('http://localhost/'));
        console.error = originalConsoleError;
        expect(errorLogged).toBe(true);
    });

    it('should prevent error boundaries from reading outside cwd', async () => {
        const configText = `
errors {
    404 = "../../../../../etc/passwd"
}
        `;
        const app = elysiaCustomStatic(configText);
        const response = await app.handle(new Request('http://localhost/not-found-route'));

        // Without path traversal protection, it would try to read the system file.
        // With protection, it throws, gets caught in the fallback, and we don't return the protected file
        expect(response.status).toBe(404);

        // Ensure that text is not the file content, fallback just continues response normally if error file fails
        const text = await response.text();
        expect(text).not.toContain('root:');
    });
});
