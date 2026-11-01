## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2023-11-01 - [Path Traversal in Logger and Error Boundaries]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where unsanitized paths (e.g., `logger.file` or `errors` mappings) were passed directly to `Bun.write` and `Bun.file`.
**Learning:** Even when standard utilities like `Bun.write` are used, passing unvalidated configuration paths can allow reading or writing files outside the intended project directory (e.g., `/etc/passwd`).
**Prevention:** All dynamic file paths passed from user configurations must be sanitized and bounded to the current working directory (`process.cwd()`) using a path sanitization function like `safeJoin` with explicit bounds checking.
