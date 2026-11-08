import { expect, test } from "bun:test";
import { elysiaCustomStatic } from "../src/index";
import { join } from "path";
import { writeFileSync, rmSync, existsSync } from "fs";

test("path traversal in errors file via Bun.file is blocked", async () => {
    // Create secret outside of the working directory
    const testSecretPath = "/tmp/test_secret.txt";
    writeFileSync(testSecretPath, "SECRET_CONTENT_123");

    const configText = `
errors {
    404 = "../../../../../../../../tmp/test_secret.txt"
}
    `;

    const app = elysiaCustomStatic(configText);

    const req = new Request("http://localhost/non-existent-route");
    const res = await app.handle(req);

    // We expect the fallback behavior to happen or ENOENT because path was mapped to /app/tmp/...
    try {
        const text = await res.text();
        expect(text).not.toContain("SECRET_CONTENT_123");
    } catch (e: any) {
        expect(e.code).toBe("ENOENT");
        // Verify it was looking in the safe directory
        expect(e.path).toContain(process.cwd());
    }

    expect(res.status).toBe(404);

    if (existsSync(testSecretPath)) rmSync(testSecretPath);
});

test("path traversal in logger file via Bun.write is blocked", async () => {
    // Target log path outside of the working directory
    const testLogPath = "/tmp/test_traversal.log";
    if (existsSync(testLogPath)) rmSync(testLogPath);

    const configText = `
logger {
    level = "info"
    file = "../../../../../../../../tmp/test_traversal.log"
}
    `;

    const app = elysiaCustomStatic(configText);
    const req = new Request("http://localhost/test-log");
    await app.handle(req);

    await new Promise(r => setTimeout(r, 100));

    // Check if the log file was created outside the boundary (it should not exist)
    expect(existsSync(testLogPath)).toBe(false);
});
