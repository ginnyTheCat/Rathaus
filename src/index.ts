import { start } from "./browser";
import { liveData, historyData } from "./data";
import { Stock } from "./stock";
import { CronJob } from "cron";
import { transaction } from "./transaction";
import { Wallet } from "./wallet";
// @ts-ignore
import config from "../config.json";

const stocks = ["BMW", "VOW3", "DAI", "639", "DBK", "SIE", "SAP", "DPW", "APC"]
  .map((e) => e + ".DE")
  .map((e) => new Stock(e));

const wallet = new Wallet(50000); // 50k

async function live() {
  await start(config.website.username, config.website.password);
  liveData(stocks);
  new CronJob("* * * * *", () => transaction(stocks, wallet), null, true);
}

async function history() {
  await historyData(stocks, wallet);
  await wallet.sell(...stocks);
  console.log(wallet.money);
}

live();
