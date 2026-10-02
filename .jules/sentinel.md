## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2025-02-14 - [Path Traversal in Configuration Parsers]
**Vulnerability:** Path traversal via unsanitized user-supplied paths passed into `Bun.file()` and `Bun.write()`.
**Learning:** Configurations providing dynamic file paths (e.g. `logger.file` or `errors` boundaries) can trivially escape application constraints if an absolute path (`/etc/shadow`) or traversing path (`../../`) is fed directly into system I/O handlers.
**Prevention:** Always strip leading absolute path identifiers (e.g. `/, C:\`) and rigorously resolve configured paths against a strict base directory context (e.g. `process.cwd()`), throwing hard exceptions if the final normalized path escapes the authorized project root boundaries.
