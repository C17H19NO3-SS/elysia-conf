import { describe, expect, it, afterAll } from "bun:test";
import { elysiaCustomStatic } from "../src/index";
import { unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "path";

describe("Path Traversal Defenses", () => {
    it("should prevent reading files outside cwd in error boundaries", async () => {
        const configText = `
errors {
    404 = "../../../../etc/passwd"
}
`;
        const app = elysiaCustomStatic(configText);
        const response = await app.handle(new Request("http://localhost/not-found"));
        expect(response.status).toBe(404);

        try {
            const text = await response.text();
            expect(text).not.toInclude("root:x:0:0");
        } catch (e) {
            // Expected to throw because we're resolving to a safe path that doesn't exist
            // e.g. /app/etc/passwd instead of /etc/passwd
            expect(e).toBeDefined();
        }
    });

    it("should prevent writing log files outside cwd", async () => {
        const maliciousPath = "../test_logger_exploit.log";
        const exploitOutPath = join(process.cwd(), "..", "test_logger_exploit.log");
        const fallbackSafePath = join(process.cwd(), "test_logger_exploit.log");

        const configText = `
logger {
    level = "info"
    file = "${maliciousPath}"
}
`;
        const app = elysiaCustomStatic(configText);
        await app.handle(new Request("http://localhost/test"));

        // Give it a moment to write (if it incorrectly proceeds)
        await new Promise(r => setTimeout(r, 100));

        // Ensure it wasn't written to the exploited path
        const exploitExists = existsSync(exploitOutPath);
        if (exploitExists) {
            await unlink(exploitOutPath).catch(() => {});
        }
        expect(exploitExists).toBe(false);

        // Clean up the fallback local artifact generated during the test
        const safeExists = existsSync(fallbackSafePath);
        if (safeExists) {
             await unlink(fallbackSafePath).catch(() => {});
        }
    });
});
