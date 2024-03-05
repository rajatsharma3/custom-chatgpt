import { config } from "dotenv";
import { OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

config();

export const getAns = async (req, res) => {
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
