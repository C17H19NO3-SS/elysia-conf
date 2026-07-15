// src/index.ts
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { cors } from '@elysiajs/cors';
import { rateLimit } from 'elysia-rate-limit';
import { helmet } from 'elysia-helmet';
import { parseConfig } from './lib/parser';
import { join, normalize, sep, resolve } from 'path';

function safeJoin(baseDir: string, safeRoute: string): string {
    // Resolve calculates the absolute path. This handles both '..' traversal and absolute path injections.
    const resolvedPath = resolve(baseDir, safeRoute);
    if (!resolvedPath.startsWith(baseDir + sep) && resolvedPath !== baseDir) {
        throw new Error('Directory traversal attempt detected');
    }
    return resolvedPath;
}

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
    cors?: {
        origin?: string | string[];
        methods?: string | string[];
        credentials?: boolean;
        maxAge?: number;
    };
    security?: {
        hidePoweredBy?: boolean;
        antiClickjack?: boolean;
        noSniff?: boolean;
    };
    rate_limit?: {
        duration?: number;
        max?: number;
    };
    mime_types?: Record<string, string>;
    logger?: {
        level?: string;
        file?: string;
    };
    proxy?: {
        _modifier?: string;
        target?: string;
        changeOrigin?: boolean;
    };
    errors?: Record<string, string>;
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
    const config: ServerConfig = parseConfig(configText);

    let app = new Elysia({ name: 'elysia-custom-config' })
        .decorate('serverConfig', config);

    // Logger Plugin
    if (config.logger) {
        app = app.onRequest(({ request }) => {
            if (config.logger?.level) {
                const logData = `[${new Date().toISOString()}] ${request.method} ${request.url}\n`;
                if (config.logger.file) {
                    Bun.write(config.logger.file, logData, { append: true }).catch(err => {
                        console.error('Log file write error:', err);
                    });
                } else {
                    console.log(logData.trim());
                }
            }
        });
    }

    // Static Assets & MIME Types
    if (config.static) {
        app = app.use(
            staticPlugin({
                assets: config.static?.dir || 'public',
                prefix: config.static?.route || '/static',
                alwaysStatic: config.env === 'production',
                noCache: !config.static?.cache,
            })
        );

        // Elysia's static plugin doesn't have a direct way to inject custom mimes elegantly,
        // so we can intercept specific requests if needed, but Bun handles most out of the box.
    }

    // CORS
    if (config.cors) {
        app = app.use(
            cors({
                origin: config.cors.origin,
                methods: config.cors.methods as any,
                credentials: config.cors.credentials,
                maxAge: config.cors.maxAge
            })
        );
    }

    // Security Headers (Helmet)
    if (config.security) {
        // elysia-helmet doesn't exactly match our flag names, map them:
        app = app.use(helmet({
            contentSecurityPolicy: config.security.antiClickjack ? {
                directives: { frameAncestors: ["'none'"] }
            } : undefined,
            xPoweredBy: !config.security.hidePoweredBy,
            xContentTypeOptions: config.security.noSniff ? true : false,
        }));
    }

    // Rate Limit
    if (config.rate_limit) {
        app = app.use(
            rateLimit({
                duration: config.rate_limit.duration,
                max: config.rate_limit.max,
            })
        );
    }

    // Proxy
    if (config.proxy && config.proxy._modifier && config.proxy.target) {
        const proxyPrefix = config.proxy._modifier;
        const targetUrl = config.proxy.target;

        app = app.all(`${proxyPrefix}/*`, async ({ request }) => {
            const url = new URL(request.url);
            const path = url.pathname.replace(proxyPrefix, '');
            const targetPath = `${targetUrl}${path}${url.search}`;

            try {
                // Fetch to downstream
                const response = await fetch(targetPath, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body
                });
                return response;
            } catch (err) {
                return new Response('Proxy Error', { status: 502 });
            }
        });
    }

    // Error Boundaries
    if (config.errors) {
        app = app.onError(({ code, set }) => {
            const errorCode = code === 'NOT_FOUND' ? '404' : '500';
            const errorFile = config.errors?.[errorCode];
            if (errorFile) {
                try {
                    // 🛡️ Sentinel: Preventing Path Traversal in error file serving
                    const safeErrorFilePath = safeJoin(process.cwd(), errorFile);
                    const file = Bun.file(safeErrorFilePath);
                    if (errorCode === '404') set.status = 404;
                    if (errorCode === '500') set.status = 500;
                    return new Response(file);
                } catch (e) {
                    // Fail securely - errors should not expose sensitive data
                    console.error('Failed to load error file:', e);
                }
            }
        });
    }

    return app;
}