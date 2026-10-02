import { describe, expect, it, mock, spyOn } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Prevention', () => {
    it('should prevent path traversal via logger.file', async () => {
        const configText = `
logger {
    level = "info"
    file = "../../../etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);

        // Mock console.error to intercept the security error
        const consoleSpy = spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});

        // Mock Bun.write to ensure it isn't called with an unsafe path
        const writeSpy = spyOn(Bun, 'write');
        writeSpy.mockImplementation(() => Promise.resolve(0));

        await app.handle(new Request('http://localhost/'));

        expect(consoleSpy).toHaveBeenCalledWith('Security Error: Invalid log file path detected');
        expect(writeSpy).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
        writeSpy.mockRestore();
    });

    it('should prevent path traversal via errors array', async () => {
        const configText = `
errors {
    404 = "../../../etc/shadow"
}
`;
        const app = elysiaCustomStatic(configText);

        const fileSpy = spyOn(Bun, 'file');

        const response = await app.handle(new Request('http://localhost/notfound'));
        expect(response.status).toBe(404);

        // Since safeResolve throws, Bun.file should never be reached in the fallback
        // The error handler catches the exception silently (fallback safely without exposing)
        expect(fileSpy).not.toHaveBeenCalled();

        fileSpy.mockRestore();
    });

    it('should prevent absolute paths in logger.file', async () => {
        const configText = `
logger {
    level = "info"
    file = "/etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);

        const consoleSpy = spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});

        const writeSpy = spyOn(Bun, 'write');
        writeSpy.mockImplementation(() => Promise.resolve(0));

        // It shouldn't resolve to /etc/passwd but strip the slash.
        // It should resolve inside cwd /etc/passwd which is safe or catch if not.

        await app.handle(new Request('http://localhost/'));

        // The stripped string will be 'etc/passwd' resolving safely into the current project,
        // so it wouldn't hit the traversal throw, but it WILL write inside the cwd (which is the intended behavior).
        // Let's verify it gets correctly modified to be inside the cwd

        expect(consoleSpy).not.toHaveBeenCalledWith('Security Error: Invalid log file path detected');

        // Let's grab the actual arguments it called Bun.write with:
        const writeCalls = writeSpy.mock.calls;
        if(writeCalls.length > 0) {
            expect(writeCalls[0][0].startsWith(process.cwd())).toBe(true);
        }

        consoleSpy.mockRestore();
        writeSpy.mockRestore();
    });
});
