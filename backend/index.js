import express from "express";
import { config } from "dotenv";
import appRoute from "./custom-chatgpt/routes.js";
config();

const PORT = process.env.PORT;
const app = express();

app.use("/customgpt", appRoute);

app.listen(PORT, () => {
  console.log(`app is listening at ${PORT}`);
});
