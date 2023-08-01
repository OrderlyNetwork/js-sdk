export interface WalletConnector {
  connect: () => Promise<void>;
}

class BaseConnector implements WalletConnector {
  connect() {
    return Promise.resolve();
  }
}
