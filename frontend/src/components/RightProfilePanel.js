import { Avatar, Box, Button, SimpleGrid, Text, Spinner, Image, Stack, IconButton, Input, VStack } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useState, useEffect } from "react";
import axios from "axios";
import { LuX, LuPencil, LuPlus, LuMessageSquare, LuVolumeX, LuVideo, LuLogOut, LuUserPlus } from "react-icons/lu";
import ImagePreviewModal from "./miscellaneous/ImagePreviewModal";
import AddMemberModal from "./miscellaneous/AddMemberModal";
import { toaster } from "./ui/toaster";

const RightProfilePanel = ({ isOpen, onClose }) => {
  const { user, setUser, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const isGroup = selectedChat?.isGroupChat;

  useEffect(() => {
    if (selectedChat) {
      setEditedName(selectedChat.isGroupChat ? selectedChat.chatName : "");
    }
  }, [selectedChat]);

  const handleRename = async () => {
    if (!editedName.trim() || editedName === selectedChat.chatName) {
      setIsEditingName(false);
      return;
    }

    const oldName = selectedChat.chatName;

    // Optimistic UI updates
    const updatedSelectedChat = { ...selectedChat, chatName: editedName };
    setSelectedChat(updatedSelectedChat);
    setChats(chats.map((c) => (c._id === selectedChat._id ? updatedSelectedChat : c)));
    setIsEditingName(false);

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.patch(
        `/api/groups/${selectedChat._id}/rename`,
        { name: editedName },
        config
      );

      setSelectedChat(data);
      setChats(chats.map((c) => (c._id === data._id ? data : c)));

      toaster.create({
        title: "Group renamed successfully",
        type: "success",
      });
    } catch (error) {
      // Revert on failure
      setSelectedChat({ ...selectedChat, chatName: oldName });
      setChats(chats.map((c) => (c._id === selectedChat._id ? { ...c, chatName: oldName } : c)));

      toaster.create({
        title: "Failed to rename group",
        description: error.response?.data?.message || error.message,
        type: "error",
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: user._id,
        },
        config
      );

      toaster.create({
        title: "You have left the group",
        type: "success",
      });
      setSelectedChat(null);
      setChats(chats.filter((c) => c._id !== selectedChat._id));
      onClose();
    } catch (error) {
      toaster.create({
        title: "Failed to leave group",
        description: error.response?.data?.message || error.message,
        type: "error",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const datePart = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(date);
    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date).toLowerCase();
    return `${datePart} at ${timePart}`;
  };

  const isCustomPic = (pic) => pic && pic !== "backend/Models/userProfileIcon.png";

  const accessChat = async (userId) => {
    if (userId === user._id) return;
    try {
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
    } catch (error) {
      console.error(error);
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

  const chatName = isGroup ? selectedChat?.chatName : getSender(user, selectedChat?.users || []);
  const chatPic = isGroup ? "" : getSenderFull(user, selectedChat?.users || [])?.pic;
  const chatEmail = isGroup ? "Group Chat" : getSenderFull(user, selectedChat?.users || [])?.email;



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
        w={{ base: "85%", sm: "320px", md: "60%", lg: "65%", xl: "360px" }}
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
        <Box order={0} justifyContent="flex-end" display={{ base: "flex", xl: "none" }} mb={2} mt={-2} mr={-2}>
          <Button variant="ghost" size="sm" onClick={onClose} color="var(--text-secondary)">
            <LuX size={20} />
          </Button>
        </Box>

        <Box order={1} display="flex" flexDir="column" alignItems="center" mb={{ base: 4, md: 6, xl: 4 }}>
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

          {isEditingName ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setEditedName(selectedChat.chatName);
                  setIsEditingName(false);
                }
              }}
              autoFocus
              size="sm"
              textAlign="center"
              bg="rgba(255, 255, 255, 0.05)"
              border="var(--glass-border)"
              color="var(--text-primary)"
              _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
              mb={2}
            />
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={{ base: 1, md: 2, xl: 1 }} w="100%" px={4}>
              {isGroup && (
                <Box w="24px" flexShrink={0} />
              )}
              <Text
                fontSize={{ base: "xl", md: "2xl", xl: "xl" }}
                fontWeight="bold"
                textAlign="center"
                noOfLines={1}
                flex="1"
              >
                {chatName}
              </Text>
              {isGroup && (
                <IconButton
                  aria-label="Rename Group"
                  variant="ghost"
                  size="xs"
                  w="24px"
                  h="24px"
                  flexShrink={0}
                  onClick={() => setIsEditingName(true)}
                  color="var(--text-secondary)"
                  _hover={{ bg: "whiteAlpha.200", color: "white" }}
                >
                  <LuPencil />
                </IconButton>
              )}
            </Box>
          )}

          <Text fontSize={{ base: "sm", md: "md", xl: "sm" }} color="var(--text-secondary)" textAlign="center">
            {chatEmail}
          </Text>
        </Box>

        {isGroup && (
          <SimpleGrid columns={3} gap={2} w="100%" my={4} order={{ base: 2, xl: 4 }}>
            <VStack gap={1}>
              <IconButton
                aria-label="Message"
                size="sm"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                onClick={onClose}
              >
                <LuMessageSquare size={16} />
              </IconButton>
              <Text fontSize="10px" color="var(--text-secondary)">Message</Text>
            </VStack>
            <VStack gap={1}>
              <IconButton
                aria-label="Add Member"
                size="sm"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                onClick={() => setIsAddMemberOpen(true)}
              >
                <LuUserPlus size={16} />
              </IconButton>
              <Text fontSize="10px" color="var(--text-secondary)">Add Member</Text>
            </VStack>
            <VStack gap={1}>
              <IconButton
                aria-label="Exit"
                size="sm"
                borderRadius="full"
                bg="rgba(255, 0, 0, 0.2)"
                color="red.300"
                _hover={{ bg: "rgba(255, 0, 0, 0.3)" }}
                onClick={handleLeaveGroup}
              >
                <LuLogOut size={16} />
              </IconButton>
              <Text fontSize="10px" color="red.300">Exit</Text>
            </VStack>
          </SimpleGrid>
        )}

        <Box flex="1" overflowY="auto" order={3} w="100%" pr={1} className="custom-scroll">
          {isGroup ? (
            <>
              <Text fontSize={{ base: "sm", md: "md", xl: "sm" }} color="var(--text-secondary)" fontWeight="bold" mb={3}>
                Group Members ({selectedChat.users.length})
              </Text>
              <Stack gap={2} mb={6}>
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

              <Text fontSize={{ base: "sm", md: "md", xl: "sm" }} color="var(--text-secondary)" fontWeight="bold" mb={3}>
                Shared Media
              </Text>
              {loading ? (
                <Spinner size="sm" />
              ) : mediaMessages.length > 0 ? (
                <SimpleGrid columns={3} gap={2} maxH="160px" overflowY="auto" pr={1} className="custom-scroll">
                  {mediaMessages.map((m) => (
                    <Box
                      key={m._id}
                      aspectRatio="1"
                      borderRadius="md"
                      overflow="hidden"
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
                      onClick={() => {
                        setPreviewUrl(m.content);
                        setPreviewName(m.sender?.name || "Shared Media");
                      }}
                    >
                      <Image src={m.content} alt="media" objectFit="cover" w="100%" h="100%" />
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Text fontSize={{ base: "xs", md: "sm", xl: "xs" }} color="var(--text-muted)">No media shared</Text>
              )}
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

        <Box borderTop="var(--glass-border)" pt={4} pb={2} order={5} w="100%">
          <Text fontSize="xs" color="var(--text-muted)" textAlign="center">
            {isGroup ? (
              `Group created by ${selectedChat.createdBy?.name || selectedChat.groupAdmin?.name || "Unknown"}${selectedChat.createdAt ? ` on ${formatDate(selectedChat.createdAt)}` : ""}`
            ) : (
              selectedChat.createdAt ? `Chat started on ${formatDate(selectedChat.createdAt)}` : ""
            )}
          </Text>
        </Box>





        <ImagePreviewModal
          src={previewUrl}
          name={previewName}
          isOpen={Boolean(previewUrl)}
          onClose={() => {
            setPreviewUrl("");
            setPreviewName("");
          }}
        />

        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
        />
      </Box>
    </>
  );
};

export default RightProfilePanel;
