import { expect, test } from "bun:test";
import { elysiaCustomStatic } from "../src/index";
import fs from "fs";
import { join } from "path";

test("path traversal in errors file should return safe response", async () => {
    const configText = `
errors {
    404 = "../../../../etc/passwd"
}
    `;
    const app = elysiaCustomStatic(configText);
    const response = await app.handle(new Request('http://localhost/not-found-route'));

    // Bun.file throws when response is accessed if it fails. We expect it to fallback safely without exposing file contents out of bounds.
    // If we catch it inside the test, it means the promise from response.text() rejected because the file does not exist, which is correct!
    try {
        const text = await response.text();
        expect(text).not.toContain('root:x:0:0');
    } catch(e) {
        expect((e as Error).code).toBe('ENOENT');
        expect((e as Error).path).not.toBe('/etc/passwd'); // Ensure it didn't try to read actual /etc/passwd
    }

    expect(response.status).toBe(404);
});

test("path traversal in logger file should not write out of bounds", async () => {
    const configText = `
logger {
    level = "info"
    file = "../../../../tmp/test_log_123.txt"
}
    `;
    const app = elysiaCustomStatic(configText);
    await app.handle(new Request('http://localhost/'));

    // Wait for the async write to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    const file = Bun.file("../../../../tmp/test_log_123.txt");
    const realRootTmpExists = await file.exists();

    // It should not exist in the real /tmp directory out of bounds
    expect(realRootTmpExists).toBeFalse();

    // Clean up if it was written into /app/tmp/test_log_123.txt
    const localTmpPath = join(process.cwd(), "tmp/test_log_123.txt");
    if (fs.existsSync(localTmpPath)) {
        fs.unlinkSync(localTmpPath);
        if (fs.existsSync(join(process.cwd(), "tmp"))) {
            // It might throw if tmp has other files, but usually it shouldn't
            try { fs.rmdirSync(join(process.cwd(), "tmp")); } catch(e) {}
        }
    }
});
