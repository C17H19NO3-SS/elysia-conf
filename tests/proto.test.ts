import { expect, test } from "bun:test";
import { parseConfig } from "../src/lib/parser";

test("prototype pollution via block assign", () => {
    const configText = `
static {
    __proto__ = "polluted"
}
    `;
    expect(() => parseConfig(configText)).toThrow("Malicious configuration property detected");
});

test("prototype pollution via block name", () => {
    const configText = `
__proto__ {
    polluted = "yes"
}
    `;
    expect(() => parseConfig(configText)).toThrow("Malicious configuration property detected");
});

test("prototype pollution via top level assign", () => {
    const configText = `
__proto__ = "polluted"
    `;
    expect(() => parseConfig(configText)).toThrow("Malicious configuration property detected");
});

test("constructor pollution", () => {
    const configText = `
constructor = "polluted"
    `;
    expect(() => parseConfig(configText)).toThrow("Malicious configuration property detected");
});

test("prototype pollution via prototype block name", () => {
    const configText = `
prototype {
    polluted = "yes"
}
    `;
    expect(() => parseConfig(configText)).toThrow("Malicious configuration property detected");
});
