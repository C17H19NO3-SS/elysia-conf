import { describe, expect, it } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Security: Prototype Pollution', () => {
    it('should prevent prototype pollution', () => {
        const configText = `
__proto__ = {
    polluted = true
}
constructor = {
    prototype = {
        polluted2 = true
    }
}
`;
        expect(() => {
            const app = elysiaCustomStatic(configText);
        }).toThrow();
    });
});
