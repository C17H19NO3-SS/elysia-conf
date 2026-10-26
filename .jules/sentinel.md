## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-03-24 - [Directory Traversal via Custom Config Asset Paths]
**Vulnerability:** CRITICAL path traversal vulnerability found in `src/index.ts` where unvalidated paths from the custom configuration file (`config.static.dir`, `config.logger.file`, `config.errors`) were passed directly into file reading/writing contexts (like `Bun.file` or `Bun.write`).
**Learning:** Because the parser accepts any string for paths and doesn't enforce bounds on asset reading and logger paths, attackers could maliciously write a configuration reading the `/etc/passwd` file or other sensitive internal assets.
**Prevention:** Always sanitize dynamically constructed or provided system file paths using `path.resolve` and check if the resulting path starts with `process.cwd()` to bound operations strictly within the project directory tree.
