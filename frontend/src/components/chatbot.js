import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";

import config from "./config.js";
import MessageParser from "./MessageParser.jsx";
import ActionProvider from "./ActionProvider.jsx";

const MyChatbot = () => {
  return (
    <div>
      <div className="d-flex text-align-center justify-content-center align-items-center">
        <div className="card">
          <div className="card-body">
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyChatbot;
