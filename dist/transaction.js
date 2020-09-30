"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profit = exports.transaction = void 0;
function profit(stock) {
    if (stock.current === undefined || stock.last === undefined) {
        return undefined;
    }
    if (stock.shares === 0) {
        const shares = stock.buyableShares();
        if (shares === undefined) {
            return undefined;
        }
        return ((stock.current - stock.last) * shares - stock.processingCost(shares));
    }
    else {
        return stock.shares * (stock.current - stock.last);
    }
}
exports.profit = profit;
async function transaction(wallet) {
    console.log("TRANSACTION");
    wallet.stocks.forEach((e) => (e.current = e.tmp));
    const selected = wallet.stocks
        .filter((x) => profit(x) !== undefined && profit(x) >= 0)
        .sort((a, b) => profit(a) - profit(b))
        .slice(0, 5);
    for (const stock of wallet.stocks) {
        if (selected.includes(stock)) {
            await wallet.buy(stock);
        }
        else {
            await wallet.sell(stock);
        }
    }
    // Maybe done by sync on browser level
    wallet.stocks.forEach((e) => (e.last = e.current));
}
exports.transaction = transaction;
