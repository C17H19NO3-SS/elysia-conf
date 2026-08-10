## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2024-05-18 - [Path Traversal in Error Boundaries]
**Vulnerability:** The error handling boundaries in `src/index.ts` passed custom user-defined file paths directly to `Bun.file` without validating that they stayed within the intended directory. This allowed directory traversal where paths like `../../../../../etc/passwd` would resolve and leak arbitrary system files if an error was triggered.
**Learning:** External user inputs specifying paths inside the server configuration blocks must not be implicitly trusted when calling filesystem APIs like `Bun.file`, which resolve paths transparently.
**Prevention:** Always implement a validation mechanism (`safeJoin`) that normalizes paths and enforces a boundary check against the base directory (`process.cwd()`) before file access occurs.
