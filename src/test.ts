import { expect } from "chai";
import { Stock } from "./stock";
import { profit } from "./transaction";

describe("calculate", () => {
  const stock = new Stock("SYMBOL");
  stock.current = 110;
  stock.last = 100;
  it("buyingCost", () => {
    expect(stock.buyingCost(10)).equal(1015.8);
    expect(stock.buyingCost(100)).equal(10063);
  });
  it("buyableShares", () => {
    expect(stock.buyableShares()).equal(99);
  });
  it("profit", () => {
    expect(profit(stock)).equal(927.58);
  });
});
