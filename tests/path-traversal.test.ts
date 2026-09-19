import { describe, expect, it, afterAll } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

describe('Path Traversal Prevention', () => {
    let app: any;

    afterAll(() => {
        try {
            if (existsSync('tests/temp_test.log')) unlinkSync('tests/temp_test.log');
            if (existsSync('etc/passwd')) unlinkSync('etc/passwd');
            if (existsSync('etc')) import('fs').then(fs => fs.rmdirSync('etc'));
            if (existsSync('public/etc/passwd')) unlinkSync('public/etc/passwd');
            if (existsSync('public/etc')) import('fs').then(fs => fs.rmdirSync('public/etc'));
        } catch (e) {
            // Ignore
        }
    });

    it('should sanitize path traversal in logger file path', async () => {
        const configText = `
logger {
    level = "info"
    file = "../../../etc/passwd"
}
`;
        app = elysiaCustomStatic(configText);

        app.get('/', () => 'Hello');
        await app.handle(new Request('http://localhost/'));

        await new Promise(r => setTimeout(r, 100));

        const sanitizedPath = join(process.cwd(), 'etc/passwd');
        expect(existsSync(sanitizedPath)).toBe(true);
        expect(existsSync('/tmp/should-not-exist')).toBe(false);
    });

    it('should prevent path traversal in error boundaries file path', async () => {
        const configText = `
errors {
    404 = "/etc/passwd"
}
`;
        app = elysiaCustomStatic(configText);

        const response = await app.handle(new Request('http://localhost/not-found'));
        expect(response.status).toBe(404);

        const text = await response.text();
        expect(text).not.toContain('root:x:0:0');
    });

    it('should prevent path traversal in static assets directory', async () => {
        const configText = `
static {
    dir = "../../../etc"
    route = "/assets"
}
`;
        app = elysiaCustomStatic(configText);

        // When requesting a known system file if traversal was allowed
        const response = await app.handle(new Request('http://localhost/assets/passwd'));

        // It shouldn't serve /etc/passwd contents, either 404 or an empty file since the folder shouldn't have passwd
        const text = await response.text();
        expect(text).not.toContain('root:x:0:0');
    });
});
