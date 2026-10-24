import { test, expect, describe } from 'bun:test';
import { elysiaCustomStatic } from '../src/index';

describe('Path Traversal Prevention', () => {
    test('should allow valid relative paths', () => {
        expect(() => elysiaCustomStatic('logger { file = "logs/app.log" }')).not.toThrow();
    });

    test('should prevent traversal in logger.file', () => {
        expect(() => elysiaCustomStatic('logger { file = "../../../etc/passwd" }')).toThrow('Directory traversal attempt detected');
    });

    test('should prevent traversal in static.dir', () => {
        expect(() => elysiaCustomStatic('static { dir = "/etc/passwd" }')).toThrow('Directory traversal attempt detected');
    });

    test('should prevent traversal in errors', () => {
        expect(() => elysiaCustomStatic('errors { 404 = "../../../../etc/shadow" }')).toThrow('Directory traversal attempt detected');
    });

    test('should prevent traversal in errors via root paths', () => {
        expect(() => elysiaCustomStatic('errors { 500 = "/var/log/syslog" }')).toThrow('Directory traversal attempt detected');
    });
});
