import {
  Box,
  Dialog,
  Input,
  Portal,
  Spinner,
} from "@chakra-ui/react";
import axiosInstance from "../config/axiosInstance";
import { useState, useEffect } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { toaster } from "../ui/toaster";
import UserListItem from "../userAvatar/UserListItem";

const AddMemberModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleAddUser = async (userToAdd) => {
    if (!selectedChat) return;

    // Check if user is already in the group
    if (selectedChat.users.some((u) => u._id === userToAdd._id)) {
      toaster.create({
        title: "User already in group",
        type: "warning",
      });
      return;
    }

    try {
      setAdding(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config
      );

      setSelectedChat(data);
      // Update the chats list so sidebar shows updated members count
      setChats(chats.map((c) => (c._id === data._id ? data : c)));

      toaster.create({
        title: `${userToAdd.name} added successfully!`,
        type: "success",
      });

      onClose();
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      toaster.create({
        title: "Failed to add user",
        description: error.response?.data?.message || error.message,
        type: "error",
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()} size="md">
      <Portal>
        <Dialog.Backdrop className="glass-backdrop" />
        <Dialog.Positioner>
          <Dialog.Content className="app-modal-card">
            <Dialog.Header px={0} pt={0}>
              <Dialog.Title className="app-modal-title">Add Member</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body px={0} display="flex" flexDir="column" gap={4}>
              <Input
                placeholder="Search user by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="rgba(255, 255, 255, 0.05)"
                border="var(--glass-border)"
                color="var(--text-primary)"
                _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
                disabled={adding}
              />

              {loading ? (
                <Spinner size="md" display="flex" mx="auto" my={4} />
              ) : (
                <Box maxH="240px" overflowY="auto">
                  {searchResult.map((u) => (
                    <UserListItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleAddUser(u)}
                    />
                  ))}
                  {search && !searchResult.length && (
                    <Box textAlign="center" py={4} color="var(--text-muted)">
                      No users found
                    </Box>
                  )}
                </Box>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default AddMemberModal;
