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
    <Box
      display="flex"
      flexDirection="column"
      w="100%"
      h={{ base: "100%", sm: "auto", md: "auto" }}
      overflow={{ base: "hidden", sm: "visible", md: "visible" }}
    >
      <VStack
        gap="12px"
        align="stretch"
        flex={{ base: "1", sm: "none", md: "none" }}
        overflowY={{ base: "auto", sm: "visible", md: "visible" }}
        pr={{ base: "1", sm: "0", md: "0" }}
        pb="1"
      >
        <Box w="100%">
          <Text mb="2" color="whiteAlpha.900" fontWeight="medium">Email Address</Text>
          <Input
            value={email}
            type="email"
            placeholder="Enter Your Email Address"
            w="100%"
            h={{ base: "48px", sm: "auto", md: "auto" }}
            color="white"
            borderColor="whiteAlpha.200"
            bg="rgba(255, 255, 255, 0.05)"
            _placeholder={{ color: "rgba(255, 255, 255, 0.65)" }}
            _focus={{ borderColor: "rgba(254, 99, 6, 0.6)", bg: "rgba(255, 255, 255, 0.08)" }}
            transition="all 0.2s"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>

        <Box w="100%">
          <Text mb="2" color="whiteAlpha.900" fontWeight="medium">Password</Text>
          <Box position="relative" w="100%">
            <Input
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              w="100%"
              h={{ base: "48px", sm: "auto", md: "auto" }}
              color="white"
              borderColor="whiteAlpha.200"
              bg="rgba(255, 255, 255, 0.05)"
              pr="3rem"
              _placeholder={{ color: "rgba(255, 255, 255, 0.65)" }}
              _focus={{ borderColor: "rgba(254, 99, 6, 0.6)", bg: "rgba(255, 255, 255, 0.08)" }}
              transition="all 0.2s"
              onChange={(e) => setPassword(e.target.value)}
            />
            <IconButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              size={{ base: "sm", sm: "xs", md: "xs" }}
              variant="ghost"
              color="whiteAlpha.800"
              bg="transparent"
              _hover={{ bg: "transparent", color: "white" }}
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
      </VStack>

      <Box
        pt="3"
        mt="1"
        borderTop={{ base: "1px solid rgba(255, 255, 255, 0.1)", sm: "none", md: "none" }}
        flexShrink={0}
      >
        <Button
          width="100%"
          h={{ base: "48px", sm: "auto", md: "auto" }}
          onClick={submitHandler}
          loading={loading}
          bg="#fe6306"
          color="white"
          fontWeight="semibold"
          borderRadius="lg"
          _hover={{ 
            bg: "#e55905",
            transform: "scale(1.02)"
          }}
          transition="all 0.2s"
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default Login;