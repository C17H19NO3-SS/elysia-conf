## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-18 - [Path Traversal via Configuration Values]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where unvalidated paths from the parsed configuration file (such as `logger.file` and `errors[code]`) were directly passed to `Bun.write()` and `Bun.file()`. This allows writing to or reading from files outside of the intended project root directory using `../` sequences or absolute paths.
**Learning:** Configurable file paths must always be properly sanitized and bound to the server's running directory (`process.cwd()`) before performing any I/O operations, to prevent unauthorized filesystem access.
**Prevention:** Implement a `safeJoin()` function using `path.normalize()` and `path.resolve()` with bound validation checks (`startsWith`) to ensure all generated paths reside securely within the intended base directory.
