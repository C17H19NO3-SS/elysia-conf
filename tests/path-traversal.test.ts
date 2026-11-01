import { expect, test, afterAll } from "bun:test";
import { elysiaCustomStatic } from "../src/index";
import { unlink } from "node:fs/promises";
import { join } from "path";

test("logger file path traversal prevents writing out of bounds", async () => {
    const configText = `
logger {
    level = "info"
    file = "../../../etc/passwd"
}
    `;
    const app = elysiaCustomStatic(configText);
    const req = new Request("http://localhost/");

    await app.handle(req);

    // Wait a brief moment to allow fire-and-forget write to occur
    await new Promise(resolve => setTimeout(resolve, 50));

    // We expect Bun.write to be called with '<cwd>/etc/passwd', creating the file.
    // Let's assert that the file exists to prove our path sanitization worked (as opposed to writing to /etc/passwd).
    const safeFilePath = join(process.cwd(), "etc/passwd");
    const file = Bun.file(safeFilePath);
    expect(await file.exists()).toBe(true);

    // Clean it up
    await unlink(safeFilePath);
});

test("error file path traversal prevents reading out of bounds", async () => {
    const configText = `
errors {
    404 = "../../../etc/passwd"
}
    `;
    const app = elysiaCustomStatic(configText);
    const req = new Request("http://localhost/not-found");
    const res = await app.handle(req);

    try {
        await res.text();
        expect().fail("Should have thrown ENOENT");
    } catch (e: any) {
        expect(e.code).toBe("ENOENT");
    }
});

afterAll(async () => {
    // clean up empty directory if possible
    try {
        const { rmdir } = await import("node:fs/promises");
        await rmdir(join(process.cwd(), "etc"));
    } catch (e) {
        // ignore
    }
});
