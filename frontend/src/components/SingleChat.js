import {
  Avatar,
  Box,
  Button,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { toaster } from "./ui/toaster";
import ProfileModal from "./miscellaneous/ProfileModal";
import "./styles.css";

const SingleChat = ({ fetchAgain, setFetchAgain, isRightPanelOpen, setIsRightPanelOpen }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { user, selectedChat, setSelectedChat } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to load the messages",
        type: "error",
      });
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/message",
        { content: newMessage, chatId: selectedChat._id },
        config
      );
      setMessages([...messages, data]);
      setNewMessage("");
      setFetchAgain(!fetchAgain);
      setSending(false);
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to send the message",
        type: "error",
      });
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [selectedChat]);

  if (!selectedChat) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="100%"
        w="100%"
      >
        <Text fontSize="2xl" fontFamily="Work sans" color="var(--text-muted)">
          Select a chat to start messaging
        </Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDir="column" w="100%" h="100%" justifyContent="space-between">
      <Box
        display="flex"
        w="100%"
        alignItems="center"
        justifyContent="space-between"
        pb={3}
        px={2}
        borderBottom="var(--glass-border)"
      >
        <Text
          fontSize={{ base: "28px", md: "30px" }}
          fontFamily="Work sans"
          cursor="pointer"
          onClick={() => setSelectedChat("")}
        >
          {!selectedChat.isGroupChat ? (
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar.Root size="sm" display="inline-flex">
                <Avatar.Fallback
                  name={getSender(user, selectedChat.users)}
                />
                <Avatar.Image
                  src={getSenderFull(user, selectedChat.users)?.pic}
                />
              </Avatar.Root>
              <Text>{getSender(user, selectedChat.users)}</Text>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar.Root size="sm" display="inline-flex">
                <Avatar.Fallback name={user.name} />
                <Avatar.Image src={user.pic} />
              </Avatar.Root>
              <Text>{selectedChat.chatName.toUpperCase()}</Text>
            </Box>
          )}
        </Text>
        <Button 
          variant="ghost" 
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          color="var(--text-primary)"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          ⓘ
        </Button>
      </Box>

      <Box
        className="messages"
        flex="1"
        p={3}
        w="100%"
        borderRadius="lg"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "var(--text-muted)", borderRadius: "24px" },
        }}
      >
        {loading ? (
          <Spinner size="xl" display="flex" mx="auto" mt={12} />
        ) : (
          messages.map((m) => (
            <Box
              key={m._id}
              display="flex"
              justifyContent={
                m.sender._id === user._id ? "flex-end" : "flex-start"
              }
              mb={2}
            >
              <Box
                bg={m.sender._id === user._id ? "var(--accent-gradient)" : "rgba(255, 255, 255, 0.05)"}
                border={m.sender._id !== user._id ? "var(--glass-border)" : "none"}
                color="white"
                borderRadius="var(--glass-radius-sm)"
                px={4}
                py={2}
                maxW="75%"
              >
                <Text fontSize="xs" fontWeight="bold" mb={1} color={m.sender._id === user._id ? "rgba(255,255,255,0.8)" : "var(--text-secondary)"}>
                  {m.sender.name}
                </Text>
                <Text fontSize="sm">{m.content}</Text>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Box display="flex" w="100%" gap={2} mt={2}>
        <Input
          placeholder="Send a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          bg="rgba(255, 255, 255, 0.05)"
          border="var(--glass-border)"
          borderRadius="full"
          color="var(--text-primary)"
          _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
        />
        <Button 
          bg="var(--accent-gradient)"
          color="white"
          borderRadius="full"
          _hover={{ opacity: 0.9 }}
          onClick={sendMessage} 
          loading={sending}
          px={6}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default SingleChat;
