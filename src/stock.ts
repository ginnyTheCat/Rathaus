const PROCESSING_FEE = 5; // EUR
const BANK_COMMISSION_MIN = 10; // EUR
const BANK_COMMISSION = 0.005; // 0.5 %
const BROKERAGE_FEE = 0.0008; // 0.08 %

class Stock {
  readonly symbol: string;
  shares: number;

  tmp?: number;
  current?: number;
  last?: number;

  constructor(symbol: string) {
    this.symbol = symbol;
    this.shares = 0;
  }

  processingCost(shares: number) {
    if (this.last === undefined) {
      return undefined;
    }

    return (
      PROCESSING_FEE +
      Math.max(BANK_COMMISSION * this.last * shares, BANK_COMMISSION_MIN) +
      BROKERAGE_FEE * this.last * shares
    );
  }

  buyingCost(shares: number) {
    if (this.last === undefined) {
      return undefined;
    }

    return this.last * shares + this.processingCost(shares)!;
  }

  buyableShares() {
    if (this.last === undefined) {
      return undefined;
    }

    var shares = 0;
    while (this.buyingCost(shares + 1)! <= 10000) {
      shares += 1;
    }
    return shares;
  }
}

export { Stock };
