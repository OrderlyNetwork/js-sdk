import {
  Calculator,
  CalculatorCtx,
  CalculatorScheduler,
  CalculatorScope,
} from "../../types";

type ShardProcessor<T, R> = (shard: T[]) => R;

class ShardingScheduler implements CalculatorScheduler {
  // run(calculators: Calculator[]) {}
  calc(
    scope: CalculatorScope,
    calculators: Calculator[],
    data: any,
    ctx: CalculatorCtx
  ): Promise<any> {
    for (let index = 0; index < calculators.length; index++) {
      const calculator = calculators[index];
      const result = calculator.calc(scope, data, ctx);
      console.log("item calc ======>>>>>>", scope, calculator.name, result);
      if (result) {
        ctx.saveOutput(calculator.name, result);
      }
    }
    return Promise.resolve();
  }

  update(scope: CalculatorScope, calculators: Calculator[], data: any) {
    for (let index = 0; index < calculators.length; index++) {
      const calculator = calculators[index];
      calculator.update(data[calculator.name]);
    }
    return Promise.resolve();
  }

  private computation<T, R>(
    data: T[],
    processor: ShardProcessor<T, R>,
    onComplete: (results: R[]) => void
  ): void {
    let index = 0; // Current starting index of the shard
    const results: R[] = []; // Used to store the calculation results of each shard
    const estimatedShardSize = 100; // Initial estimated shard size

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
        requestIdleCallback(processNextShard);
      } else {
        onComplete(results);
      }
    }

    requestIdleCallback(processNextShard);
  }
}

export { ShardingScheduler };
