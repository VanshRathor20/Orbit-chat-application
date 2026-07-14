import { Avatar, Box, Button, Input, Menu, Spinner, Stack, Text } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LuEllipsisVertical, LuSearch, LuPlus } from "react-icons/lu";
import ChatLoading from "./ChatLoading";
import ProfileModal from "./miscellaneous/ProfileModal";
import UserListItem from "./userAvatar/UserListItem";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { getSender } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { toaster } from "./ui/toaster";

const LeftSidebar = ({ fetchAgain }) => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchTimerRef = useRef(null);
  const latestQueryRef = useRef("");

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const {
    setSelectedChat,
    user,
    setUser,
    chats,
    setChats,
    selectedChat,
    notification,
    setNotification,
  } = ChatState();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const handleSearch = (query) => {
    setSearch(query);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!query) {
      latestQueryRef.current = "";
      setSearchResult([]);
      setLoadingSearch(false);
      return;
    }

    latestQueryRef.current = query;

    searchTimerRef.current = setTimeout(async () => {
      try {
        setLoadingSearch(true);

        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };

        const { data } = await axios.get(`/api/user?search=${query}`, config);

        if (query === latestQueryRef.current) {
          setSearchResult(data);
          setLoadingSearch(false);
        }
      } catch (error) {
        if (query === latestQueryRef.current) {
          toaster.create({
            title: "Error Occurred!",
            description: "Failed to Load the Search Results",
            type: "error",
          });
          setLoadingSearch(false);
        }
      }
    }, 500);
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setSearch(""); // clear search to revert back to chat list
      setSearchResult([]);
    } catch (error) {
      toaster.create({
        title: "Error fetching the chat",
        description: error.message,
        type: "error",
      });
      setLoadingChat(false);
    }
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      w={{ base: "100%", md: "320px" }}
      h="100%"
      bg="var(--glass-bg)"
      backdropFilter="var(--glass-blur)"
      border="var(--glass-border)"
      borderRadius="var(--glass-radius-lg)"
      boxShadow="var(--glass-shadow)"
      p={4}
      color="var(--text-primary)"
    >
      {/* Header Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={0}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="68px"
            h="68px"
            borderRadius="50%"
            border="3px solid #FE6306"
            overflow="hidden"
            bg="rgba(255, 255, 255, 0.05)"
            p="3px"
            cursor="pointer"
            onClick={() => setIsProfileOpen(true)}
            _hover={{ opacity: 0.8 }}
          >
            <Avatar.Root style={{ width: "100%", height: "100%", borderRadius: "50%" }}>
              <Avatar.Fallback name={user.name} fontSize="26px" fontWeight="bold" />
              {user.pic && user.pic !== "backend/Models/userProfileIcon.png" && (
                <Avatar.Image src={user.pic} />
              )}
            </Avatar.Root>
          </Box>
          <Text
            fontFamily="'Pacifico', cursive"
            fontSize="48px"
            color="white"
            lineHeight="1"
            ml="2px"
            mt="-6px"
          >
            rbit
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Menu.Root
            positioning={{ placement: "bottom-end" }}
            onSelect={(e) => {
              if (e.value === "profile") setIsProfileOpen(true);
              if (e.value === "logout") logoutHandler();
            }}
          >
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm" position="relative" color="var(--text-primary)" _hover={{ bg: "whiteAlpha.200" }}>
                <LuEllipsisVertical size={20} />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content bg="var(--glass-bg)" backdropFilter="var(--glass-blur)" border="var(--glass-border)" color="var(--text-primary)" zIndex={1400}>
                <Menu.Item value="profile" _hover={{ bg: "var(--accent-primary)" }}>
                  Edit Profile
                </Menu.Item>
                <Menu.Item value="logout" _hover={{ bg: "var(--accent-primary)" }}>
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          <ProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </Box>
      </Box>

      {/* Search Input */}
      <Box mb={4} position="relative">
        <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="var(--text-muted)">
          <LuSearch />
        </Box>
        <Input
          placeholder="Search User..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          bg="rgba(255, 255, 255, 0.05)"
          border="var(--glass-border)"
          borderRadius="full"
          pl={10}
          color="var(--text-primary)"
          _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
        />
      </Box>

      {/* Group Chat Modal */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" px={1}>
        <Text fontSize="sm" color="var(--text-secondary)" fontWeight="bold">CHATS</Text>
        <GroupChatModal>
          <Button variant="ghost" size="xs" color="var(--text-primary)" _hover={{ bg: "whiteAlpha.200" }}>
            <LuPlus />
          </Button>
        </GroupChatModal>
      </Box>

      {/* List Area */}
      <Box
        flex="1"
        overflowY="auto"
        className="custom-scroll"
      >
        {search ? (
          /* Search Results */
          loadingSearch ? (
            <ChatLoading />
          ) : (
            searchResult?.map((userItem) => (
              <UserListItem
                key={userItem._id}
                user={userItem}
                handleFunction={() => accessChat(userItem._id)}
              />
            ))
          )
        ) : (
          /* Chat List */
          chats ? (
            <Stack gap={2}>
              {chats.map((chat) => (
                <Box
                  onClick={() => {
                    setSelectedChat(chat);
                    setNotification(notification.filter((n) => n.chat._id !== chat._id));
                  }}
                  cursor="pointer"
                  bg={selectedChat === chat ? "var(--accent-primary)" : "transparent"}
                  _hover={{ bg: selectedChat !== chat ? "rgba(255, 255, 255, 0.05)" : "var(--accent-primary)" }}
                  color="var(--text-primary)"
                  px={3}
                  py={3}
                  borderRadius="var(--glass-radius-sm)"
                  border={selectedChat === chat ? "var(--glass-border)" : "1px solid transparent"}
                  key={chat._id}
                  display="flex"
                  alignItems="center"
                  gap={3}
                >
                  <Avatar.Root size="md">
                    <Avatar.Fallback name={!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName} />
                    {!chat.isGroupChat && <Avatar.Image src={chat.users.find((u) => u._id !== user._id)?.pic} />}
                  </Avatar.Root>
                  <Box flex="1" overflow="hidden">
                    <Text fontWeight="bold" noOfLines={1}>
                      {!chat.isGroupChat
                        ? getSender(user, chat.users)
                        : chat.chatName}
                    </Text>
                    {!chat.isGroupChat && (
                      <Text fontSize="xs" color="var(--text-muted)">
                        Offline
                      </Text>
                    )}
                    {chat.latestMessage && (
                      <Text fontSize="xs" color="var(--text-secondary)" noOfLines={1} mt={1}>
                        <b>{chat.latestMessage.sender.name}: </b>
                        {chat.latestMessage.messageType === "image" ||
                          (chat.latestMessage.content &&
                            (chat.latestMessage.content.match(/\.(jpeg|jpg|gif|png)$/i) ||
                              chat.latestMessage.content.includes("res.cloudinary.com")))
                          ? "📷 Photo"
                          : chat.latestMessage.content}
                      </Text>
                    )}
                  </Box>
                  {notification.filter((n) => n.chat._id === chat._id).length > 0 && (
                    <Box
                      bg="#FE6306"
                      color="white"
                      borderRadius="full"
                      h="20px"
                      minW="20px"
                      px={1}
                      fontSize="10px"
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {notification.filter((n) => n.chat._id === chat._id).length}
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <ChatLoading />
          )
        )}
        {loadingChat && <Spinner ml="auto" display="flex" mt={2} />}
      </Box>
    </Box>
  );
};

export default LeftSidebar;
