import { Stock } from "./stock";
import * as browser from "./browser";

class Wallet {
  money: number;
  stocks: Array<Stock>;

  constructor(money: number, stocks: Array<Stock>) {
    this.money = money;
    this.stocks = stocks;
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

  get theoreticalMoney() {
    var money = this.money;
    this.stocks
      .filter((s) => s.last !== undefined)
      .forEach((s) => (money += s.last! * s.shares));
    return money;
  }
}

export { Wallet };
