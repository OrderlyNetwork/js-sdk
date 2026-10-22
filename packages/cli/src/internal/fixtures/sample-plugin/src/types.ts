export interface SamplePluginOptions {
  /** JWT token for fee-free swaps. */
  jwtToken?: string;
  /**
   * Default slippage tolerance in basis points.
   * @default 100
   * @minimum 1
   * @maximum 5000
   */
  slippageTolerance?: number;
  /** Optional CSS class. */
  className?: string;
  /** Required mode. */
  mode: "a" | "b";
  /** Required flag. */
  flag: boolean;
  /** Nested options are not supported by the form. */
  nested?: { x: string };
  /** Callback options are not supported by the form. */
  onEvent?: (id: string) => void;
}
