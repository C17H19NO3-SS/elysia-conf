import { test, expect, describe, afterAll } from "bun:test";
import { elysiaCustomStatic } from "../src/index";
import { unlink } from "node:fs/promises";
import { join } from "path";

describe("Path Traversal Vulnerability Checks", () => {
  const dummyLogFile = "tests/temp_test_log.txt";

  afterAll(async () => {
    try {
      await unlink(join(process.cwd(), dummyLogFile));
    } catch (e) {
      // Ignore if file doesn't exist
    }
  });

  test("should prevent path traversal on logger.file", async () => {
    const config = `
      logger {
        level = "info"
        file = "../../etc/passwd"
      }
    `;

    const app = elysiaCustomStatic(config);
    const req = new Request("http://localhost/");

    // Capture console.error
    let capturedError = "";
    const originalConsoleError = console.error;
    console.error = (msg: string, err: any) => {
      capturedError = `${msg} ${err}`;
    };

    await app.handle(req);

    // Restore
    console.error = originalConsoleError;

    expect(capturedError).toContain("Log file write blocked (security):");
    expect(capturedError).toContain("Directory traversal attempt detected");
  });

  test("should allow valid logger.file path", async () => {
    const config = `
      logger {
        level = "info"
        file = "${dummyLogFile}"
      }
    `;

    const app = elysiaCustomStatic(config);
    const req = new Request("http://localhost/");
    await app.handle(req);

    const fileContent = await Bun.file(join(process.cwd(), dummyLogFile)).text();
    expect(fileContent).toContain("GET http://localhost/");
  });

  test("should prevent path traversal on error boundaries", async () => {
    const config = `
      errors {
        404 = "../../../../etc/passwd"
      }
    `;

    const app = elysiaCustomStatic(config);
    // Request a path that does not exist to trigger 404
    const req = new Request("http://localhost/not-found");
    const res = await app.handle(req);

    // If path traversal is blocked, it should just return the default 404 response
    // instead of the file content
    const text = await res.text();
    expect(res.status).toBe(404);
    expect(text).toBe("NOT_FOUND"); // default elysia response
  });
});
