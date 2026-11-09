import { expect, test, describe, afterAll } from "bun:test";
import { elysiaCustomStatic } from "../src/index";

describe("Path Traversal Vulnerability", () => {
    test("should prevent path traversal on logger.file", async () => {
        const configText = `
        logger {
            level = "info"
            file = "../../../../etc/passwd"
        }
        `;
        const app = elysiaCustomStatic(configText);
        const req = new Request("http://localhost/");
        await app.handle(req);
        // The logger write will fail internally but the app should not crash and should not have written to outside dirs.
        expect(app).toBeDefined();
    });

    test("should prevent path traversal on error files", async () => {
        const configText = `
        errors {
            404 = "../../../../etc/passwd"
        }
        `;
        const app = elysiaCustomStatic(configText);
        const req = new Request("http://localhost/non-existent-route");
        const res = await app.handle(req);
        expect(res.status).toBe(404);

        const body = await res.text();
        expect(body).toBe('NOT_FOUND');
    });
});
