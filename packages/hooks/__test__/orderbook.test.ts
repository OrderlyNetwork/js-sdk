import {mergeOrderbook, reduceOrderbook} from '../src/orderly/useOrderbook';


describe("test orderbook utils", () => {
    test('test reduceOrderbook', () => {
        const result = reduceOrderbook(10, 0.001, {
            asks: [],
            bids: [],
        });
    });
});
