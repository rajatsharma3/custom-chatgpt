import { Pinecone } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { config } from "dotenv";
config();

export const createNamespace = async (req, res) => {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const pineconeIndex = pc.index("custom-chatbot");

    // const namespace = pineconeIndex.namespace("drapcode");

    const pineconeStore = new PineconeStore(new OpenAIEmbeddings(), {
      pineconeIndex,
      maxConcurrency: 5,
    });
    console.log("store created");

    const loader = new PDFLoader("custom-chatgpt/BVICAM.pdf");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 25,
    });

    const document = await splitter.splitDocuments(docs);
    await pineconeStore.addDocuments(document, {
      namespace: "bvicam",
    });

    res.send({ msg: "document added successfully" });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
};
