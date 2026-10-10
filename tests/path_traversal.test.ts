import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { elysiaCustomStatic } from "../src/index";
import { unlink } from "node:fs/promises";
import { existsSync } from "node:fs";

describe("Path Traversal Vulnerabilities", () => {
    async function testLoggerPath(pathString: string) {
        const configText = `
        logger {
            level = "info"
            file = "${pathString}"
        }
        `;
        const app = elysiaCustomStatic(configText);
        await app.handle(new Request("http://localhost/"));
        await new Promise(r => setTimeout(r, 100));
        const fileExists = existsSync(pathString);
        if (fileExists) {
            await unlink(pathString);
        }
        expect(fileExists).toBe(false);
    }

    it("should prevent absolute paths on log file", async () => {
        await testLoggerPath("/tmp/temp_traversal.log");
    });

    it("should prevent directory traversal on log file", async () => {
        await testLoggerPath("../tests/temp_traversal.log");
    });

    it("should prevent directory traversal on error boundaries", async () => {
        const configText = `
        errors {
            404 = "../package.json"
        }
        `;
        const app = elysiaCustomStatic(configText);
        const res = await app.handle(new Request("http://localhost/notfound"));
        const text = await res.text();
        expect(text).not.toContain('"name": "ss"');
    });
});
