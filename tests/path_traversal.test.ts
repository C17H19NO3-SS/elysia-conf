import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal protection', () => {
    it('should prevent path traversal attempt in error config', async () => {
        const configText = `
errors {
    404 = "../../../../etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);

        const req = new Request('http://localhost/non-existent-page');
        const res = await app.handle(req);

        expect(res.status).toBe(404);

        // Using await res.text() on a Response(Bun.file) might throw ENOENT if the file doesn't exist asynchronously.
        // The main point is that it was bounded correctly to the app directory and failed to find /etc/passwd inside it.
        // We catch it and verify.
        await expect(res.text()).rejects.toThrow('no such file or directory');
    });

    it('should allow valid error config paths', async () => {
        // create a temporary file inside the project
        const tempErrorFile = './tests/temp_404.html';
        await Bun.write(tempErrorFile, '<h1>Custom 404</h1>');

        const configText = `
errors {
    404 = "tests/temp_404.html"
}
`;
        const app = elysiaCustomStatic(configText);

        const req = new Request('http://localhost/non-existent-page');
        const res = await app.handle(req);

        expect(res.status).toBe(404);
        const text = await res.text();
        expect(text).toContain('<h1>Custom 404</h1>');

        // clean up
        const { unlink } = require('fs/promises');
        await unlink(tempErrorFile);
    });
});
