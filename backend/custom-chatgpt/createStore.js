import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
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

console.log("store created");

export default pineconeStore;
