import {
  Box,
  Button,
  Dialog,
  Input,
  Portal,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { toaster } from "../ui/toaster";
import UserListItem from "../userAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to load search results",
        type: "error",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        handleSearch(search);
      } else {
        setSearchResult([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      toaster.create({
        title: "Please fill all the fields",
        description: "Select at least 2 users and provide a group name",
        type: "warning",
      });
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      toaster.create({
        title: "Group Chat Created!",
        type: "success",
      });
      setOpen(false);
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      toaster.create({
        title: "Failed to Create the Chat!",
        description: error.response?.data?.message || error.message,
        type: "error",
      });
    }
  };

  const handleDelete = (userToDelete) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToDelete._id));
  };

  const handleAddUser = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      toaster.create({
        title: "User already added",
        type: "warning",
      });
      return;
    }
    setSearchResult(searchResult.filter((u) => u._id !== userToAdd._id));
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <Dialog.Root
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.5)" backdropFilter="blur(16px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="var(--glass-bg)" 
              border="var(--glass-border)" 
              borderRadius="var(--glass-radius-lg)"
              boxShadow="var(--glass-shadow)"
              color="var(--text-primary)"
              p={6}
            >
              <Dialog.Header px={0} pt={0}>
                <Dialog.Title>Create Group Chat</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body px={0} display="flex" flexDir="column" gap={4}>
                <Box display="flex" w="100%" flexWrap="wrap" gap={2}>
                  {selectedUsers.map((u) => (
                    <Box
                      key={u._id}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      bg="var(--accent-primary)"
                      opacity={0.85}
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="var(--glass-radius-sm)"
                      fontSize="sm"
                    >
                      {u.name}
                      <Button
                        size="xs"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: "whiteAlpha.300" }}
                        onClick={() => handleDelete(u)}
                      >
                        x
                      </Button>
                    </Box>
                  ))}
                </Box>
                <Input
                  placeholder="Chat Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  bg="rgba(255, 255, 255, 0.05)"
                  border="var(--glass-border)"
                  color="var(--text-primary)"
                  _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
                />
                <Box display="flex" gap={2}>
                  <Input
                    placeholder="Add users by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    bg="rgba(255, 255, 255, 0.05)"
                    border="var(--glass-border)"
                    color="var(--text-primary)"
                    _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
                  />
                </Box>
                {searchResult.slice(0, 4).map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleAddUser(u)}
                  />
                ))}
              </Dialog.Body>
              <Dialog.Footer px={0} pb={0}>
                <Button 
                  w="100%"
                  bg="var(--accent-gradient)"
                  color="white"
                  borderRadius="full"
                  _hover={{ opacity: 0.9 }}
                  onClick={handleSubmit}
                >
                  Create Chat
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default GroupChatModal;
