import { Avatar, Box, Button, SimpleGrid, Text, Spinner, Image } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { LuX } from "react-icons/lu";

const RightProfilePanel = ({ isOpen, onClose }) => {
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
        display={{ base: "none", md: isOpen ? "flex" : "none" }}
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
    <>
      {/* Mobile Overlay */}
      <Box
        display={{ base: "block", md: "none" }}
        position="fixed"
        inset={0}
        bg="rgba(0,0,0,0.5)"
        backdropFilter="blur(4px)"
        zIndex={1200}
        opacity={isOpen ? 1 : 0}
        pointerEvents={isOpen ? "auto" : "none"}
        transition="opacity 0.3s ease-out"
        onClick={onClose}
      />

      {/* Main Drawer/Panel */}
      <Box
        display={{ base: "flex", md: isOpen ? "flex" : "none" }}
        position={{ base: "fixed", md: "relative" }}
        top={{ base: 0, md: "auto" }}
        right={{ base: 0, md: "auto" }}
        zIndex={{ base: 1201, md: 1 }}
        w={{ base: "85%", sm: "320px", md: "280px" }}
        h="100%"
        transform={{ base: isOpen ? "translateX(0)" : "translateX(100%)", md: "none" }}
        transition="transform 0.3s ease-out"
        flexDir="column"
        bg="var(--glass-bg)"
        backdropFilter="var(--glass-blur)"
        border="var(--glass-border)"
        borderRadius={{ base: "var(--glass-radius-lg) 0 0 var(--glass-radius-lg)", md: "var(--glass-radius-lg)" }}
        boxShadow="var(--glass-shadow)"
        p={6}
        color="var(--text-primary)"
      >
        <Box justifyContent="flex-end" display={{ base: "flex", md: "none" }} mb={2} mt={-2} mr={-2}>
          <Button variant="ghost" size="sm" onClick={onClose} color="var(--text-secondary)">
            <LuX size={20} />
          </Button>
        </Box>
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
    </>
  );
};

export default RightProfilePanel;
