## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2024-11-10 - Fix Path Traversal in File Inputs
**Vulnerability:** Path traversal vulnerabilities allowing arbitrary read/write access via `logger.file` and `errors[code]` assignments.
**Learning:** `Bun.file` and `Bun.write` do not sanitize inputs natively when passed relative paths containing traversal sequences (`../`), meaning any dynamically provided configuration string pointing to the filesystem can lead to critical server compromise.
**Prevention:** Always parse and resolve paths explicitly against a secure base boundary (e.g., `process.cwd()`) and validate using string prefix bounds before executing filesystem operations.
