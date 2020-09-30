import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import AsyncLock = require("async-lock");
import { Stock } from "./stock";
import { Wallet } from "./wallet";

const lock = new AsyncLock();
var browser: Browser;
var page: Page;

export async function start(
  username: string,
  password: string,
  wallet: Wallet
) {
  await lock.acquire("browser", async (done) => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== undefined,
    });

    const loginPage = await browser.newPage();

    await loginPage.goto(
      "https://www.planspiel-boerse.de/toplevel/main/deutsch/index.html"
    );

    // Website constructs weird
    await loginPage.waitForSelector("[name=SA_username]");

    await loginPage.click("[name=SA_username]");
    await loginPage.keyboard.type(username);

    await loginPage.click("[name=SA_password]");
    await loginPage.keyboard.type(password);

    // Get next new tab
    const newPagePromise: Promise<puppeteer.Page> = new Promise((x) =>
      browser.once("targetcreated", (target) => x(target.page()))
    );

    await loginPage.click("[type=submit]");

    page = await newPagePromise;

    // Disable session timeout
    await page.evaluate(() => {
      const oldSetInterval = window.setInterval;
      window.setInterval = (handle: TimerHandler, timeout?: number): any => {
        console.log(`Tried to set interval (${timeout}ms)`);
        // Need for buying stuff
        if (timeout === 300) {
          oldSetInterval(handle, 100);
        }
      };
    });

    // Wait for page to be loaded completely
    await page.waitForSelector("h3.top_text");

    // Get current balance
    await navigate("Depotinhalt");
    await page.waitForSelector(".cf > h2");

    // @ts-ignore
    const rawMoney = await page.$eval(".cf > h2", (el) => el.innerText);

    wallet.money = parseInt(
      rawMoney.split(" ")[0].replace(".", "").replace(",", ".")
    );

    done();
  });
}

async function navigate(dest: string) {
  // @ts-ignore
  await page.$eval(`[data-navigate="${dest}"]`, (e) => e.click());
}

export async function buy(stock: Stock, shares: number) {
  await lock.acquire("browser", async (done) => {
    await navigate("Kurse");

    await page.waitForSelector(".dataTable");

    const [stockEntry] = await page.$x(
      `//tr[td[span[contains(., "${stock.name}")]]]`
    );
    const buyIcon = await stockEntry.$(".buy_icon");
    if (buyIcon !== null) {
      await buyIcon.click();

      await page.waitForSelector("#vk_i_stk");
      await page.click("#vk_i_stk");
      await page.keyboard.type(shares.toString());

      // See "Disable session timeout" in the start function
      await page.waitFor(100);

      await page.click(".send_button");
    }

    done();
  });
}

export async function sell(stock: Stock, shares: number) {
  await lock.acquire("browser", async (done) => {
    done();
  });
}
