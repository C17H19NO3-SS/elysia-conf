## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-11-08 - [Path Traversal in logger and errors via config]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where unvalidated paths from the parsed config file were being passed to `Bun.file()` and `Bun.write()`.
**Learning:** Because config.logger.file and config.errors files were not bounded to `process.cwd()`, a user could potentially supply `../../../../../etc/passwd` to leak sensitive server files via the Error Boundaries (404/500 handler) or overwrite files via the logger plugin.
**Prevention:** All custom path strings mapped from a configuration file that lead to a filesystem operation (`Bun.file` or `Bun.write`) must be normalized and bounded strictly within `process.cwd()` using a safe path join utility.
