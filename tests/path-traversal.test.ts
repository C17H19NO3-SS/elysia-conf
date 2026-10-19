import { describe, it, expect, afterAll } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Security', () => {
    it('should throw an error when configuring a logger file outside the base directory', () => {
        const configText = `
logger {
    level = "info"
    file = "../out_of_bounds.log"
}
`;
        expect(() => {
            elysiaCustomStatic(configText);
        }).toThrow('Directory traversal attempt detected');
    });

    it('should throw an error when configuring an error file outside the base directory', () => {
        const configText = `
errors {
    404 = "/etc/passwd"
}
`;
        expect(() => {
            elysiaCustomStatic(configText);
        }).toThrow('Directory traversal attempt detected');
    });

    it('should allow configuring a file within the base directory', () => {
        const configText = `
logger {
    level = "info"
    file = "./test.log"
}
errors {
    404 = "404.html"
}
`;
        expect(() => {
            elysiaCustomStatic(configText);
        }).not.toThrow();
    });
});
