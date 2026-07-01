// src/index.ts
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { parseConfig } from './lib/parser';

// Kullanıcıların kendi TypeScript projelerinde kullanabilmesi için Tipleri dışa aktarıyoruz
export interface StaticConfigOptions {
    dir?: string;
    route?: string;
    cache?: boolean;
}

export interface ServerConfig {
    port?: number;
    env?: string;
    static?: StaticConfigOptions;
    [key: string]: any; // Diğer özel alanlar için esneklik
}

/**
 * server.config içeriğini parse ederek doğrudan Elysia uyumlu bir nesne döndürür
 * @param configText server.config dosyasının ham metin içeriği
 */
export function loadConfig(configText: string): ServerConfig {
    return parseConfig(configText);
}

/**
 * Elysia için özel statik dosya ve konfigürasyon eklentisi (Plugin)
 * @param configText server.config dosyasının ham metin içeriği
 */
export function elysiaCustomStatic(configText: string) {
    const config = parseConfig(configText);

    return new Elysia({ name: 'elysia-custom-static' })
        // Parsed config'i projenin her yerinden erişilebilir yapmak için decorator olarak ekliyoruz
        .decorate('serverConfig', config)
        .use(
            staticPlugin({
                assets: config.static?.dir || 'public',
                prefix: config.static?.route || '/static',
                alwaysStatic: config.env === 'production',
                noCache: !config.static?.cache
            })
        );
}