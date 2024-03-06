import { Milvus } from "@langchain/community/vectorstores/milvus";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { config } from "dotenv";
config();

const clientConfig = {
  address: process.env.MILVUS_URL,
  token: process.env.MILVUS_API_KEY,
  ssl: false,
  username: process.env.MILVUS_USERNAME,
  password: process.env.MILVUS_PASSWORD,
};

const client = new Milvus(new OpenAIEmbeddings(), {
  collectionName: "testing",
  clientConfig,
});

export const malvisPost = async (req, res) => {
  try {
    const loader = new PDFLoader("custom-chatgpt/documents/drapcodeintro.pdf");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 25,
    });

    const splittedDocs = await splitter.splitDocuments(docs);

    const addDocs = await client.addDocuments(docs);
    res.send(addDocs);
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

export const malvisGet = async (req, res) => {
  try {
    const model = new OpenAI({ temperature: 0.6 });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: client.asRetriever(),
      returnSourceDocuments: true,
    });

    const result = await chain.invoke({
      query: "tell me something about drapcode",
    });

    console.log(result.text);
    res.send(result.text);
  } catch (error) {
    res.send(error);
  }
};
