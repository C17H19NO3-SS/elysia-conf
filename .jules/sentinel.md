## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2024-05-24 - [Path Traversal in Static Asset Resolution]
**Vulnerability:** Path traversal vulnerabilities (allowing access outside specified \`static.dir\`)
**Learning:** Using untrusted/un-normalized configuration values directly in file-system or static routing setups allows config authors (or injected configs) to expose critical server paths like \`/etc/passwd\`.
**Prevention:** Always normalize and bound static paths using a \`safeJoin\` pattern against the current working directory, throwing a secure error if traversal outside the bounds is attempted.
