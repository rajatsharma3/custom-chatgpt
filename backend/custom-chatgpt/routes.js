import { Router } from "express";
import { addDocument } from "./addDocument.js";
import { getAns } from "./retriveData.js";
import { createNamespace } from "./createNamespace.js";
import { supabaseGet, supabasePost } from "./supabase.js";
import { malvisPost } from "./milvus.js";

const appRoute = new Router();

//pinecone routes
appRoute.get("/adddocument", addDocument);
appRoute.get("/getans", getAns);
appRoute.get("/createnamespace", createNamespace);

//supabase routes
appRoute.get("/supabasepost", supabasePost);
appRoute.get("/supabaseget", supabaseGet);

//malvis routes
appRoute.get("/malvispost", malvisPost);

export default appRoute;
