import { parseConfig } from './src/lib/parser';
const config = `
port = 3000
env = "production"
cors {
    origin = "*"
    methods = ["GET", "POST"]
}
proxy "/api" {
    target = "http://localhost:8080"
}
errors {
    404 = "404.html"
    500 = "500.html"
}
`;
console.log(JSON.stringify(parseConfig(config), null, 2));
