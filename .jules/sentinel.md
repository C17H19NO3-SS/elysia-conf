## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-24 - [Fix Path Traversal in dynamic file paths]
**Vulnerability:** Path traversal vulnerabilities in error boundaries and logger file creation logic. `Bun.write` and `Bun.file` in the custom plugin wrapper took strings parsed from the user configuration without sanitizing them. Absolute paths (e.g. `/etc/passwd`) or relative traversal vectors (e.g. `../../../sensitive`) allowed access beyond the application root.
**Learning:** We need to explicitly strip absolute path prefixes and then restrict access strictly inside the boundaries of `process.cwd()`. Simply removing `../` regex is not sufficient since `join()` automatically handles those normally, but bypassing absolute path resolution is key to keeping paths within the base directory.
**Prevention:** Apply the `safeJoin` wrapper utility any time an external or configuration-provided path is evaluated in local fs operations.
