import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { config } from "dotenv";
config();

const supabaseKey = process.env.SUPABASE_PRIVATE_KEY;
if (!supabaseKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) throw new Error(`Expected env var SUPABASE_URL`);

const client = createClient(supabaseUrl, supabaseKey);
const vectorStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
  client,
  tableName: "documents",
});

export const supabasePost = async (req, res) => {
  try {
    const loader = new PDFLoader("custom-chatgpt/documents/drapcodeintro.pdf");

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 25,
    });

    const splittedDocs = await splitter.splitDocuments(docs);

    await vectorStore.addDocuments(splittedDocs);

    res.send({ msg: "document added successfully" });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

export const supabaseGet = async (req, res) => {
  try {
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
    console.log(err);
    res.send({ error: err });
  }
};
