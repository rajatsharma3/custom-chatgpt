import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { config } from "dotenv";

config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const isIndex = await pc.describeIndex("custom-chatbot");
const status = isIndex.status.state;
if (status !== "Ready") {
  console.log("creating new Index");
  try {
    await pc.createIndex({
      name: "custom-chatbot",
      dimension: 1536,
      metric: "cosine",
      spec: {
        pod: {
          environment: "gcp-starter",
          podType: "starter",
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
} else {
  console.log("Index already exists");
}

const pineconeIndex = pc.index("custom-chatbot");

const pineconeStore = new PineconeStore(new OpenAIEmbeddings(), {
  pineconeIndex,
  maxConcurrency: 5,
});

export const pineconePost = async (req, res) => {
  try {
    const loader = new PDFLoader("custom-chatgpt/documents/BVICAM.pdf");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 25,
    });

    const document = await splitter.splitDocuments(docs);

    await pineconeStore.addDocuments(document, { namespace: "bvicam" });

    res.send({ msg: "document added successfully" });
  } catch (err) {
    console.log("error:-", err);
    res.send(err);
  }
};

export const pineconeGet = async (req, res) => {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const pineconeIndex = pc.index("custom-chatbot");

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex, namespace: "drapcode" }
    );

    const model = new OpenAI({ temperature: 0.6 });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model),
      retriever: vectorStore.asRetriever(),
      returnSourceDocuments: true,
    });

    const result = await chain.invoke({
      query: "tell me something about drapcode",
    });

    console.log(result.text);
    res.send(result.text);
  } catch (err) {
    console.log("error", err);
    res.send(err);
  }
};
