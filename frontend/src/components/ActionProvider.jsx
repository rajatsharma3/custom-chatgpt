// in ActionProvider.jsx
import React from "react";
import axios from "axios";

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const handleHello = async (message) => {
    console.log("message------->", message);

    try {
      const response = await axios.get(
        "http://localhost:3002/customgpt/getresponse",
        {
          params: {
            question: message,
          },
        }
      );

      console.log(response);

      const botMessage = createChatBotMessage(response.data); // Assuming the response is an object with a 'data' property

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } catch (error) {
      console.error("Error fetching response:", error);
      // Handle errors as needed
    }
  };

  // Put the handleHello function in the actions object to pass to the MessageParser
  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleHello,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;
