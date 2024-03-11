// 1. Importing axios for making HTTP requests and dotenv for managing environment variables.
import axios from "axios";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "dotenv";
config();

const vectorStore = new FaissStore(new OpenAIEmbeddings(), {});

const directory = "custom-chatgpt/faiss-store";

const loadedVectorStore = await FaissStore.load(
  directory,
  new OpenAIEmbeddings()
);

async function get_knowledge_base_results(query = "Hello") {
  console.log(`Called get_knowledge_base_results with query: ${query}`);

  const answer = await loadedVectorStore.similaritySearch(query);
  return JSON.stringify({ answer: answer });
}

async function get_response(req, res) {
  console.log("Req->>", req.query.question);
  const user_question = req.query.question;

  const baseURL = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
  };
  let data = {
    messages: [
      {
        role: "system",
        content:
          'You are a helpful assistant for Amazing Company named Drapcode. Your job is answer questions customer send to you. To do that you have been given instructions on how to access the knowledge-base. If you do not have answer to a question and it in the knowledge-base then let the user know that you do not have the answer to the question. You can say something like, "Hum, I am not sure." Keep your answers as concise as possible while still giving the required information. Do not break character. Avoid answering questions that are not at all relevant to the business.',
      },
      {
        role: "system",
        content: `If the user has asked any question and you don't have any answer to it then call the function get_knowledge_base_results with the user's question as the query parameter. Example call: get_knowledge_base_results(query='Whatever user's question is') This function will give you the relevant results from the knowledge base. You can use these results to answer the user's question.`,
      },
      { role: "user", content: `${user_question}` },
    ],
    model: "gpt-3.5-turbo-0613",
    functions: [
      {
        name: "get_knowledge_base_results",
        description: "Get the data from your knowledge base",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The query of the user",
            },
          },
          required: ["query"],
        },
      },
    ],
    function_call: "auto",
  };
  try {
    console.log(`Sending initial request to OpenAI API...`);
    let response = await axios.post(baseURL, data, { headers });
    response = response.data;
    let executedFunctions = {};
    while (
      response.choices[0].message.function_call &&
      response.choices[0].finish_reason !== "stop"
    ) {
      let message = response.choices[0].message;
      const function_name = message.function_call.name;
      if (executedFunctions[function_name]) {
        break;
      }
      let function_response = "";

      if (function_name === "get_knowledge_base_results") {
        let knowledgebaseArgs = JSON.parse(message.function_call.arguments);
        function_response = await get_knowledge_base_results(
          knowledgebaseArgs.query
        );
      } else {
        throw new Error(`Unsupported function: ${function_name}`);
      }

      console.log("Function response==>", function_response);

      executedFunctions[function_name] = true;
      data.messages.push({
        role: "function",
        name: function_name,
        content: function_response,
      });
      console.log(
        `Sending request to OpenAI with ${function_name} response...`
      );
      response = await axios.post(baseURL, data, { headers });
      response = response.data;
    }
    response = await axios.post(baseURL, data, { headers });
    response = response.data;
    let answer = "";
    if (response.choices[0]) {
      answer = response.choices[0].message.content;
    }
    res.send(answer);
  } catch (error) {
    res.send(error);
    console.error("Error:", error);
  }
}

export default get_response;
