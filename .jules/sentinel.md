## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2023-10-27 - [Path Traversal in static file paths]
**Vulnerability:** Path traversal vulnerability in `src/index.ts` where dynamic configuration paths (`config.logger.file`, `config.errors[errorCode]`) were not validated to be inside the current working directory, allowing arbitrary file read and write operations.
**Learning:** When using Elyisa or Bun primitives (`Bun.write`, `Bun.file`), any dynamic file paths derived from configurations must be explicitly resolved and constrained.
**Prevention:** Use `resolve` and `startsWith(baseDir + sep)` from the Node `path` module to ensure that all dynamic paths are safely restricted to the intended directory bounds.
