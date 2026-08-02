## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.
## 2026-08-02 - [Fix] Lexer ReDoS Vulnerability in String Parsing
**Vulnerability:** Regular Expression Denial of Service (ReDoS) found in `src/lib/lexer.ts` string token parsing (`/"(?:\\["\\]|[^\n"\\])*"/`). A string with thousands of unclosed escaped quotes (`"\"\"...`) could stall the event loop due to catastrophic backtracking in the `moo` lexer engine.
**Learning:** Overlapping alternations (`(?:\\["\\]|[^\n"\\])`) inside a repeating group (`*`) allow the regex engine to try exponentially many paths when a match fails at the end.
**Prevention:** Replaced the regex with `/"(?:\\.|[^"\n\\])*"/` which uses mutually exclusive alternation (`\\.` for any escaped character, `[^"\n\\]` for non-escaped non-quote non-newline characters), eliminating the possibility of catastrophic backtracking.
