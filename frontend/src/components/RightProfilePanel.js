import { Avatar, Box, Button, SimpleGrid, Text, Spinner, Image } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const RightProfilePanel = ({ onClose }) => {
  const { user, setUser, selectedChat } = ChatState();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
        setMessages(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChat, user]);

  if (!selectedChat) {
    return (
      <Box
        display={{ base: "none", xl: "flex" }}
        flexDir="column"
        w="280px"
        h="100%"
        bg="var(--glass-bg)"
        backdropFilter="var(--glass-blur)"
        border="var(--glass-border)"
        borderRadius="var(--glass-radius-lg)"
        boxShadow="var(--glass-shadow)"
        p={6}
        color="var(--text-primary)"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="var(--text-muted)">No user selected</Text>
      </Box>
    );
  }

  const isGroup = selectedChat.isGroupChat;
  const chatName = isGroup ? selectedChat.chatName : getSender(user, selectedChat.users);
  const chatPic = isGroup ? "" : getSenderFull(user, selectedChat.users)?.pic;
  const chatEmail = isGroup ? `${selectedChat.users.length} members` : getSenderFull(user, selectedChat.users)?.email;

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  // Filter messages that look like images (simple URL check for this demo)
  const mediaMessages = messages.filter((m) => 
    m.content && (m.content.match(/\.(jpeg|jpg|gif|png)$/i) || m.content.includes("res.cloudinary.com"))
  );

  return (
    <Box
      display={{ base: "none", xl: "flex" }}
      flexDir="column"
      w="280px"
      h="100%"
      bg="var(--glass-bg)"
      backdropFilter="var(--glass-blur)"
      border="var(--glass-border)"
      borderRadius="var(--glass-radius-lg)"
      boxShadow="var(--glass-shadow)"
      p={6}
      color="var(--text-primary)"
    >
      <Box display="flex" flexDir="column" alignItems="center" mb={8}>
        <Avatar.Root size="2xl" mb={4}>
          <Avatar.Fallback name={chatName} />
          {chatPic && <Avatar.Image src={chatPic} />}
        </Avatar.Root>
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          {chatName}
        </Text>
        <Text fontSize="sm" color="var(--text-secondary)" textAlign="center">
          {chatEmail}
        </Text>
      </Box>

      <Box flex="1" overflowY="auto">
        <Text fontSize="sm" color="var(--text-secondary)" fontWeight="bold" mb={3}>
          Media
        </Text>
        {loading ? (
          <Spinner size="sm" />
        ) : mediaMessages.length > 0 ? (
          <SimpleGrid columns={3} gap={2}>
            {mediaMessages.map((m) => (
              <Box key={m._id} aspectRatio="1" borderRadius="md" overflow="hidden">
                <Image src={m.content} alt="media" objectFit="cover" w="100%" h="100%" />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text fontSize="xs" color="var(--text-muted)">No media shared</Text>
        )}
      </Box>

      <Button
        mt={4}
        w="100%"
        bg="var(--accent-gradient)"
        color="white"
        borderRadius="full"
        _hover={{ opacity: 0.9 }}
        onClick={logoutHandler}
      >
        Logout
      </Button>
    </Box>
  );
};

export default RightProfilePanel;
