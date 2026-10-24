## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2024-05-18 - [Path Traversal in Configuration Loading]
**Vulnerability:** Path traversal in `logger.file`, `static.dir`, and `errors` allowed accessing arbitrary files.
**Learning:** Configurable paths mapping directly to filesystem calls without bounds checking are inherently unsafe.
**Prevention:** Always parse, normalize, and validate custom file paths explicitly using `resolve` and bounds check to ensure it stays within the current working directory.
