## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-24 - [Fix Path Traversal in Custom Log/Error configurations]
**Vulnerability:** Path traversal vulnerabilities (allowing access outside specified `static.dir` or working directory) via unvalidated `config.logger.file` and `errorFile` properties mapping to `Bun.write()` and `Bun.file()`.
**Learning:** Raw string inputs assigned inside dynamic configurations should not directly resolve file I/O operations without explicit constraint validation mapping back to an acceptable boundary directory (like `process.cwd()`).
**Prevention:** Use a sanitization utility `safeResolvePath(unsafePath: string)` that checks whether the `resolve`'d path explicitly starts with the sanitized base directory (plus path separator), otherwise throws a validation error.
