import { Elysia } from 'elysia';
import { elysiaCustomStatic } from '../src/index';

// 1. Read the raw text from our config file
const configText = await Bun.file('example/server.config').text();

// 2. Initialize the server using our config plugin
const app = elysiaCustomStatic(configText);

// 3. Add custom routes
app.get('/', () => {
    return 'Welcome to Elysia Custom Config Example Server!\nTry accessing /api/v1/users to see the proxy in action.';
});

app.get('/error', () => {
    throw new Error("Simulated Server Error");
});

// We can extract serverConfig using a small hack because types are sometimes annoying, but it's on app.
const anyApp = app as any;
const config = anyApp.serverConfig || { port: 3000 };

// 4. Start the server on the port defined in config (default 3000 if not parsed)
const port = config.port || 3000;
app.listen(port);

console.log(`Server is running at http://localhost:${port}`);
// config parser exposes it on decorators, but we also can get it from Elysia instance depending on how types are exported.
