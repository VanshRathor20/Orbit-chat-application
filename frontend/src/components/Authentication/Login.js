import { Box, Button, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toaster } from "../ui/toaster";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toaster.create({
        title: "Please Fill all the Fields",
        type: "warning",
      });
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

      toaster.create({
        title: "Login Successful",
        type: "success",
      });

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chat");
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Something went wrong",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <VStack gap="10px" align="stretch" w="100%">
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
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            color="black"
            borderColor="blackAlpha.300"
            bg="whiteAlpha.700"
            pr="3rem"
            _placeholder={{ color: "blackAlpha.600" }}
            onChange={(e) => setPassword(e.target.value)}
          />
          <IconButton
            aria-label={showPassword ? "Hide password" : "Show password"}
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
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <LuEyeOff /> : <LuEye />}
          </IconButton>
        </Box>
      </Box>

      <Button
        colorPalette="gray"
        width="100%"
        mt="3"
        onClick={submitHandler}
        loading={loading}
      >
        Login
      </Button>

      <Button
        variant="solid"
        colorPalette="gray"
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