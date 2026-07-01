// src/parser.ts
import { lexer } from './lexer';

export function parseConfig(sourceText: string): any {
    lexer.reset(sourceText);

    const config: any = {};
    let currentBlock: any = null;
    let currentBlockName = '';

    // ws (boşluk) ve comment (yorum) token'larını filtreleyen bir helper generator
    const tokenStream = (function* () {
        for (const token of lexer) {
            if (token.type !== 'ws' && token.type !== 'comment' && token.type !== 'nl') {
                yield token;
            }
        }
    })();

    let next = tokenStream.next();

    while (!next.done) {
        const token = next.value;

        if (token.type === 'identifier') {
            const key = token.value;
            next = tokenStream.next();

            if (next.done) break;
            const nextToken = next.value;

            // Durum 1: Değer Ataması (key = value)
            if (nextToken.type === 'assign') {
                next = tokenStream.next(); // Değere geç
                if (next.done) throw new Error(`Eksik değer ataması: ${key}`);

                const valueToken = next.value;
                let value: any = valueToken.value;

                if (valueToken.type === 'boolean') {
                    value = valueToken.value === 'true';
                }

                if (currentBlock) {
                    currentBlock[key] = value;
                } else {
                    config[key] = value;
                }
            }
            // Durum 2: Blok Başlangıcı (static {)
            else if (nextToken.type === 'lbrace') {
                currentBlockName = key;
                currentBlock = {};
            }
        }
        // Durum 3: Blok Kapanışı (})
        else if (token.type === 'rbrace') {
            if (currentBlockName) {
                config[currentBlockName] = currentBlock;
                currentBlock = null;
                currentBlockName = '';
            } else {
                throw new Error("Beklenmeyen kapatma parantezi '}'");
            }
        }

        next = tokenStream.next();
    }

    return config;
}