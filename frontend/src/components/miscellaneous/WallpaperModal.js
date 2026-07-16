import {
  Box,
  Button,
  Dialog,
  Grid,
  Text,
  Portal,
} from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";
import { ChatState } from "../../Context/ChatProvider";
import { wallpaperPresets } from "../../config/wallpaperPresets";
import axiosInstance from "../../config/axiosInstance";
import { toaster } from "../ui/toaster";

const WallpaperModal = ({ isOpen, onClose }) => {
  const { user, setUser } = ChatState();

  const handleSelect = async (presetId) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axiosInstance.put(
        "/api/user",
        { wallpaper: presetId },
        config
      );

      // Save to localStorage and update ChatState context
      const updatedUser = { ...user, wallpaper: data.wallpaper };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toaster.create({
        title: "Wallpaper Updated",
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Error updating wallpaper",
        description: error.response?.data?.message || error.message,
        type: "error",
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <Portal>
        <Dialog.Backdrop className="glass-backdrop" />
        <Dialog.Positioner>
          <Dialog.Content className="app-modal-card">
            <Dialog.Header px={0} pt={0}>
              <Dialog.Title className="app-modal-title">Change Wallpaper</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body px={0} pb={0} display="flex" flexDir="column" gap={5}>
              <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                {Object.values(wallpaperPresets).map((preset) => {
                  const isSelected = (user?.wallpaper || "preset_1") === preset.id;
                  return (
                    <Box
                      key={preset.id}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={1.5}
                    >
                      <Box
                        w="65px"
                        h="65px"
                        borderRadius="var(--glass-radius-sm)"
                        cursor="pointer"
                        style={preset.previewStyle}
                        position="relative"
                        border={isSelected ? "2px solid #fe6306" : "1px solid rgba(255, 255, 255, 0.15)"}
                        onClick={() => handleSelect(preset.id)}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        _hover={{
                          transform: "scale(1.05)",
                          borderColor: isSelected ? "#fe6306" : "rgba(255, 255, 255, 0.4)"
                        }}
                        transition="all 0.2s"
                        boxShadow={isSelected ? "0 0 10px rgba(254, 99, 6, 0.4)" : "none"}
                      >
                        {isSelected && (
                          <Box
                            bg="#fe6306"
                            color="white"
                            borderRadius="full"
                            p={0.5}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <LuCheck size={12} strokeWidth={3.5} />
                          </Box>
                        )}
                      </Box>
                      <Text fontSize="10px" color="rgba(255, 255, 255, 0.6)" noOfLines={1} textAlign="center">
                        {preset.name}
                      </Text>
                    </Box>
                  );
                })}
              </Grid>

              <Button
                className="app-modal-btn"
                onClick={() => handleSelect("preset_1")}
                mt={2}
              >
                Reset to Default
              </Button>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default WallpaperModal;
