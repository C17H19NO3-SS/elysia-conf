## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2023-10-27 - [Path Traversal in Logger and Error Boundaries]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where unvalidated paths from custom configuration (`config.errors` and `config.logger.file`) could result in reading or writing arbitrary files outside the intended web root scope.
**Learning:** Configurable paths bound to `Bun.file()` or `Bun.write()` run natively inside the Node/Bun environment space; without boundaries, relative strings like `../../` allow traversal against `process.cwd()`. The solution forces relative mappings to the intended path and verifies it strictly matches the base prefix structure.
**Prevention:** All user-provided paths configured dynamically (especially error fallbacks or custom write targets) must be standardized, normalized and prefix-checked against a designated secure base path.
