## 2023-10-27 - [Prototype Pollution via Lexer Parser]
**Vulnerability:** Prototype pollution vector found in `src/lib/parser.ts` where arbitrary keys parsed from the configuration format (like `__proto__`, `constructor`, `prototype`) could be assigned directly to object structures (`config` or `currentBlock`).
**Learning:** Because the parser maps configuration keys to Javascript object properties natively without sanitization, malicious blocks or assignments allow attackers to pollute the global Object prototype context across the Node/Bun environment.
**Prevention:** Explicit validation must be enforced on all dynamic key variables fetched from token streams before they are used as object properties to ensure they are not reserved Javascript metaproperties.

## 2024-05-18 - Catastrophic Backtracking in Lexer Strings
**Vulnerability:** A Regular Expression Denial of Service (ReDoS) vulnerability in the string rule of the moo lexer (`/"(?:\\["\\]|[^\n"\\])*"/`) causing catastrophic backtracking when processing long strings with many backslashes that ultimately fail to match.
**Learning:** Writing regex that involves repeating a non-capturing group with alternatives `(a|b)*` is highly prone to catastrophic backtracking if the alternatives aren't strictly mutually exclusive or if standard constraints aren't used.
**Prevention:** Use a stricter matching pattern `(?:[^"\n\\]|\\.)*` which definitively separates backslash sequences and regular string characters, avoiding overlapping match paths in the regex engine.
