import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <Box w="100%">
      <SideDrawer />
      <Flex justifyContent="space-between" w="100%" h="91.5vh" p="10px" gap={4}>
        <MyChats fetchAgain={fetchAgain} />
        <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      </Flex>
    </Box>
  );
};

export default Chatpage;
