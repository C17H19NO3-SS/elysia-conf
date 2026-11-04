## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-11-04 - [Path Traversal in Configured File Paths]
**Vulnerability:** The parsed configuration allows passing raw file paths into `Bun.file` and `Bun.write` (e.g. `logger.file` and `errors` mapping), leading to path traversal allowing out-of-bounds file reads and writes.
**Learning:** Configurations derived from a parser need to treat file system interactions as untrusted input. Just parsing the syntax correctly doesn't mean the data inside is safe.
**Prevention:** Always normalize and bound parsed file paths strictly to `process.cwd()` using `path.resolve` and verify that `resolvedPath.startsWith(resolve(process.cwd()) + path.sep)` before using them in runtime filesystem APIs.
