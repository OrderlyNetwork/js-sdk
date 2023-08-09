import Decimal from 'decimal.js-light'

Decimal.set(
    {
        rounding: Decimal.ROUND_DOWN,
    }
)

export const splitDecimal = (value: string | number, precision: number = 8) => {
    const decimal = new Decimal(value)
    const integer = decimal.trunc()
    const fraction = decimal.minus(integer)
    return {
        integer: integer.toString(),
        fraction: fraction.toFixed(precision).substring(2),
    }
}