import React, { useState } from "react";
import ChatbotModal from "./ChatbotModal";

const ChatbotButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return <ChatbotModal isOpen={isModalOpen} onClose={toggleModal} />;
};

export default ChatbotButton;
