import { elysiaCustomStatic } from './src/index';

const config = `
port = 3000
env = "production"
cors {
    origin = "*"
    methods = ["GET", "POST"]
}
security {
    hidePoweredBy = true
    antiClickjack = true
    noSniff = true
}
rate_limit {
    duration = 60000
    max = 120
}
proxy "/api" {
    target = "http://localhost:8080"
}
errors {
    404 = "404.html"
    500 = "500.html"
}
`;

const app = elysiaCustomStatic(config);
console.log("Elysia App Created with all plugins!");
