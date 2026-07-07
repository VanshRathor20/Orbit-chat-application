import {
  Box,
  Button,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import { LuEye, LuEyeOff } from "react-icons/lu";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const notify = (title, description = "") => {
    const message = description ? `${title}\n${description}` : title;
    window.alert(message);
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      notify("Please fill all the fields");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      notify("Login successful");
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      notify("Error occurred", error.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <VStack gap="12px" align="stretch" w="100%">
      <Box w="100%">
        <Text mb="2" color="black" fontWeight="medium">Email Address</Text>
        <Input
          value={email}
          type="email"
          placeholder="Enter Your Email Address"
          w="100%"
          color="black"
          borderColor="blackAlpha.300"
          bg="whiteAlpha.700"
          _placeholder={{ color: "blackAlpha.600" }}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Box>
      <Box w="100%">
        <Text mb="2" color="black" fontWeight="medium">Password</Text>
        <Box position="relative" w="100%">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Enter password"
            color="black"
            borderColor="blackAlpha.300"
            bg="whiteAlpha.700"
            pr="3rem"
            _placeholder={{ color: "blackAlpha.600" }}
          />
          <IconButton
            aria-label={show ? "Hide password" : "Show password"}
            size="xs"
            variant="ghost"
            color="black"
            bg="transparent"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            position="absolute"
            right="0.4rem"
            top="50%"
            transform="translateY(-50%)"
            onClick={handleClick}
          >
            {show ? <LuEyeOff /> : <LuEye />}
          </IconButton>
        </Box>
      </Box>
      <Button
        colorScheme="gray"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
      <Button
        variant="solid"
        colorScheme="gray"
        width="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;