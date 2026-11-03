## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-18 - [Path Traversal in Custom Parser Configurations]
**Vulnerability:** Path traversal vulnerability found in `src/index.ts` where user-defined file paths in the configuration for error boundaries (`errors { 404 = "../etc/passwd" }`) and logger targets were passed directly to `Bun.file()` and `Bun.write()` without sanitization.
**Learning:** Even though configurations may seem internal, dynamically parsed configuration paths allow absolute or traversal paths to escape the intended directory scope, allowing reading arbitrary files like `/etc/passwd` via triggered 404 routes or arbitrary file writes during logging.
**Prevention:** All dynamic file paths passed from custom configuration parsers to filesystem APIs must be resolved and explicitly bounded to the intended working directory using `path.resolve` and strict prefix checking (`resolvedPath.startsWith(baseDir + path.sep)`).
