import { Stock } from "./stock";
import { Wallet } from "./wallet";

function profit(stock: Stock) {
  if (stock.current === undefined || stock.last === undefined) {
    return undefined;
  }

  if (stock.shares === 0) {
    const shares = stock.buyableShares();
    if (shares === undefined) {
      return undefined;
    }
    return (
      (stock.current - stock.last) * shares - stock.processingCost(shares)!
    );
  } else {
    return stock.shares * (stock.current - stock.last);
  }
}

async function transaction(stocks: Array<Stock>, wallet: Wallet) {
  console.log("TRANSACTION");
  stocks.forEach((e) => (e.current = e.tmp));

  const selected = stocks
    .filter((x) => profit(x) !== undefined && profit(x)! >= 0)
    .sort((a, b) => profit(a)! - profit(b)!)
    .slice(0, 5);

  for (const stock of stocks) {
    if (selected.includes(stock)) {
      await wallet.buy(stock);
    } else {
      await wallet.sell(stock);
    }
  }

  // Maybe done by sync on browser level
  stocks.forEach((e) => (e.last = e.current));
}

export { transaction, profit };
