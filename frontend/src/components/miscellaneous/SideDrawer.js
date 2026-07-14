import {
  Avatar,
  Box,
  Button,
  Drawer,
  Input,
  Menu,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LuBell, LuChevronDown, LuSearch } from "react-icons/lu";
import NotificationBadge, { Effect } from "react-notification-badge";
import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModal";
import UserListItem from "../userAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";
import { toaster } from "../ui/toaster";
import { Tooltip } from "../ui/tooltip";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const navigate = useNavigate();

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toaster.create({
        title: "Please Enter something in search",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        type: "error",
      });
      setLoading(false);
    }
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
      onClose();
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
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip content="Search Users to chat" showArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <LuSearch />
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Orbit
        </Text>
        <Box display="flex" alignItems="center" gap={2}>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" position="relative">
                <NotificationBadge
                  count={notification.length}
                  effect={Effect.SCALE}
                  style={{ backgroundColor: "#FE6306" }}
                />
                <LuBell size={24} />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                {!notification.length && (
                  <Menu.Item value="empty" disabled>
                    No New Messages
                  </Menu.Item>
                )}
                {notification.map((notif) => (
                  <Menu.Item
                    key={notif._id}
                    value={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>

          <Menu.Root>
            <Menu.Trigger asChild>
              <Button bg="white">
                <Avatar.Root size="sm" cursor="pointer">
                  <Avatar.Fallback name={user.name} />
                  <Avatar.Image src={user.pic} />
                </Avatar.Root>
                <LuChevronDown />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <ProfileModal user={user}>
                  <Menu.Item value="profile">My Profile</Menu.Item>
                </ProfileModal>
                <Menu.Separator />
                <Menu.Item value="logout" onClick={logoutHandler}>
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box>
      </Box>

      <Drawer.Root
        open={isOpen}
        onOpenChange={(details) => setIsOpen(details.open)}
        placement="start"
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Search Users</Drawer.Title>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body>
              <Box display="flex" pb={2}>
                <Input
                  placeholder="Search by name or email"
                  mr={2}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSearch}>Go</Button>
              </Box>
              {loading ? (
                <ChatLoading />
              ) : (
                searchResult?.map((userItem) => (
                  <UserListItem
                    key={userItem._id}
                    user={userItem}
                    handleFunction={() => accessChat(userItem._id)}
                  />
                ))
              )}
              {loadingChat && <Spinner ml="auto" display="flex" />}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  );
}

export default SideDrawer;
