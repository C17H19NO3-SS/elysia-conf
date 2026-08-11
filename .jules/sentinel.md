## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2024-10-24 - [Path Traversal in Dynamic Configuration Evaluators]
**Vulnerability:** Path traversal vectors exposed through user-controlled error boundary configs (errors `404`, `500`) and logger output destinations that are fed directly into `Bun.file()` and `Bun.write()`.
**Learning:** Even when the primary static asset routing uses secure plugins (`@elysiajs/static`), secondary I/O operations dynamically mapped from configuration values can inadvertently bypass root-level constraints and expose arbitrary internal file descriptors.
**Prevention:** Always wrap arbitrary path inputs dynamically generated or extracted from configuration syntax graphs inside `path.normalize()` constraints against `process.cwd()` before opening raw filesystem handles.
