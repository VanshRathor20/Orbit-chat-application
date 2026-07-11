import { Avatar, Box, Button, SimpleGrid, Text } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useNavigate } from "react-router-dom";

const RightProfilePanel = ({ onClose }) => {
  const { user, selectedChat } = ChatState();
  const navigate = useNavigate();

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
    navigate("/");
  };

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
        <SimpleGrid columns={3} gap={2}>
          {/* Placeholder grid items */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box
              key={i}
              aspectRatio="1"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
            />
          ))}
        </SimpleGrid>
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
