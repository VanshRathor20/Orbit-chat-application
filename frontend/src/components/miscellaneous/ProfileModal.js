import {
  Avatar,
  Box,
  Button,
  Dialog,
  Input,
  Textarea,
  Text,
  Portal,
  Spinner,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toaster } from "../ui/toaster";
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({ user, isOpen, onClose }) => {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [pic, setPic] = useState(user?.pic || "");
  const [picLoading, setPicLoading] = useState(false);

  const fileInputRef = useRef(null);
  const { setUser } = ChatState();

  // Reset/sync state when the modal opens or the user object changes
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setPic(user.pic || "");
    }
  }, [isOpen, user]);

  if (!user) return null;

  const handleImageUpload = (file) => {
    if (!file) return;
    setPicLoading(true);
    if (file.type === "image/jpeg" || file.type === "image/png" || file.type.startsWith("image/")) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "yapp-chat-app");
      data.append("cloud_name", "itcli5ya");

      fetch("https://api.cloudinary.com/v1_1/itcli5ya/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((uploadData) => {
          setPic(uploadData.url.toString());
          setPicLoading(false);
          toaster.create({
            title: "Image Uploaded Successfully",
            type: "success",
          });
        })
        .catch((err) => {
          console.error(err);
          setPicLoading(false);
          toaster.create({
            title: "Failed to upload image",
            description: err.message,
            type: "error",
          });
        });
    } else {
      toaster.create({
        title: "Please Select an Image File",
        type: "warning",
      });
      setPicLoading(false);
    }
  };

  const handleSave = async () => {
    if (picLoading) {
      toaster.create({
        title: "Please wait for image to upload",
        type: "warning",
      });
      return;
    }
    if (!name.trim()) {
      toaster.create({
        title: "Name cannot be empty",
        type: "warning",
      });
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/user",
        { name, pic, bio },
        config
      );

      // Save to localStorage and update ChatState context
      const updatedUser = { ...user, name: data.name, pic: data.pic, bio: data.bio };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toaster.create({
        title: "Profile Updated Successfully",
        type: "success",
      });
      onClose();
    } catch (error) {
      toaster.create({
        title: "Error updating profile",
        description: error.response?.data?.message || error.message,
        type: "error",
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
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
            maxW="md"
          >
            <Dialog.Header px={0} pt={0}>
              <Dialog.Title>Profile details</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body px={0} pb={0} display="flex" flexDir="column" gap={4}>
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />

              <Box 
                display="flex" 
                alignItems="center" 
                gap={4} 
                cursor={picLoading ? "not-allowed" : "pointer"} 
                _hover={{ opacity: picLoading ? 1 : 0.8 }}
                onClick={() => !picLoading && fileInputRef.current?.click()}
              >
                <Avatar.Root size="lg">
                  <Avatar.Fallback name={user.name} />
                  <Avatar.Image src={pic || user.pic} />
                </Avatar.Root>
                {picLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Spinner size="sm" color="var(--accent-primary)" />
                    <Text color="var(--text-secondary)">Uploading image...</Text>
                  </Box>
                ) : (
                  <Text color="var(--text-secondary)">Upload profile image</Text>
                )}
              </Box>

              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name" 
                bg="rgba(255, 255, 255, 0.05)"
                border="var(--glass-border)"
                color="var(--text-primary)"
                _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
              />

              <Textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio" 
                bg="rgba(255, 255, 255, 0.05)"
                border="var(--glass-border)"
                color="var(--text-primary)"
                minH="100px"
                _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
              />

              <Button
                w="100%"
                bg="var(--accent-gradient)"
                color="white"
                borderRadius="full"
                _hover={{ opacity: 0.9 }}
                mt={2}
                onClick={handleSave}
                loading={picLoading}
              >
                Save
              </Button>
              
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ProfileModal;
