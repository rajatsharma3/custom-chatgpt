import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

/**
 * Loader uses `page.evaluate(() => document.body.innerHTML)`
 * as default evaluate function
 **/
const loader = new PuppeteerWebBaseLoader("https://drapcode.com");

const docs = await loader.load();

console.log(docs);
