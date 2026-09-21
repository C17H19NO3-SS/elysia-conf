## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-24 - [CRITICAL] Path Traversal in Elysia Config Plugin
**Vulnerability:** The custom configuration plugin allowed directory traversal vectors (`../`) when dynamically resolving user-supplied values for `config.logger.file`, `config.static.dir`, and `config.errors?.[errorCode]`. These paths were directly passed into sensitive runtime operations (`Bun.write`, `Bun.file`, and `staticPlugin`), allowing external assets or logs to target arbitrary local server files (e.g., `/etc/passwd`).
**Learning:** Raw dynamic configuration values mapping directly into disk operations require strict boundary constraints in Node/Bun runtimes, as the standard API will not sanitize inputs to the execution workspace natively.
**Prevention:** Always normalize and firmly bound configured path scopes to `process.cwd()` using `path.resolve` and `path.sep` prior to invoking localized file execution processes.
