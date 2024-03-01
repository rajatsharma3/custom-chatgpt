import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import pineconeStore from "./createStore.js";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document } from "langchain/document";
import { config } from "dotenv";

config();

export const addDocument = async (req, res) => {
  try {
    const loader = new PDFLoader("custom-chatgpt/BVICAM.pdf");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 25,
    });

    const document = await splitter.splitDocuments(docs);

    await pineconeStore.addDocuments(document);

    res.send({ msg: "document added successfully" });
  } catch (err) {
    console.log("error:-", err);
    res.send(err);
  }
};
