import { expect, test, afterAll } from "bun:test";
import { elysiaCustomStatic } from "../src/index";
import { rm } from "fs/promises";
import { join } from "path";

afterAll(async () => {
    try {
        await rm(join(process.cwd(), "tmp/hacked2.log"));
    } catch(e) {}
});

test("logger file path traversal prevention", async () => {
    const configText = `
logger {
    level = "info"
    file = "../../../../tmp/hacked2.log"
}
    `;
    const app = elysiaCustomStatic(configText);
    const req = new Request("http://localhost/");
    await app.handle(req);

    // We can check that the file was NOT created outside cwd
    const systemFile = Bun.file("/tmp/hacked2.log");
    const existsSystem = await systemFile.exists();
    expect(existsSystem).toBe(false);
});

test("error file path traversal prevention", async () => {
    const configText = `
errors {
    404 = "../../../../etc/passwd"
}
    `;
    const app = elysiaCustomStatic(configText);
    const req = new Request("http://localhost/non-existent-path");
    const res = await app.handle(req);

    expect(res.status).toBe(404);
});
