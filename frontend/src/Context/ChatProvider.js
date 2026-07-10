import { createContext, useContext, useState } from "react";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Failed to parse userInfo from localStorage:", error);
      return null;
    }
  });
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("ChatState must be used within ChatProvider");
  }

  return context;
};
