## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2025-02-18 - [Regular Expression Denial of Service (ReDoS) in Lexer String Parsing]
**Vulnerability:** The `moo` lexer configuration in `src/lib/lexer.ts` utilized a string parsing regular expression (`/"(?:\\["\\]|[^\n"\\])*"/`) that was highly vulnerable to catastrophic backtracking when evaluating long strings containing numerous escaped characters but missing a closing quotation mark.
**Learning:** Overlapping and nested repetition quantifiers inside the non-capturing group `(?:...)*` caused the regex engine to explore an exponentially large number of potential matches when the target suffix (the closing quote) was absent. This allowed a small, unclosed configuration payload to freeze the parsing thread.
**Prevention:** Regular expressions used for tokenizing complex string sequences must avoid overlapping quantifiers. The regex was replaced with the optimized, unrolled loop equivalent `/"[^"\\]*(?:\\.[^"\\]*)*"/`, which is deterministic and entirely avoids overlapping backtracking states.
