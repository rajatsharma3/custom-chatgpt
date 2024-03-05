import { Milvus } from "langchain/vectorstores/milvus";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { config } from "dotenv";
config();

const milvus = new Milvus({
  uri: process.env.MILVUS_URL,
  token: process.env.MILVUS_API_KEY,
});

export const malvisPost = async (req, res) => {
  console.log(milvus);
  const loader = new PDFLoader("custom-chatgpt/drapcodeintro.pdf");

  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 150,
    chunkOverlap: 25,
  });

  const splittedDocs = await splitter.splitDocuments(docs);

  const vectorStore = await milvus.fromDocuments(docs, new OpenAIEmbeddings(), {
    collectionName: "goldel_escher_bach",
  });

  const response = await vectorStore.similaritySearch("scared", 2);
  res.send(response);
};
