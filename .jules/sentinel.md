## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2026-10-28 - [Path Traversal in Logger and Errors]
**Vulnerability:** Path traversal vulnerability allowed reading or writing arbitrary files via config.logger.file and config.errors.
**Learning:** Passing unsanitized dynamic user input into Bun.file or Bun.write creates a severe risk of accessing unauthorized paths.
**Prevention:** Apply path normalization and restrict resolved paths strictly to the expected base directory (e.g. process.cwd()).
