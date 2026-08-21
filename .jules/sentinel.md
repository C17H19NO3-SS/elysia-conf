## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2025-02-28 - [Path Traversal in Error Boundaries]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where unvalidated paths from the `errors` or `logger.file` configuration block were directly passed to `Bun.file(errorFile)` and `Bun.write(config.logger.file)`.
**Learning:** Configurations providing custom paths for error files or logger files were treated as trusted, which allows an attacker supplying a malformed or external configuration string to read arbitrary system files (e.g., `/etc/passwd`) or write arbitrary files out of the project working directory boundaries.
**Prevention:** All configurable filesystem paths passed dynamically into `Bun.file` and `Bun.write` must be normalized and sanitized, ensuring they resolve completely within the `process.cwd()` to prevent traversal sequences like `../../` from reaching root layers.
