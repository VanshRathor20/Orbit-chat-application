import { Box } from "@chakra-ui/react";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain, isRightPanelOpen, setIsRightPanelOpen }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      w="100%"
      h="100%"
      p={4}
      bg="var(--glass-bg)"
      backdropFilter="var(--glass-blur)"
      border="var(--glass-border)"
      borderRadius="var(--glass-radius-lg)"
      boxShadow="var(--glass-shadow)"
      color="var(--text-primary)"
    >
      <SingleChat 
        fetchAgain={fetchAgain} 
        setFetchAgain={setFetchAgain} 
        isRightPanelOpen={isRightPanelOpen}
        setIsRightPanelOpen={setIsRightPanelOpen}
      />
    </Box>
  );
};

export default Chatbox;
