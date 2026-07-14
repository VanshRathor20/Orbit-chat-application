import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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

  const socketRef = useRef(null);
  const disconnectTimeoutRef = useRef(null);
  const shownMessageIdsRef = useRef(new Set());
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (user) {
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
        disconnectTimeoutRef.current = null;
      }

      if (!socketRef.current) {
        const socketInstance = io(ENDPOINT);
        socketInstance.emit("setup", user);

        socketInstance.on("connected", () => {
          console.log("Socket connected successfully:", socketInstance.id);
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);
      } else {
        setSocket(socketRef.current);
      }

      return () => {
        disconnectTimeoutRef.current = setTimeout(() => {
          if (socketRef.current) {
            console.log("Disconnecting socket:", socketRef.current.id);
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
          }
        }, 100);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
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

    const handleGroupPictureUpdated = ({ groupId, newPic }) => {
      setSelectedChat((prev) => {
        if (prev && prev._id === groupId) {
          return { ...prev, groupPic: newPic };
        }
        return prev;
      });
      setChats((prevChats) =>
        prevChats.map((c) => (c._id === groupId ? { ...c, groupPic: newPic } : c))
      );
    };

    socket.on("group-renamed", handleGroupRenamed);
    socket.on("group-picture-updated", handleGroupPictureUpdated);

    return () => {
      socket.off("group-renamed", handleGroupRenamed);
      socket.off("group-picture-updated", handleGroupPictureUpdated);
    };
  }, [socket]);

  const handleMessageReceived = useCallback((newMessageReceived) => {
    const chatOfMessage = newMessageReceived.chat;
    const currentSelectedChat = selectedChatRef.current;

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
          if (!shownMessageIdsRef.current.has(newMessageReceived._id)) {
            shownMessageIdsRef.current.add(newMessageReceived._id);
            toaster.create({
              title: `New Message from ${newMessageReceived.sender.name}`,
              description: newMessageReceived.messageType === "image" ||
                           (newMessageReceived.content &&
                             (newMessageReceived.content.match(/\.(jpeg|jpg|gif|png)$/i) ||
                              newMessageReceived.content.includes("res.cloudinary.com")))
                            ? "📷 Photo"
                            : newMessageReceived.content,
              type: "info",
            });
          }
          return [newMessageReceived, ...prevNotification];
        }
        return prevNotification;
      });
    }

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
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [socket, handleMessageReceived]);

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
