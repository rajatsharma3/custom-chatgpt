import { SitemapLoader } from "langchain/document_loaders/web/sitemap";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { config } from "dotenv";
import { ChatAnthropic } from "@langchain/anthropic";
import fs from "fs";
config();
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

const vectorStore = new FaissStore(new OpenAIEmbeddings(), {});

const directory = "custom-chatgpt/faiss-store";
const filePath = "custom-chatgpt/file.txt";

import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { compile } from "html-to-text";

const CLAUDE_API = process.env.CLAUDE_API;

//recursive-url loader

// export const crawlURls = async (req, res) => {
//   try {
//     const url =
//       "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set";
//     const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;
//     const loader = new RecursiveUrlLoader(url, {
//       extractor: compiledConvert,
//       maxDepth: 0,
//     });
//     const docs = await loader.load();

//     for (let i = 0; i < docs.length; i++) {
//       try {
//         let dataToAppend = docs[i].pageContent;
//         fs.appendFileSync(filePath, dataToAppend);
//         console.log("Data was appended to file synchronously.");
//       } catch (err) {
//         console.error("Error appending data to file synchronously:", err);
//       }
//     }
//     console.log(docs);
//     res.send({ msg: "done!" });
//   } catch (err) {
//     const error = new Error(err);
//     res.status(500);
//     res.send(error.message);
//   }
// };

//sitemap loader
export const crawlURls = async (req, res) => {
  try {
    const sitemapUrl = "https://drapcode.com/";
    const sitemapLoader = new SitemapLoader(sitemapUrl, { timeout: 1000000 }); // Adjust the timeout value as needed
    const sitemapDocs = await sitemapLoader.load();
    console.log(sitemapDocs);

    for (let i = 0; i < 5; i++) {
      try {
        let dataToAppend = sitemapDocs[i].pageContent;
        fs.appendFileSync(filePath, dataToAppend);
        console.log("Data was appended to file synchronously.");
      } catch (err) {
        console.error("Error appending data to file synchronously:", err);
      }
    }

    res.send({ msg: "done!" });
  } catch (err) {
    const error = new Error(err);
    res.status(500);
    res.send(error.message);
  }
};

export const train = async (req, res) => {
  try {
    const loader = new TextLoader("custom-chatgpt/file.txt");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 25,
    });

    const document = await splitter.splitDocuments(docs);

    await vectorStore.addDocuments(document);
    await vectorStore.save(directory);
    res.send({ msg: "done!" });
  } catch (err) {
    const error = new Error(err);
    res.status(500);
    res.send(error.message);
  }
};

export const getData = async (req, res) => {
  try {
    const loadedVectorStore = await FaissStore.load(
      directory,
      new OpenAIEmbeddings()
    );

    // const model = new OpenAI({ temperature: 0.6 });

    const model = new ChatAnthropic({
      temperature: 0.9,
      modelName: "claude-3-opus-20240229",
      anthropicApiKey: CLAUDE_API,
      maxTokens: 1024,
    });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: loadedVectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const result = await chain.invoke({
      query: "how set.seen method works in serching of complex data",
    });

    console.log(result.text);
    res.send(result.text);
  } catch (err) {
    const error = new Error(err);
    res.status(500);
    res.send(error.message);
  }
};
