import { test, expect, afterAll } from "bun:test";
import { elysiaCustomStatic } from "../src/index.ts";
import { unlinkSync, existsSync } from "fs";
import { join } from "path";

const tempLog = join(process.cwd(), "tests/temp_test.log");

afterAll(() => {
    if (existsSync(tempLog)) {
        unlinkSync(tempLog);
    }
});

test("Path traversal in errors boundary", async () => {
    const config = `
errors {
    404 = "../../../../etc/passwd"
}
`;
    const app = elysiaCustomStatic(config);
    const req = new Request("http://localhost/not-found");
    const res = await app.handle(req);
    expect(res.status).toBe(404);
});

test("Path traversal in logger boundary", async () => {
    const config = `
logger {
    level = "info"
    file = "../../../../etc/passwd"
}
`;
    const app = elysiaCustomStatic(config);
    const req = new Request("http://localhost/");
    const res = await app.handle(req);
    expect(res.status).toBe(404);
});
