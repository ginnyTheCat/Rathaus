"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const browser = __importStar(require("./browser"));
class Wallet {
    constructor(money, stocks) {
        this.money = money;
        this.stocks = stocks;
    }
    async buy(stock) {
        if (stock.shares !== 0) {
            return;
        }
        const shares = stock.buyableShares();
        if (shares === undefined || shares === 0) {
            return;
        }
        const price = stock.buyingCost(shares);
        console.log(`BUY ${shares}x ${stock.symbol} FOR ${price}`);
        await browser.buy(stock, shares);
        this.money -= price;
        stock.shares += shares;
    }
    async sell(...stocks) {
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
            .forEach((s) => (money += s.last * s.shares));
        return money;
    }
}
exports.Wallet = Wallet;
