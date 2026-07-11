import {
  Avatar,
  Box,
  Button,
  Dialog,
  Input,
  Textarea,
  Text,
  Portal,
} from "@chakra-ui/react";
import { useState } from "react";

const ProfileModal = ({ user, isOpen, onClose }) => {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");

  if (!user) return null;

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
              
              <Box display="flex" alignItems="center" gap={4} cursor="pointer" _hover={{ opacity: 0.8 }}>
                <Avatar.Root size="lg">
                  <Avatar.Fallback name={user.name} />
                  <Avatar.Image src={user.pic} />
                </Avatar.Root>
                <Text color="var(--text-secondary)">Upload profile image</Text>
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
                onClick={onClose}
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
