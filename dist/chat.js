"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatBot = void 0;
const xbot_1 = require("xbot");
async function chatBot(userId, accessToken, server, wallet) {
    const matrix = new xbot_1.Matrix(userId, accessToken, server);
    matrix.on("message", (msg) => {
        if (msg.content === "!help") {
            msg.channel.sendMessage(`Available commands:\n!help\n!money\n!stocks`);
        }
        else if (msg.content === "!money") {
            msg.channel.sendMessage(`Real money: ${wallet.money}\nTheoretical money: ${wallet.theoreticalMoney}`);
        }
        else if (msg.content === "!stocks") {
            msg.channel.sendMessage(wallet.stocks
                .filter((s) => s.last !== undefined)
                .map((s) => `${s.shares}x ${s.symbol}: ${s.shares * s.last} (${s.last})`)
                .join("\n"));
        }
    });
    await matrix.start();
}
exports.chatBot = chatBot;
