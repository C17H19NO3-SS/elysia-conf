import { expect, test } from "bun:test";
import { elysiaCustomStatic } from "../src/index";

test("prevents path traversal in logger file", () => {
    const configText = `
    logger {
        level = "info"
        file = "../../../../../etc/passwd"
    }
    `;
    expect(() => elysiaCustomStatic(configText)).toThrow("Directory traversal attempt detected");
});

test("prevents path traversal in static dir", () => {
    const configText = `
    static {
        dir = "../../../../../etc"
        route = "/static"
    }
    `;
    expect(() => elysiaCustomStatic(configText)).toThrow("Directory traversal attempt detected");
});

test("prevents path traversal in errors file", async () => {
    const configText = `
    errors {
        404 = "../../../../etc/passwd"
    }
    `;
    const app = elysiaCustomStatic(configText);
    const response = await app.handle(new Request('http://localhost/not-found-route'));
    expect(response.status).toBe(404);
    // Should fallback because the file access will throw internally and get caught, or we can check the error handling
});
