import puppeteer from "puppeteer";
import AsyncLock = require("async-lock");
import { Stock } from "./stock";

const SHOW_BROWSER = true;

const lock = new AsyncLock();
var browser: puppeteer.Browser;
var page: puppeteer.Page;

async function start(username: string, password: string) {
  await lock.acquire("browser", async (done) => {
    browser = await puppeteer.launch({ headless: !SHOW_BROWSER });
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
      window.setInterval = (...args: any[]): any => {}; // no-op
    });

    // Wait for page to be loaded completely
    await page.waitForSelector(".sessionTime");

    done();
  });
}

async function buy(stock: Stock, shares: number) {
  await lock.acquire("browser", async (done) => {
    done();
  });
}

async function sell(stock: Stock, shares: number) {
  await lock.acquire("browser", async (done) => {
    done();
  });
}

export { start, buy, sell };
