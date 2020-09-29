import { Stock } from "./stock";
import * as browser from "./browser";

class Wallet {
  money: number;

  constructor(money: number) {
    this.money = money;
  }

  async buy(stock: Stock) {
    if (stock.shares !== 0) {
      return;
    }

    const shares = stock.buyableShares();
    if (shares === undefined || shares === 0) {
      return;
    }
    const price = stock.buyingCost(shares)!;

    console.log(`BUY ${shares}x ${stock.symbol} FOR ${price}`);
    await browser.buy(stock, shares);
    this.money -= price;
    stock.shares += shares;
  }

  async sell(...stocks: Array<Stock>) {
    for (const stock of stocks) {
      if (stock.last === undefined || stock.shares === 0) {
        continue;
      }

      const price = stock.last * stock.shares;
      console.log(`SELL ${stock.shares}x ${stock.symbol} FOR ${price}`);
      await browser.sell(stock, stock.shares);
      this.money += price;
      stock.shares = 0;
    }
  }
}

export { Wallet };
