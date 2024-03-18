import { Router } from "express";
import { supabaseGet, supabasePost } from "./supabase.js";
import { malvisPost, malvisGet } from "./milvus.js";
import { pineconeGet, pineconePost } from "./pinecone.js";
import { faissGet, faissPost } from "./faiss.js";
import get_response from "./openaiFunction.js";
import { upload } from "./middleware/uploadfile.js";
import { crawlURls, train, getData } from "./sitemap-loader.js";

const appRoute = new Router();

//upload a file
appRoute.post("/upload", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded successfully" });
});

// //pinecone routes
appRoute.get("/pineconepost", pineconePost);
appRoute.get("/pineconeget", pineconeGet);

// //supabase routes
appRoute.get("/supabasepost", supabasePost);
appRoute.get("/supabaseget", supabaseGet);

// //malvis routes
appRoute.get("/milvuspost", malvisPost);
appRoute.get("/milvusget", malvisGet);

// //faiss routes
appRoute.get("/faisspost", faissPost);
appRoute.get("/faissget", faissGet);

//response routes
appRoute.get("/getresponse", get_response);

//crawl-url routes
appRoute.get("/crawl", crawlURls);
appRoute.get("/train", train);
appRoute.get("/getdata", getData);

export default appRoute;
