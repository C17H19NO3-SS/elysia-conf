## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2023-10-25 - [CRITICAL] Path Traversal in File Loaders
**Vulnerability:** The logger file output path (`logger.file`) and the error file load paths (`errors`) allowed for standard `../` directory traversals. Because `Bun.write` and `Bun.file` operate at the system level and were fed unvalidated config strings directly, any file in the file system could theoretically be overwritten (via logger) or read (via errors output) by someone controlling the configuration.
**Learning:** External or parsed strings must never be trusted directly in Node/Bun filesystem APIs without bounding paths inside the intended workspace directory.
**Prevention:** Always parse and resolve string routes against `process.cwd()` using a rigid validation utility like `safeJoin` which throws an error if a resolved path attempts to step above the base directory.
