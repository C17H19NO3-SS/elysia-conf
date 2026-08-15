## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-08-15 - Prevented Path Traversal in Error File Resolution
**Vulnerability:** The error fallback configuration `errors { 404 = "../../etc/passwd" }` directly called `Bun.file(errorFile)` without validating if the resolved path escaped the current working directory, potentially leaking sensitive system files.
**Learning:** `Bun.file()` does not perform innate sandbox checking against directory traversal paths relative to a specific base directory when given a path directly.
**Prevention:** Always use `path.resolve` to normalize the path and `path.sep` check alongside `startsWith(baseDir)` to strictly enforce sandbox boundaries when accepting user/config file inputs for file serving.
