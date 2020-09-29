import { client as WebSocket } from "websocket";
import { loadSync } from "protobufjs";
import { Stock } from "./stock";
import Axios from "axios";
import { transaction } from "./transaction";
import { time } from "console";
import { launch } from "puppeteer";
import { Wallet } from "./wallet";

const Message = loadSync("yahoo.proto").lookupType("yahoo");

function liveData(stocks: Array<Stock>) {
  const ws = new WebSocket();
  ws.on("connect", (conn) => {
    conn.on("message", (msg) => {
      const data = msg.utf8Data;
      if (data !== undefined) {
        const res: any = Message.decode(Buffer.from(data, "base64"));
        const stock = stocks.find((e) => e.symbol === res["id"]);
        if (stock !== undefined) {
          stock.tmp = res["price"];
        }
      }
    });
    conn.send(
      JSON.stringify({
        subscribe: stocks.map((e) => e.symbol),
      })
    );
  });
  ws.connect("wss://streamer.finance.yahoo.com/");
}

async function historyData(stocks: Array<Stock>, wallet: Wallet) {
  const to = Math.floor(Date.now() / 1000);
  // 730 days + 30 sec (max transmission time)
  const from = to - 60 * 60 * 24 * 60 + 30;

  const responses = await Promise.all(
    stocks.map(async (s) => {
      return {
        stock: s,
        data: await Axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${s.symbol}?period1=${from}&period2=${to}&interval=5m`
        ),
      };
    })
  );

  const timeData = new Map<number, Map<Stock, number>>();
  for (const { stock, data } of responses) {
    const res = data.data.chart.result[0];
    const prices = res.indicators.quote[0].close;
    const timestamps = res.timestamp;

    for (let i = 0; i < timestamps.length; i++) {
      if (prices[i] === null) {
        continue;
      }
      if (!timeData.has(timestamps[i])) {
        timeData.set(timestamps[i], new Map());
      }
      timeData.get(timestamps[i])!.set(stock, prices[i]);
    }
  }

  var lastTime = 0;
  for (const [time, data] of timeData) {
    if (lastTime.toString().slice(0, -1) !== time.toString().slice(0, -1)) {
      await transaction(stocks, wallet);
    }
    data.forEach((price, stock) => (stock.tmp = price));

    lastTime = time;
  }
}

export { liveData, historyData };
