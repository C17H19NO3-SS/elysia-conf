import { expect, test } from "bun:test";
import { elysiaCustomStatic } from "../src/index";

test("path traversal in errors file", async () => {
    const configText = `
errors {
    404 = "../../../../../../../../../../../../../etc/passwd"
}
    `;
    const app = elysiaCustomStatic(configText);
    const response = await app.handle(new Request('http://localhost/not-found-route'));
    const text = await response.text();
    expect(text).not.toContain("root:x:0:0:root");
});

test("path traversal in logger file", async () => {
    const configText = `
logger {
    level = "info"
    file = "../../../../../../tmp/pwned2.log"
}
    `;
    const app = elysiaCustomStatic(configText);
    await app.handle(new Request('http://localhost/'));

    let exists = false;
    try {
        await Bun.file("/tmp/pwned2.log").text();
        exists = true;
    } catch(e) {}
    expect(exists).toBe(false);
});
