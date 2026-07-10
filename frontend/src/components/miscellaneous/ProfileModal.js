import {
  Avatar,
  Dialog,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

const ProfileModal = ({ user, children }) => {
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        {children}
      </span>
      <Dialog.Root
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{user.name}</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body
                display="flex"
                flexDir="column"
                alignItems="center"
                gap={4}
              >
                <Avatar.Root size="2xl">
                  <Avatar.Fallback name={user.name} />
                  <Avatar.Image src={user.pic} />
                </Avatar.Root>
                <Text fontSize="lg">
                  <strong>Email:</strong> {user.email}
                </Text>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default ProfileModal;
