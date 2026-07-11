import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chatbox from "../components/Chatbox";
import LeftSidebar from "../components/LeftSidebar";
import RightProfilePanel from "../components/RightProfilePanel";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const { user, selectedChat } = ChatState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Close right panel when changing chats
  useEffect(() => {
    setIsRightPanelOpen(false);
  }, [selectedChat]);

  if (!user) {
    return null;
  }

  return (
    <Box w="100%" h="100vh" p={4} display="flex" gap={4} overflow="hidden">
      <LeftSidebar fetchAgain={fetchAgain} />
      <Box flex="1" display="flex" overflow="hidden">
        <Chatbox 
          fetchAgain={fetchAgain} 
          setFetchAgain={setFetchAgain} 
          isRightPanelOpen={isRightPanelOpen}
          setIsRightPanelOpen={setIsRightPanelOpen}
        />
      </Box>
      {isRightPanelOpen && <RightProfilePanel onClose={() => setIsRightPanelOpen(false)} />}
    </Box>
  );
};

export default Chatpage;
