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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Close right panel when changing chats
  useEffect(() => {
    setIsRightPanelOpen(false);
  }, [selectedChat]);

  // Handle history state (back button) and body scroll lock for mobile drawer
  useEffect(() => {
    if (isRightPanelOpen && isMobile) {
      document.body.style.overflow = "hidden";
      window.history.pushState({ panelOpen: true }, "");

      const handlePopState = () => {
        setIsRightPanelOpen(false);
      };

      window.addEventListener("popstate", handlePopState);
      
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      document.body.style.overflow = "auto";
      // If closed manually or via chat switch, pop the stale history state
      if (window.history.state?.panelOpen) {
         window.history.back();
      }
    }
  }, [isRightPanelOpen, isMobile]);

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
      <RightProfilePanel 
        isOpen={isRightPanelOpen} 
        onClose={() => setIsRightPanelOpen(false)} 
      />
    </Box>
  );
};

export default Chatpage;
