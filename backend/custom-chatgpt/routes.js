import { Router } from "express";
import { supabaseGet, supabasePost } from "./supabase.js";
import { malvisPost, malvisGet } from "./milvus.js";
import { pineconeGet, pineconePost } from "./pinecone.js";
import { faissGet, faissPost } from "./faiss.js";
// import { testing } from "./openaiFunction.js";

const appRoute = new Router();

// //pinecone routes
// appRoute.get("/pineconepost", pineconePost);
// appRoute.get("/pineconeget", pineconeGet);

// //supabase routes
// appRoute.get("/supabasepost", supabasePost);
// appRoute.get("/supabaseget", supabaseGet);

// //malvis routes
// appRoute.get("/milvuspost", malvisPost);
// appRoute.get("/milvusget", malvisGet);

// //faiss routes
// appRoute.get("/faisspost", faissPost);
// appRoute.get("/faissget", faissGet);

//testing routes
// appRoute.get("/testing", testing);

export default appRoute;
