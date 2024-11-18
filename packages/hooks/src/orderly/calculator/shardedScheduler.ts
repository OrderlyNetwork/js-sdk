import {
  Calculator,
  CalculatorCtx,
  CalculatorScheduler,
  CalculatorScope,
} from "../../types";

type ShardProcessor<T, R> = (shard: T[]) => R;

interface IdleDeadline {
  timeRemaining: () => number;
  readonly didTimeout: boolean;
}

/**
 * Polyfill for requestIdleCallback
 */
const requestIdleCallbackPolyfill = (
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout: number }
): ReturnType<typeof setTimeout> => {
  const startTime = Date.now();

  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - startTime)),
    });
  }, 1); // Use 1ms timeout as a fallback
};

/**
 * Polyfill for cancelIdleCallback
 */
const cancelIdleCallbackPolyfill = (id: number) => {
  clearTimeout(id);
};

/**
 * Export the native requestIdleCallback or polyfill
 */
const safeRequestIdleCallback =
  typeof window !== "undefined" && window.requestIdleCallback
    ? window.requestIdleCallback.bind(window)
    : requestIdleCallbackPolyfill;

/**
 * Export the native cancelIdleCallback or polyfill
 */
const safeCancelIdleCallback =
  typeof window !== "undefined" && window.cancelIdleCallback
    ? window.cancelIdleCallback.bind(window)
    : cancelIdleCallbackPolyfill;

class ShardingScheduler implements CalculatorScheduler {
  // run(calculators: Calculator[]) {}
  calc(
    scope: CalculatorScope,
    calculators: Calculator[],
    data: any,
    ctx: CalculatorCtx
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.computation<Calculator, any>(
          calculators,
          (shard) => {
            const results = [];
            for (let index = 0; index < shard.length; index++) {
              const calculator = shard[index];
              const result = calculator.calc(scope, data, ctx);

              if (result) {
                ctx.saveOutput(calculator.name, result);
                results.push(result);
              }
            }

            return results;
          },
          (results) => {
            resolve(results);
          }
        );
      } catch (error) {
        console.error("ShardingScheduler calc error", error);
        reject(error);
      }
    });
    // for (let index = 0; index < calculators.length; index++) {
    //   const calculator = calculators[index];
    //   const result = calculator.calc(scope, data, ctx);
    //   // console.log("item calc ======>>>>>>", scope, calculator.name, result);
    //   if (result) {
    //     ctx.saveOutput(calculator.name, result);
    //   }
    // }
    // return Promise.resolve();
  }

  update(scope: CalculatorScope, calculators: Calculator[], data: any) {
    for (let index = 0; index < calculators.length; index++) {
      const calculator = calculators[index];
      const item = data[calculator.name];

      if (!!item) {
        calculator.update(item, scope);
      }
    }
    return Promise.resolve();
  }

  private computation<T, R>(
    data: T[],
    processor: ShardProcessor<T, R[]>,
    onComplete: (results: R[]) => void
  ): void {
    let index = 0; // Current starting index of the shard
    const results: R[][] = []; // Used to store the calculation results of each shard
    const estimatedShardSize = Math.min(data.length, 2); // Initial estimated shard size
    // const estimatedShardSize = 1;

    // Function to process shards
    function processNextShard(deadline: IdleDeadline) {
      // Dynamic calculation of shard size
      let shardSize = estimatedShardSize;

      // If the remaining time is not enough to process the current shard size, reduce the shard size
      while (index + shardSize <= data.length && deadline.timeRemaining() > 0) {
        const shard = data.slice(index, index + shardSize);
        const result = processor(shard);
        results.push(result);
        index += shardSize;

        // Dynamic adjustment of shard size
        if (deadline.timeRemaining() < 1) {
          shardSize = Math.max(1, Math.floor(shardSize / 2)); // Reduce shard size
        } else {
          shardSize = Math.min(data.length - index, shardSize * 2); // Increase shard size
        }
      }

      if (index < data.length) {
        // There are still unprocessed data shards, request the next idle callback
        safeRequestIdleCallback(processNextShard, {
          timeout: 1000,
        });
      } else {
        onComplete(results.flat());
      }
    }

    safeRequestIdleCallback(processNextShard, {
      timeout: 1000,
    });
  }
}

export { ShardingScheduler, safeRequestIdleCallback, safeCancelIdleCallback };
