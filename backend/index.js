import express from "express";
import { config } from "dotenv";
import cors from "cors"; // Change import statement for cors
import appRoute from "./custom-chatgpt/routes.js";
config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors()); // Use cors middleware
app.use(express.json());

app.use("/customgpt", appRoute);

app.listen(PORT, () => {
  console.log(`app is listening at ${PORT}`);
});
