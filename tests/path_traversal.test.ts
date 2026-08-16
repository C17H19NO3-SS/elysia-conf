import { expect, test } from "bun:test";
import { elysiaCustomStatic } from "../src/index";

test("logger path traversal should be blocked", async () => {
    const errorConfig = `
logger {
    level = "info"
    file = "../../../../tmp/test_logger.log"
}
    `;
    const app = elysiaCustomStatic(errorConfig);
    app.get('/test', () => 'Test'); // only /test exists

    await app.handle(new Request('http://localhost/test'));

    // We expect the log not to be written outside the project directory.
    // safeJoin strips `../` and resolves to the project root: <cwd>/tmp/test_logger.log
    let externalFileExists = false;
    try {
        const file = Bun.file("/tmp/test_logger.log");
        externalFileExists = await file.exists();
    } catch(e) {}
    expect(externalFileExists).toBe(false);

    // Clean up the safely generated test artifact within the project
    import('fs').then(fs => fs.rmSync('tmp', { recursive: true, force: true }));
});

test("error boundary path traversal should be blocked", async () => {
    const errorConfig = `
errors {
    404 = "../../../../etc/passwd"
}
    `;
    const app = elysiaCustomStatic(errorConfig);
    app.get('/test', () => 'Test'); // only /test exists

    const response = await app.handle(new Request('http://localhost/not-found-route'));

    // Since the path resolves to /app/etc/passwd which doesn't exist, Bun.file will cause
    // a rejection that triggers the fallback error handler logic in our plugin.
    // However, since we return a new Response(file) directly without await file.text()
    // or file.exists(), Elysia handles the stream. If the file doesn't exist, it errors on stream consumption.
    // Instead of awaiting text, let's just assert that it is safely contained or fallback returns standard 404.
    const text = await response.text().catch(() => "FILE_READ_ERROR");

    // The fallback file shouldn't be read, so it shouldn't contain passwd info
    expect(text).not.toContain("root:x:0:0");
    // Should fallback to default 404 response
    expect(response.status).toBe(404);
});
