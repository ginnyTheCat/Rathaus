"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyData = exports.liveData = void 0;
const websocket_1 = require("websocket");
const protobufjs_1 = require("protobufjs");
const axios_1 = __importDefault(require("axios"));
const transaction_1 = require("./transaction");
const Message = protobufjs_1.loadSync("yahoo.proto").lookupType("yahoo");
function liveData(stocks) {
    const ws = new websocket_1.client();
    ws.on("connect", (conn) => {
        conn.on("message", (msg) => {
            const data = msg.utf8Data;
            if (data !== undefined) {
                const res = Message.decode(Buffer.from(data, "base64"));
                const stock = stocks.find((e) => e.symbol === res["id"]);
                if (stock !== undefined) {
                    stock.tmp = res["price"];
                    console.log(`${stock.symbol} CHANGED TO ${res["price"]}`);
                }
            }
        });
        conn.send(JSON.stringify({
            subscribe: stocks.map((e) => e.symbol),
        }));
    });
    ws.connect("wss://streamer.finance.yahoo.com/");
}
exports.liveData = liveData;
async function historyData(wallet) {
    const to = Math.floor(Date.now() / 1000);
    // 730 days + 30 sec (max transmission time)
    const from = to - 60 * 60 * 24 * 60 + 30;
    const responses = await Promise.all(wallet.stocks.map(async (s) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${s.symbol}?period1=${from}&period2=${to}&interval=5m`;
        return {
            stock: s,
            data: await axios_1.default.get(url).catch(() => {
                throw Error(`Error getting ${url}`);
            }),
        };
    }));
    const timeData = new Map();
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
            timeData.get(timestamps[i]).set(stock, prices[i]);
        }
    }
    var lastTime = 0;
    for (const [time, data] of timeData) {
        if (lastTime.toString().slice(0, -3) !== time.toString().slice(0, -3)) {
            await transaction_1.transaction(wallet);
        }
        data.forEach((price, stock) => (stock.tmp = price));
        lastTime = time;
    }
}
exports.historyData = historyData;
