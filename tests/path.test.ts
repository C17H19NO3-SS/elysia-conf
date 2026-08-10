import { test, expect } from "bun:test";
import { elysiaCustomStatic } from "../src/index";

test("path traversal error", async () => {
    const app = elysiaCustomStatic(`
        errors {
            404 = "../../../../../../../../etc/passwd"
        }
    `);

    // Check if error handler reads arbitrary files when an error is triggered
    const req = new Request("http://localhost/notfound");
    const res = await app.handle(req);
    const body = await res.text();

    // Fallback behavior kicks in, so it returns NOT_FOUND text rather than throwing an internal error to the user
    expect(body).toBe("NOT_FOUND");
    expect(body).not.toContain("root:x:");
});
