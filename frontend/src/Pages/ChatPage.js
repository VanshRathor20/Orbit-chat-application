import { Box, useBreakpointValue } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chatbox from "../components/Chatbox";
import LeftSidebar from "../components/LeftSidebar";
import RightProfilePanel from "../components/RightProfilePanel";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const { user, selectedChat, setSelectedChat } = ChatState();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, xl: false });
  const programmaticPopRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Close right panel when changing chats
  useEffect(() => {
    setIsRightPanelOpen(false);
  }, [selectedChat]);

  // Desktop Esc key to deselect chat or close profile panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Ignore if user is inside an input/textarea
        if (
          document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.isContentEditable
        ) {
          return;
        }

        if (isRightPanelOpen) {
          setIsRightPanelOpen(false);
        } else if (selectedChat) {
          setSelectedChat(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRightPanelOpen, selectedChat, setSelectedChat]);

  // Handle history state (back button) for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handlePopState = (e) => {
      if (programmaticPopRef.current) {
        programmaticPopRef.current = false;
        return;
      }
      const state = e.state;
      if (isRightPanelOpen && !state?.panelOpen) {
        setIsRightPanelOpen(false);
      } else if (selectedChat && !state?.chatOpen) {
        setSelectedChat(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobile, isRightPanelOpen, selectedChat, setSelectedChat]);

  // Push/Pop for selectedChat
  useEffect(() => {
    if (!isMobile) return;
    if (selectedChat) {
      if (!window.history.state?.chatOpen) {
        window.history.pushState({ chatOpen: true }, "");
      }
    } else {
      if (window.history.state?.chatOpen) {
        programmaticPopRef.current = true;
        window.history.back();
      }
    }
  }, [selectedChat, isMobile]);

  // Push/Pop for right panel
  useEffect(() => {
    if (!isMobile) return;
    if (isRightPanelOpen) {
      document.body.style.overflow = "hidden";
      if (!window.history.state?.panelOpen) {
        window.history.pushState({ chatOpen: true, panelOpen: true }, "");
      }
    } else {
      document.body.style.overflow = "auto";
      if (window.history.state?.panelOpen) {
        programmaticPopRef.current = true;
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
