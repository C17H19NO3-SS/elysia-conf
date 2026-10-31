## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2023-10-31 - [Path Traversal in Dynamic File Configs]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where unvalidated paths from `config.logger.file` and `config.errors` were passed directly to `Bun.write` and `Bun.file`.
**Learning:** Custom configurations can supply malicious `../` sequences to escape the server root, allowing unauthorized access to system files or arbitrary file writing when error or logging mechanisms are triggered.
**Prevention:** Ensure all file paths originating from user or configuration inputs are sanitized and explicitly bound to the intended working directory using a secure path joining utility.
