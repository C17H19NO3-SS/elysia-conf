# 🗺️ Roadmap - Elysia Custom Config

This roadmap outlines the development phases, upcoming features, and long-term vision for the `elysia-custom-config` package. Our goal is to empower developers to configure entire ElysiaJS and Bun server ecosystems—ranging from static asset serving to production-grade security—using a unified, human-readable custom configuration format.

---

## 📍 Phase 1: Core Engine & Asset Architecture (Current Status)
* [x] **Robust Lexer/Parser Engine:** Built a state-driven tokenizer using `moo` to compile raw `.config` files into strictly-typed JavaScript objects.
* [x] **Primitive Data Support:** Native parsing for primitives (`string`, `number`, `boolean`) along with nested configuration blocks (`block { ... }`).
* [x] **Optimized Static Asset Serving:** Complete integration with `@elysiajs/static` to serve HTML, CSS, JS, and media assets using Bun's fast I/O filesystem layer.
* [x] **Environment-Driven Cache Controls:** Conditional asset handling (`alwaysStatic` vs `noCache`) toggled automatically based on the parsed environment flag.
* [x] **Elysia Plugin Wrapper:** Implemented a global plugin architecture exposing parsed configurations via the `serverConfig` decorator context.

---

## 🚀 Phase 2: Security & Traffic Management (Near-Term)
Transitioning the library into a security-first utility by exposing common server hardening protocols directly inside the config syntax.

* [ ] **Granular CORS Configuration**
  * *Objective:* Eliminate boilerplate CORS setup by mapping origins, allowed headers, and method lists using the official `@elysiajs/cors` package underneath.
  * *Syntax:*
    ```text
    cors {
        origin = "[https://yourdomain.com](https://yourdomain.com)"
        methods = "GET,POST,PUT,DELETE"
        credentials = true
        maxAge = 3600
    }
    ```
* [ ] **Server Hardening & Security Headers (Helmet)**
  * *Objective:* Inject security configurations (disabling `X-Powered-By`, enabling anti-clickjacking CSPs, XSS filters) directly through declarative flags.
  * *Syntax:*
    ```text
    security {
        hidePoweredBy = true
        antiClickjack = true
        noSniff = true
    }
    ```
* [ ] **Rate Limiting (Brute-Force & DDoS Mitigation)**
  * *Objective:* Protect static endpoints and API routes from traffic spikes via memory-efficient sliding-window algorithms leveraging `@elysiajs/rate-limit`.
  * *Syntax:*
    ```text
    rate_limit {
        duration = 60000  # Window timeframe in milliseconds (1 minute)
        max = 120         # Maximum requests per IP per window
    }
    ```

---

## 🛠️ Phase 3: Lexer Capabilities & File System Extensions
Expanding parser tokens to support complex multi-value data topologies and tuning the asset-delivery layer.

* [ ] **Array Data Type Support (`[ ... ]`)**
  * *Objective:* Update the lexer grammar rules to parse bracket notations for comma-separated items. Essential for lists of IPs, allowed domains, or explicit MIME filters.
  * *Syntax:* `allowed_ips = [ "127.0.0.1", "192.168.1.1" ]`
* [ ] **Custom MIME Type Overrides**
  * *Objective:* Provide manual fallback bindings for progressive or experimental web content (e.g., `.wasm`, `.webp`, `.avif`, `.ts` assets) ensuring browsers resolve them correctly without server-level engine configuration.
  * *Syntax:*
    ```text
    mime_types {
        wasm = "application/wasm"
        webp = "image/webp"
    }
    ```
* [ ] **Unified Logger Configurations**
  * *Objective:* Pipe standard Elysia outputs, runtime logs, and request streams into custom file targets or format structures depending on target severity tiers (`debug`, `info`, `warn`, `error`).
  * *Syntax:*
    ```text
    logger {
        level = "debug"
        file = "logs/combined.log"
    }
    ```

---

## 🌐 Phase 4: Production Proxying & Custom Diagnostics
Scaling up the configuration footprint to interface cleanly with microservices and localized gateway routings.

* [ ] **Declarative Reverse Proxy Routing**
  * *Objective:* Provide simple path-rewriting capabilities inside the parser to proxy specific incoming route branches directly to downstream containerized microservices or separate backends (e.g., Go, Rust, Node).
  * *Syntax:*
    ```text
    proxy "/api/v1" {
        target = "http://localhost:8080"
        changeOrigin = true
    }
    ```
* [ ] **Graceful Exception Mapping (Error Boundaries)**
  * *Objective:* Bind standard server exception categories (404, 403, 500) to distinct production-compiled HTML files automatically.
  * *Syntax:*
    ```text
    errors {
        404 = "public/fallback/404.html"
        500 = "public/fallback/500.html"
    }
    ```

---

## 📈 Phase 5: Developer Experience & Tooling Eco-system
* [ ] **Visual Studio Code Extension:** Native `.config` / `server.config` tokenized companion extension to support syntax highlighting, basic autocomplete hints, and linter alerts.
* [ ] **CLI Scaffolder Tooling:** Ship a fast executable utility (`bunx elysia-config init`) to quickly provision standard configuration baselines directly into the workspace root.
* [ ] **Traceable Syntactic Errors:** Elevate parser error reporting by processing `moo`'s localized `line` and `col` metrics to point precisely to where structural syntax violations happen. 
  *(e.g., `[Config Error]: Unexpected token '}' at line 14, column 5.`)*