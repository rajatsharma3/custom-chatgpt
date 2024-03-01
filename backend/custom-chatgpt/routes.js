import { Router } from "express";
import { addDocument } from "./addDocument.js";
import { getAns } from "./retriveData.js";

const appRoute = new Router();

appRoute.get("/adddocument", addDocument);
appRoute.get("/getans", getAns);

export default appRoute;
