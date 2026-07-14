import { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { toaster } from "../components/ui/toaster";

const ENDPOINT = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:3000" : window.location.origin;

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
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user) {
      const socketInstance = io(ENDPOINT);
      socketInstance.emit("setup", user);
      
      socketInstance.on("connected", () => {
        console.log("Socket connected successfully");
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleGroupRenamed = ({ groupId, newName }) => {
      setSelectedChat((prev) => {
        if (prev && prev._id === groupId) {
          return { ...prev, chatName: newName };
        }
        return prev;
      });
      setChats((prevChats) =>
        prevChats.map((c) => (c._id === groupId ? { ...c, chatName: newName } : c))
      );
    };

    socket.on("group-renamed", handleGroupRenamed);

    return () => {
      socket.off("group-renamed", handleGroupRenamed);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      const chatOfMessage = newMessageReceived.chat;

      setSelectedChat((currentSelectedChat) => {
        if (currentSelectedChat && currentSelectedChat._id === chatOfMessage._id) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMessageReceived._id)) {
              return prev;
            }
            return [...prev, newMessageReceived];
          });
        } else {
          setNotification((prevNotification) => {
            if (!prevNotification.some((n) => n._id === newMessageReceived._id)) {
              toaster.create({
                title: `New Message from ${newMessageReceived.sender.name}`,
                description: newMessageReceived.content,
                type: "info",
              });
              return [newMessageReceived, ...prevNotification];
            }
            return prevNotification;
          });
        }
        return currentSelectedChat;
      });

      setChats((prevChats) => {
        const chatExists = prevChats.some((c) => c._id === chatOfMessage._id);

        if (chatExists) {
          const updatedChats = prevChats.map((c) => {
            if (c._id === chatOfMessage._id) {
              return { ...c, latestMessage: newMessageReceived };
            }
            return c;
          });

          const targetChat = updatedChats.find((c) => c._id === chatOfMessage._id);
          const remainingChats = updatedChats.filter((c) => c._id !== chatOfMessage._id);

          return [targetChat, ...remainingChats];
        } else {
          const newChat = { ...chatOfMessage, latestMessage: newMessageReceived };
          return [newChat, ...prevChats];
        }
      });
    };

    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [socket]);

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
        socket,
        messages,
        setMessages,
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
