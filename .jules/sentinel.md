## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2026-09-24 - [Path Traversal in Dynamically Configured Paths]
**Vulnerability:** Path traversal vulnerabilities in `Bun.write` (logger files) and `Bun.file` (error boundaries) allowing dynamic configs to escape the project directory context.
**Learning:** Configurations generated dynamically (such as file paths) can bypass expected static path limitations if they aren't explicitly sanitized, resulting in unauthorized reading or writing to the server filesystem.
**Prevention:** Use a standard sanitization function (e.g. `safeJoin`) utilizing `normalize`, `replace`, and boundary checks (`startsWith`) to ensure dynamic file paths are properly constrained to the `process.cwd()` or other explicit boundaries.
