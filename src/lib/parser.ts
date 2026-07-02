// src/parser.ts
import { lexer } from './lexer';

export function parseConfig(sourceText: string): any {
    lexer.reset(sourceText);

    const config: any = {};
    let currentBlock: any = null;
    let currentBlockName = '';

    const checkPollution = (key: string) => {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            throw new Error('Malicious configuration property detected');
        }
    };

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

            checkPollution(key);

            // Durum 1: Değer Ataması (key = value)
            if (nextToken.type === 'assign') {
                next = tokenStream.next(); // Değere geç
                if (next.done) throw new Error(`Eksik değer ataması: ${key}`);

                const valueToken = next.value;
                let value: any = valueToken.value;

                if (valueToken.type === 'boolean') {
                    value = valueToken.value === 'true';
                } else if (valueToken.type === 'lbracket') {
                    // Array parse
                    value = [];
                    next = tokenStream.next();
                    while (!next.done && next.value.type !== 'rbracket') {
                        if (next.value.type === 'string' || next.value.type === 'number') {
                            value.push(next.value.value);
                        } else if (next.value.type === 'boolean') {
                            value.push(next.value.value === 'true');
                        } else if (next.value.type !== 'comma') {
                            throw new Error(`Array içinde beklenmeyen token: ${next.value.type}`);
                        }
                        next = tokenStream.next();
                    }
                    if (next.done || next.value.type !== 'rbracket') {
                        throw new Error(`Eksik kapatma köşeli parantezi: ${key}`);
                    }
                }

                if (currentBlock) {
                    currentBlock[key] = value;
                } else {
                    config[key] = value;
                }
            }
            // Blok ile beraber string tanımı (proxy "/api" {)
            else if (nextToken.type === 'string') {
                const modifier = nextToken.value;
                next = tokenStream.next(); // { bekle
                if (next.done || next.value.type !== 'lbrace') {
                    throw new Error(`Blok bekleniyor: ${key} "${modifier}"`);
                }
                currentBlockName = key;
                currentBlock = { _modifier: modifier };
            }
            // Durum 2: Blok Başlangıcı (static {)
            else if (nextToken.type === 'lbrace') {
                currentBlockName = key;
                currentBlock = {};
            }
        }
        // Sayı ile başlayan bloklar için hata ayıklama (errors { 404 = "..." })
        else if (token.type === 'number') {
            const key = token.value.toString();
            checkPollution(key);
            next = tokenStream.next();

            if (next.done) break;
            const nextToken = next.value;

            if (nextToken.type === 'assign') {
                next = tokenStream.next(); // Değere geç
                if (next.done) throw new Error(`Eksik değer ataması: ${key}`);

                const valueToken = next.value;
                let value: any = valueToken.value;

                if (currentBlock) {
                    currentBlock[key] = value;
                } else {
                    config[key] = value;
                }
            } else {
                throw new Error(`Beklenmeyen token: ${nextToken.type}`);
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