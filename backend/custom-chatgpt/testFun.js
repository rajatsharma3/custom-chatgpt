// // 1. Importing axios for making HTTP requests and dotenv for managing environment variables.
// import axios from "axios";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { config } from "dotenv";
// config();

// const vectorStore = new FaissStore(new OpenAIEmbeddings(), {});

// const directory = "custom-chatgpt/faiss-store";

// // 2. Function to simulate getting current weather.
// function get_current_weather(location, unit = "fahrenheit") {
//   // 3. Logs function call details.
//   console.log(
//     `Called get_current_weather with location: ${location} and unit: ${unit}`
//   );
//   // 4. Returns simulated weather data.
//   return JSON.stringify({
//     location: location,
//     temperature: "30",
//     unit: unit,
//     forecast: ["sunny", "windy"],
//   });
// }

// // 5. Function to simulate getting clothing recommendations based on temperature.
// function get_clothing_recommendations(temperature) {
//   // 6. Logs function call details.
//   console.log(
//     `Called get_clothing_recommendations with temperature: ${temperature}`
//   );
//   // 7. Provides clothing recommendation based on the temperature.
//   let recommendation =
//     temperature < 60 ? "warm clothing colourful" : "light clothing tye-dye";
//   // 8. Returns clothing recommendation.
//   return JSON.stringify({ recommendation: recommendation });
// }

// const loadedVectorStore = await FaissStore.load(
//   directory,
//   new OpenAIEmbeddings()
// );

// function get_knowledge_base_results(query = "Hello") {
//   // 3. Logs function call details.
//   console.log(`Called get_knowledge_base_results with query: ${query}`);

//   // const answer = await loadedVectorStore.similaritySearch(query);
//   const answer = "Drapcode is a no code platform founded by vishal sahu";
//   // 4. Returns simulated weather data.
//   return JSON.stringify({ answer: answer });
// }

// // 9. Main function to handle the conversation with the API.
// async function run_conversation() {
//   // 10. The base URL for OpenAI API.
//   const baseURL = "https://api.openai.com/v1/chat/completions";
//   // 11. Headers for the OpenAI API request.
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: "Bearer " + process.env.OPENAI_API_KEY,
//   };
//   // 12. Data to send to the API.
//   let data = {
//     messages: [
//       {
//         role: "system",
//         content:
//           'You are a helpful assistant for Amazing Company named Drapcode. Your job is answer questions customer send to you. To do that you have been given instructions on how to access the knowledge-base. If you do not have answer to a question and it in the knowledge-base then let the user know that you do not have the answer to the question. You can say something like, "Hum, I am not sure." Keep your answers as concise as possible while still giving the required information. Do not break character. Avoid answering questions that are not at all relevant to the business.',
//       },
//       {
//         role: "system",
//         content: `If the user has asked any question and you don't have any answer to it then call the function get_knowledge_base_results with the user's question as the query parameter. Example call: get_knowledge_base_results(query='Whatever user's question is') This function will give you the relevant results from the knowledge base. You can use these results to answer the user's question.`,
//       },
//       { role: "user", content: "tell me something about drapcode" },
//     ],
//     model: "gpt-3.5-turbo-0613",
//     functions: [
//       {
//         name: "get_current_weather",
//         description: "Get the current weather in a given location",
//         parameters: {
//           type: "object",
//           properties: {
//             location: {
//               type: "string",
//               description: "The city and state, e.g. San Francisco, CA",
//             },
//             unit: { type: "string", enum: ["celsius", "fahrenheit"] },
//           },
//           required: ["location"],
//         },
//       },
//       {
//         name: "get_clothing_recommendations",
//         description: "Get clothing recommendation based on temperature",
//         parameters: {
//           type: "object",
//           properties: {
//             temperature: {
//               type: "string",
//               description: "The current temperature",
//             },
//           },
//           required: ["temperature"],
//         },
//       },
//       {
//         name: "get_knowledge_base_results",
//         description: "return the answer from the knowledge base",
//         parameters: {
//           type: "object",
//           properties: {
//             query: {
//               type: "string",
//               description: "The query of the user",
//             },
//           },
//           required: ["query"],
//         },
//       },
//     ],
//     function_call: "auto",
//   };
//   // 13. Try block to handle potential errors.
//   try {
//     // 14. Initial API request.
//     console.log(`Sending initial request to OpenAI API...`);
//     console.log("data1==>", data);
//     let response = await axios.post(baseURL, data, { headers });
//     response = response.data;
//     // 15. Track Executed Functions to Prevent Unnecessary Invocations
//     let executedFunctions = {};
//     // 16. Loop to process the conversation until it finishes.
//     while (
//       response.choices[0].message.function_call &&
//       response.choices[0].finish_reason !== "stop"
//     ) {
//       let message = response.choices[0].message;
//       const function_name = message.function_call.name;
//       // 17. Breaks the loop if function has already been executed.
//       if (executedFunctions[function_name]) {
//         break;
//       }
//       // 18. Calls the appropriate function based on the name.
//       let function_response = "";
//       switch (function_name) {
//         case "get_current_weather":
//           let weatherArgs = JSON.parse(message.function_call.arguments);
//           function_response = get_current_weather(
//             weatherArgs.location,
//             weatherArgs.unit
//           );
//           break;
//         case "get_knowledge_base_results":
//           let knowledgebaseArgs = JSON.parse(message.function_call.arguments);
//           function_response = get_knowledge_base_results(
//             knowledgebaseArgs.query
//           );
//           break;

//         case "get_clothing_recommendations":
//           let recommendationArgs = JSON.parse(message.function_call.arguments);
//           function_response = get_clothing_recommendations(
//             recommendationArgs.temperature
//           );
//           break;

//         default:
//           throw new Error(`Unsupported function: ${function_name}`);
//       }
//       // 19. Adds the function to the executed functions list.
//       executedFunctions[function_name] = true;
//       // 20. Appends the function response to the messages list.
//       data.messages.push({
//         role: "function",
//         name: function_name,
//         content: function_response,
//       });
//       // 21. Makes another API request with the updated messages list.
//       console.log(
//         `Sending request to OpenAI with ${function_name} response...`
//       );
//       console.log("data2==>", data);
//       response = await axios.post(baseURL, data, { headers });
//       console.log("working2");
//       response = response.data;
//     }
//     // 22. Makes the final API request after the conversation is finished.
//     console.log("data3==>", data);
//     response = await axios.post(baseURL, data, { headers });
//     response = response.data;
//     // 23. Returns the final response data.
//     return response;
//   } catch (error) {
//     // 24. Logs any error encountered during execution.
//     console.error("Error:", error);
//   }
// }

// // 25. Running the conversation and processing the response.
// run_conversation()
//   .then((response) => {
//     // 26. Logging the final message content.
//     console.log(response);
//   })
//   .catch((error) => {
//     // 27. Logging any error encountered during execution.
//     console.error("Error:", error);
//   });
