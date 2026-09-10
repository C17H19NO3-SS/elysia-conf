import { describe, expect, it, spyOn } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('Path Traversal Security Tests', () => {
    it('should throw or handle error on logger traversal', async () => {
        const configText = `
logger {
    level = "info"
    file = "../../../tmp/hacked.log"
}
`;
        const consoleSpy = spyOn(console, 'error');
        const app = elysiaCustomStatic(configText);
        app.get('/trigger-log', () => 'Log me');

        await app.handle(new Request('http://localhost/trigger-log'));

        expect(consoleSpy).toHaveBeenCalledWith('Log file path error:', expect.anything());
        consoleSpy.mockRestore();
    });

    it('should use default public dir on static assets traversal', () => {
        const configText = `
static {
    dir = "../../../../etc/passwd"
    route = "/static"
}
`;
        const consoleSpy = spyOn(console, 'error');
        const app = elysiaCustomStatic(configText);

        expect(consoleSpy).toHaveBeenCalledWith('Static assets path error:', expect.anything());
        consoleSpy.mockRestore();
    });

    it('should fallback on error boundaries traversal', async () => {
        const configText = `
errors {
    404 = "../../../../etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);
        app.get('/valid', () => 'Valid');

        const response = await app.handle(new Request('http://localhost/not-found-route'));

        expect(response.status).toBe(404);
        const text = await response.text();
        expect(text).toBe('NOT_FOUND');
    });

    it('should work normally for safe paths', async () => {
        const logFile = 'tests/temp_test.log';
        const configText = `
logger {
    level = "info"
    file = "${logFile}"
}
`;
        const app = elysiaCustomStatic(configText);
        app.get('/trigger-log', () => 'Log me');

        await app.handle(new Request('http://localhost/trigger-log'));

        expect(existsSync(join(process.cwd(), logFile))).toBe(true);

        if (existsSync(join(process.cwd(), logFile))) {
            unlinkSync(join(process.cwd(), logFile));
        }
    });
});
