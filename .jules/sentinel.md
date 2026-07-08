## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-25 - [Path Traversal in Custom Error Boundaries]
**Vulnerability:** The custom configuration parser allowed defining files for specific HTTP error boundaries (e.g. 404). These file paths were passed unvalidated to `Bun.file()`, enabling arbitrary file reads on the system via directory traversal sequences (`../../`).
**Learning:** Even internal server configuration parameters read from seemingly "admin" configuration files need strict sanitization when they dictate filesystem interactions, particularly in custom compilers. Trust nothing, even local files.
**Prevention:** Always resolve user-provided file paths to an absolute path against a strict base directory (like `process.cwd()`), and verify that the resulting absolute path remains inside the boundaries of that base directory before passing it to any file operation APIs.
