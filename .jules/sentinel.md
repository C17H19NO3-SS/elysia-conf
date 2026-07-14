## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2024-07-14 - Fix ReDoS vulnerability in string lexing rule
**Vulnerability:** A Regular Expression Denial of Service (ReDoS) vulnerability existed in the `moo` lexer configuration for parsing string literals (`/"(?:\\["\\]|[^\n"\\])*"/`). Malicious inputs with long sequences of unescaped backslashes or unmatched quotes could trigger catastrophic backtracking, consuming CPU and freezing the parser.
**Learning:** Overlapping alternatives and unbounded repetition in regex rules (`(?:A|B)*`) without proper mutual exclusion can cause catastrophic backtracking in string lexing during parsing.
**Prevention:** Avoid overlapping characters in repeated groups by using mutually exclusive sets, e.g., using `(?:[^"\n\\]|\\[\s\S])*` to safely parse escaped characters and text without backtracking overhead.
