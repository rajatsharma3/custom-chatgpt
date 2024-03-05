import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { config } from "dotenv";
config();

const privateKey = process.env.SUPABASE_PRIVATE_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

const url = process.env.SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);

export const supabasePost = async (req, res) => {
  try {
    const loader = new PDFLoader("custom-chatgpt/drapcodeintro.pdf");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 25,
    });

    const splittedDocs = await splitter.splitDocuments(docs);

    const client = createClient(url, privateKey);

    const embeddings = new OpenAIEmbeddings();

    const store = new SupabaseVectorStore(embeddings, {
      client,
      tableName: "documents",
    });

    await store.addDocuments(splittedDocs);

    res.send({ msg: "document added successfully" });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

export const supabaseGet = async (req, res) => {
  try {
    const client = createClient(url, privateKey);
    const vectorStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client,
      tableName: "documents",
    });

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
    res.send({ error: err });
  }
};
