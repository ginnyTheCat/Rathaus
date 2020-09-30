import { Matrix, Message } from "@leluxnet/xbot";
import { Wallet } from "./wallet";

export async function chatBot(
  userId: string,
  accessToken: string,
  server: string,
  wallet: Wallet
) {
  const matrix = new Matrix(userId, accessToken, server);

  matrix.on("message", (msg: Message) => {
    if (msg.content === "!help") {
      msg.channel.sendMessage(`Available commands:\n!help\n!money\n!stocks`);
    } else if (msg.content === "!money") {
      msg.channel.sendMessage(
        `Real money: ${wallet.money}\nTheoretical money: ${wallet.theoreticalMoney}`
      );
    } else if (msg.content === "!stocks") {
      msg.channel.sendMessage(
        wallet.stocks
          .filter((s) => s.last !== undefined)
          .map(
            (s) =>
              `${s.shares}x ${s.symbol}: ${s.shares * s.last!} (${s.last!})`
          )
          .join("\n")
      );
    }
  });

  await matrix.start();
}
