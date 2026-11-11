## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-24 - [Path Traversal in Dynamic Configurations]
**Vulnerability:** Path traversal vulnerabilities allowed malicious configuration files to write server logs outside the working directory (via `config.logger.file`) or read arbitrary server files (via `config.errors`).
**Learning:** Configurable paths passed directly to `Bun.write` or `Bun.file` can be exploited if they are not explicitly validated and bounded to an expected base directory.
**Prevention:** All dynamically configured filesystem paths must be explicitly sanitized, resolved to their absolute paths, and verified to strictly reside within the intended base directory (e.g., `process.cwd()`) using a boundary check like `.startsWith(resolve(baseDir) + sep)`.
