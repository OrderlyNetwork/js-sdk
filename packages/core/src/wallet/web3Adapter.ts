export class Web3WalletAdapter implements Web3WalletAdapter {
  constructor(private readonly web3: any) {}
  async getBalance(address: string): Promise<any> {
    const balance = await this.web3.eth.getBalance(address);
    return balance;
  }
  async deposit(from: string, to: string, amount: string): Promise<any> {
    const tx = await this.web3.eth.sendTransaction({
      from,
      to,
      value: amount,
    });
    return tx;
  }
}
