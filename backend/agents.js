import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { SitemapLoader } from "langchain/document_loaders/web/sitemap";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "dotenv";
import { createRetrieverTool } from "langchain/tools/retriever";
config();

// const loader = new CheerioWebBaseLoader("https://drapcode.com/");
// const rawDocs = await loader.load();

const loader = new SitemapLoader("https://drapcode.com/", {
  timeout: 100000,
});

const rawDocs = await loader.load();

const selectedDocs = rawDocs.slice(0, 5);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const docs = await splitter.splitDocuments(rawDocs);

const vectorstore = await MemoryVectorStore.fromDocuments(
  docs,
  new OpenAIEmbeddings()
);
const retriever = vectorstore.asRetriever();

const retrieverTool = createRetrieverTool(retriever, {
  name: "langsmith_search",
  description:
    "Search for information about LangSmith. For any questions about LangSmith, you must use this tool!",
});

const searchTool = new TavilySearchResults();

const tools = [searchTool, retrieverTool];

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
});

const obj = await pull("hwchase17/openai-functions-agent");

const prompt = new ChatPromptTemplate(obj);

const agent = await createOpenAIToolsAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const result = await agentExecutor.invoke({
  input: "tell me something about drapcode",
});

console.log(result);
