## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2026-10-21 - [Path Traversal in Elysia Config Path Resolution]
**Vulnerability:** Path traversal vulnerability allowed paths configured for `logger.file`, `static.dir`, and `errors` inside the `.config` format to bypass the root directory restriction via `../../../` sequences, allowing arbitrary system reads and writes (e.g., /etc/passwd).
**Learning:** Configurable file paths dynamically executed inside plugins like `@elysiajs/static` or direct `Bun.write()` calls did not validate or boundary-check user input path resolutions against `process.cwd()`.
**Prevention:** Always implement standard `path.resolve` mapping and explicitly validate that the resolved path resides exactly within the intended base directory using `resolvedPath.startsWith(baseDir + sep)` instead of purely trusting user configurations or relying on regex sanitizations that can be bypassed or break legitimate inputs.
