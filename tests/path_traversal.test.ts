import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { elysiaCustomStatic } from "../src/index";
import { unlink } from "node:fs/promises";
import { existsSync } from "node:fs";

describe("Path Traversal Vulnerabilities", () => {
    it("should prevent absolute paths on log file", async () => {
        const configText = `
        logger {
            level = "info"
            file = "/tmp/temp_traversal.log"
        }
        `;
        const app = elysiaCustomStatic(configText);

        await app.handle(new Request("http://localhost/"));

        // Let event loop run to write the file
        await new Promise(r => setTimeout(r, 100));

        const fileExists = existsSync("/tmp/temp_traversal.log");
        if (fileExists) {
            await unlink("/tmp/temp_traversal.log");
        }
        expect(fileExists).toBe(false);
    });

    it("should prevent directory traversal on log file", async () => {
        const configText = `
        logger {
            level = "info"
            file = "../tests/temp_traversal.log"
        }
        `;
        const app = elysiaCustomStatic(configText);

        await app.handle(new Request("http://localhost/"));

        // Let event loop run to write the file
        await new Promise(r => setTimeout(r, 100));

        const fileExists = existsSync("../tests/temp_traversal.log");
        if (fileExists) {
            await unlink("../tests/temp_traversal.log");
        }
        expect(fileExists).toBe(false);
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
        expect(text).not.toContain('"name": "ss"'); // package.json content
    });
});
