// src/lexer.ts
import moo from 'moo';

export const lexer = moo.states({
    main: {
        // Boşlukları ve yorum satırlarını yoksay (ignore)
        ws: { match: /[ \t]+/, lineBreaks: false },
        nl: { match: /\n+/, lineBreaks: true },
        comment: { match: /#[^\n]*/ },

        // Yapısal Karakterler
        lbrace: '{',
        rbrace: '}',
        assign: '=',

        // Veri Tipleri
        number: { match: /[0-9]+/, cast: Number },
        string: { match: /"(?:\\["\\]|[^\n"\\])*"/, value: s => s.slice(1, -1) }, // Tırnakları otomatik temizler

        // Kelimeler (true, false veya port, static gibi anahtarlar)
        identifier: {
            match: /[a-zA-Z_][a-zA-Z0-9_*]*/,
            type: moo.keywords({
                boolean: ['true', 'false']
            })
        }
    }
});