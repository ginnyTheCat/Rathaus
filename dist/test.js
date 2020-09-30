"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const stock_1 = require("./stock");
const transaction_1 = require("./transaction");
describe("calculate", () => {
    const stock = new stock_1.Stock("SYMBOL", "Name");
    stock.current = 110;
    stock.last = 100;
    it("buyingCost", () => {
        chai_1.expect(stock.buyingCost(10)).equal(1015.8);
        chai_1.expect(stock.buyingCost(100)).equal(10063);
    });
    it("buyableShares", () => {
        chai_1.expect(stock.buyableShares()).equal(99);
    });
    it("profit", () => {
        chai_1.expect(transaction_1.profit(stock)).equal(927.58);
    });
});
