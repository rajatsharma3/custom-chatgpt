import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { config } from "dotenv";

config();

const vectorStore = new FaissStore(new OpenAIEmbeddings(), {});

const directory = "custom-chatgpt/faiss-store";

export const faissPost = async (req, res) => {
  try {
    const loader = new PDFLoader("custom-chatgpt/documents/drapcodeintro.pdf");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 25,
    });

    const document = await splitter.splitDocuments(docs);

    await vectorStore.addDocuments(document);
    await vectorStore.save(directory);

    res.send({ msg: "document added successfully" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

export const faissGet = async (req, res) => {
  try {
    const loadedVectorStore = await FaissStore.load(
      directory,
      new OpenAIEmbeddings()
    );

    const model = new OpenAI({ temperature: 0.6 });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: loadedVectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const result = await chain.invoke({
      query: "tell me something about drapcode",
    });

    console.log(result.text);
    res.send(result.text);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
