## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2023-10-27 - [Fix Directory Traversal on Configuration Assets]
**Vulnerability:** The configuration parser (`elysiaCustomStatic`) dynamically configured sensitive filesystem properties (`config.logger.file`, `config.static.dir`, and `config.errors[code]`) by directly feeding user input into `Bun.write`, `Bun.file`, and `staticPlugin`, respectively. Without path sanitization, this allowed directory traversal vulnerabilities allowing arbitrary reading/writing of host system files.
**Learning:** Hardcoded fallbacks (`process.cwd()`) must be bound around dynamically resolved file paths configured in parsing systems, since unvalidated input directly cascades to file operations and static routers.
**Prevention:** Always encapsulate runtime dynamic paths fetched from custom syntax configurations through a path normalization/sanitization utility bounding them strictly inside `process.cwd()` before evaluating or utilizing the paths.
