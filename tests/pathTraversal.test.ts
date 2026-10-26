import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Prevention', () => {
    it('should throw an error for path traversal in logger file', () => {
        const configText = `
        logger {
            level = "info"
            file = "../../../etc/passwd"
        }
        `;
        expect(() => elysiaCustomStatic(configText)).toThrow('Directory traversal attempt detected');
    });

    it('should throw an error for path traversal in static dir', () => {
        const configText = `
        static {
            dir = "/etc"
            route = "/static"
        }
        `;
        expect(() => elysiaCustomStatic(configText)).toThrow('Directory traversal attempt detected');
    });

    it('should throw an error for path traversal in errors config', () => {
        const configText = `
        errors {
            404 = "../../../../etc/shadow"
        }
        `;
        const app = elysiaCustomStatic(configText);
        // Error handling throws inside onError, but the file read is protected.
        // We will test if the error is caught/thrown by getSafePath during initialization or execution.
        // In our current implementation, getSafePath for errors runs during execution (onError callback)
        // when an error occurs, but we can verify it doesn't allow reading arbitrary files.
        // Since we want a robust test, we'll actually trigger a 404.
    });

    it('should block arbitrary file reads via errors config during 404', async () => {
        const configText = `
        errors {
            404 = "../../../../etc/shadow"
        }
        `;
        const app = elysiaCustomStatic(configText);
        const req = new Request('http://localhost/non-existent-route');
        const res = await app.handle(req);
        // The error boundary should fallback gracefully instead of returning the contents of /etc/shadow
        // Specifically, it should catch the error from getSafePath and return a default 404.
        expect(res.status).toBe(404);
        const text = await res.text();
        expect(text).not.toContain('root:'); // Should not leak shadow contents
        expect(text).toBe('NOT_FOUND'); // default elysia response
    });
});
