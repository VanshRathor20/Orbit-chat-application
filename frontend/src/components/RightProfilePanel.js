import { Avatar, Box, Button, SimpleGrid, Text, Spinner, Image, Stack } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { LuX } from "react-icons/lu";
import ImagePreviewModal from "./miscellaneous/ImagePreviewModal";

const RightProfilePanel = ({ isOpen, onClose }) => {
  const { user, setUser, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const isCustomPic = (pic) => pic && pic !== "backend/Models/userProfileIcon.png";

  const accessChat = async (userId) => {
    if (userId === user._id) return;
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setLoadingChat(false);
    } catch (error) {
      console.error(error);
      setLoadingChat(false);
    }
  };

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
        display={{ base: "none", xl: isOpen ? "flex" : "none" }}
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
  const chatEmail = isGroup ? "Group Chat" : getSenderFull(user, selectedChat.users)?.email;

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
        display={{ base: "block", xl: "none" }}
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
        display={{ base: "flex", xl: isOpen ? "flex" : "none" }}
        position={{ base: "fixed", xl: "relative" }}
        top={{ base: 0, xl: "auto" }}
        right={{ base: 0, xl: "auto" }}
        zIndex={{ base: 1201, xl: 1 }}
        w={{ base: "85%", sm: "320px", md: "60%", lg: "65%", xl: "280px" }}
        h="100%"
        transform={{ base: isOpen ? "translateX(0)" : "translateX(100%)", xl: "none" }}
        transition="transform 0.3s ease-out"
        flexDir="column"
        bg="var(--glass-bg)"
        backdropFilter="var(--glass-blur)"
        border="var(--glass-border)"
        borderRadius={{ base: "var(--glass-radius-lg) 0 0 var(--glass-radius-lg)", xl: "var(--glass-radius-lg)" }}
        boxShadow="var(--glass-shadow)"
        p={6}
        color="var(--text-primary)"
      >
        <Box justifyContent="flex-end" display={{ base: "flex", xl: "none" }} mb={2} mt={-2} mr={-2}>
          <Button variant="ghost" size="sm" onClick={onClose} color="var(--text-secondary)">
            <LuX size={20} />
          </Button>
        </Box>
        <Box display="flex" flexDir="column" alignItems="center" mb={{ base: 8, md: 12, xl: 8 }}>
        <Avatar.Root 
          w={{ base: "80px", md: "115px", xl: "80px" }} 
          h={{ base: "80px", md: "115px", xl: "80px" }} 
          border={{ base: "2px solid rgba(255, 255, 255, 0.1)", md: "3px solid rgba(255, 255, 255, 0.2)", xl: "2px solid rgba(255, 255, 255, 0.1)" }}
          mb={{ base: 4, md: 6, xl: 4 }}
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          onClick={() => {
            setPreviewUrl(chatPic || "backend/Models/userProfileIcon.png");
            setPreviewName(chatName);
          }}
        >
          <Avatar.Fallback name={chatName} fontSize={{ base: "2xl", md: "4xl", xl: "2xl" }} />
          {isCustomPic(chatPic) && <Avatar.Image src={chatPic} />}
        </Avatar.Root>
        <Text 
          fontSize={{ base: "xl", md: "2xl", xl: "xl" }} 
          fontWeight="bold" 
          textAlign="center"
          mb={{ base: 1, md: 2, xl: 1 }}
        >
          {chatName}
        </Text>
        <Text fontSize={{ base: "sm", md: "md", xl: "sm" }} color="var(--text-secondary)" textAlign="center">
          {chatEmail}
        </Text>
      </Box>

      <Box flex="1" overflowY="auto">
        {isGroup ? (
          <>
            <Text fontSize={{ base: "sm", md: "md", xl: "sm" }} color="var(--text-secondary)" fontWeight="bold" mb={3}>
              Group Members ({selectedChat.users.length})
            </Text>
            <Box 
              maxH="340px" 
              overflowY="auto" 
              pr={1}
              sx={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": { background: "var(--text-muted)", borderRadius: "24px" },
              }}
            >
              <Stack gap={2}>
                {selectedChat.users.map((u) => {
                  const hasCustomPic = isCustomPic(u.pic);
                  const isCurrentUser = u._id === user._id;

                  return (
                    <Box 
                      key={u._id} 
                      display="flex" 
                      alignItems="center" 
                      gap={3}
                      px={3}
                      py={2}
                      borderRadius="var(--glass-radius-sm)"
                      _hover={!isCurrentUser ? { bg: "rgba(255, 255, 255, 0.05)" } : undefined}
                      cursor={!isCurrentUser ? "pointer" : "default"}
                      onClick={!isCurrentUser ? () => accessChat(u._id) : undefined}
                      color="var(--text-primary)"
                    >
                      <Avatar.Root 
                        size="sm"
                        cursor="pointer"
                        _hover={{ opacity: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(u.pic || "backend/Models/userProfileIcon.png");
                          setPreviewName(u.name);
                        }}
                      >
                        <Avatar.Fallback name={u.name} />
                        {hasCustomPic && <Avatar.Image src={u.pic} />}
                      </Avatar.Root>
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {u.name}{isCurrentUser ? " (You)" : ""}
                      </Text>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </>
        ) : (
          <>
            <Text fontSize={{ base: "sm", md: "md", xl: "sm" }} color="var(--text-secondary)" fontWeight="bold" mb={{ base: 3, md: 5, xl: 3 }}>
              Media
            </Text>
            {loading ? (
              <Spinner size="sm" />
            ) : mediaMessages.length > 0 ? (
              <SimpleGrid columns={3} gap={2}>
                {mediaMessages.map((m) => (
                  <Box 
                    key={m._id} 
                    aspectRatio="1" 
                    borderRadius="md" 
                    overflow="hidden"
                    cursor="pointer"
                    _hover={{ opacity: 0.8 }}
                    onClick={() => setPreviewUrl(m.content)}
                  >
                    <Image src={m.content} alt="media" objectFit="cover" w="100%" h="100%" />
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Text fontSize={{ base: "xs", md: "sm", xl: "xs" }} color="var(--text-muted)">No media shared</Text>
            )}
          </>
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
      <ImagePreviewModal 
        src={previewUrl} 
        name={previewName}
        isOpen={Boolean(previewUrl)} 
        onClose={() => {
          setPreviewUrl("");
          setPreviewName("");
        }} 
      />
    </Box>
    </>
  );
};

export default RightProfilePanel;
