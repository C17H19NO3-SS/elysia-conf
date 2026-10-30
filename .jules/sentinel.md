## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-18 - [Path Traversal in Custom File Paths]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where custom logger and error file paths specified in the configuration were not sanitized or restricted to the project root directory, allowing arbitrary file read/write (e.g. `../../../../etc/passwd`).
**Learning:** When passing dynamic user-configured paths to file system APIs like `Bun.write` and `Bun.file`, we must assume the input can be malicious and contain directory traversal sequences like `../`.
**Prevention:** Ensure all dynamically configured paths are explicitly sanitized, normalized, and bounded to the intended base directory (like `process.cwd()`) before being used.
