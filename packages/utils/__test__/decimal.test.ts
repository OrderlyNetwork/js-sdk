import Decimal from "../src/decimal";

describe('decimal', () => {
    test('round down', () => {
        const d = new Decimal(23.32667);
        expect(d.toFixed(2)).toBe('23.32');
    })
})
