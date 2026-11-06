## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2024-05-18 - [Path Traversal in Dynamically Configured Paths]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where dynamically configured paths for log files and error boundaries (`config.logger.file` and `config.errors?.[errorCode]`) were directly passed to `Bun.write` and `Bun.file` without sanitization.
**Learning:** Even though Elysia handles static asset path traversal internally, custom file handling using Bun's native filesystem APIs must be manually sanitized. Any configuration values directly mapping to filesystem operations bypass web-framework security measures.
**Prevention:** All user-provided or dynamically parsed paths must be resolved and explicitly validated to reside within the intended base directory (e.g. `process.cwd()`).
