import { expect, test, describe } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Prevention', () => {
    test('Should prevent traversal in error boundary files', async () => {
        const configText = `
errors {
    404 = "../package.json"
}
`;
        const app = elysiaCustomStatic(configText);
        const req = new Request('http://localhost/not-found');
        const res = await app.handle(req);

        // It shouldn't read the file or set the body to package.json content
        const body = await res.text();
        expect(body).not.toContain('"name": "ss"');
    });

    test('Should prevent traversal in logger file', async () => {
        const configText = `
logger {
    level = "info"
    file = "../temp.log"
}
`;
        const app = elysiaCustomStatic(configText);
        const req = new Request('http://localhost/');
        const res = await app.handle(req);
        // Path traversal should throw/catch error without crashing or writing to unauthorized paths
        expect(res.status).toBe(404); // returns NOT_FOUND by default in elysia
    });
});
