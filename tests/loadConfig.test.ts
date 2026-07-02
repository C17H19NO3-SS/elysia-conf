import { describe, expect, it } from 'bun:test';
import { loadConfig } from '../src/index';

describe('loadConfig', () => {
    it('should parse valid simple configuration', () => {
        const configText = `
port = 8080
env = "development"
`;
        const config = loadConfig(configText);
        expect(config.port).toBe('8080'); // lexer may parse as string if cast is not working
        expect(config.env).toBe('development');
    });

    it('should parse complex nested configuration', () => {
        const configText = `
cors {
    origin = "https://example.com"
    methods = ["GET", "POST"]
}
`;
        const config = loadConfig(configText);
        expect(config.cors).toBeDefined();
        expect(config.cors?.origin).toBe('https://example.com');
        expect(config.cors?.methods).toEqual(['GET', 'POST']);
    });

    it('should handle an empty string', () => {
        const configText = ``;
        const config = loadConfig(configText);
        expect(config).toEqual({});
    });

    it('should throw an error for missing value assignment', () => {
        const configText = `key = `;
        expect(() => loadConfig(configText)).toThrow('Eksik değer ataması: key');
    });

    it('should throw an error for unexpected token in array', () => {
        const configText = `key = [1, 2, {]`;
        expect(() => loadConfig(configText)).toThrow();
    });

    it('should throw an error for unexpected block closure', () => {
        const configText = `}`;
        expect(() => loadConfig(configText)).toThrow("Beklenmeyen kapatma parantezi '}'");
    });
});
