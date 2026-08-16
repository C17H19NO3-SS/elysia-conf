## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2025-02-26 - [Path Traversal in Configurator File Outputs]
**Vulnerability:** Path traversal in custom logging (`config.logger.file`) and error file boundaries (`config.errors`).
**Learning:** The configuration paths for output logs and fallback HTML error templates were blindly wrapped in `Bun.write` and `Bun.file` without validating if the paths navigated outside the current working directory.
**Prevention:** Implement a standard `safeJoin` validation to sanitize and lock file operations to within the safe bounds of `process.cwd()` or a configured base directory.
