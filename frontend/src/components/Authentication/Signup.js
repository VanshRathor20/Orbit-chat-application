import { Box, Button, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axiosInstance";
import { toaster } from "../ui/toaster";
import { ChatState } from "../../Context/ChatProvider";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailEmpty = email === "";
  const isEmailValid = emailRegex.test(email);
  const showEmailError = !isEmailEmpty && !isEmailValid;

  const isPasswordEmpty = password === "";
  const isConfirmPasswordEmpty = confirmPassword === "";
  const passwordsMatch = password === confirmPassword;
  const showPasswordMismatchError = !isPasswordEmpty && !isConfirmPasswordEmpty && !passwordsMatch;

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: "weak", score: 0 };
    const hasMinLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const criteria = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial];
    const score = criteria.filter(Boolean).length;

    let level = "weak";
    if (score >= 5) {
      level = "strong";
    } else if (score >= 3) {
      level = "medium";
    }
    return { level, score };
  };

  const { level: strengthLevel } = getPasswordStrength(password);

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toaster.create({
        title: "Please Select an Image!",
        type: "warning",
      });
      setPicLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "yapp-chat-app");
      data.append("cloud_name", "itcli5ya");
      fetch("https://api.cloudinary.com/v1_1/itcli5ya/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toaster.create({
        title: "Please Select an Image!",
        type: "warning",
      });
      setPicLoading(false);
    }
  };

  const handleSubmit = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toaster.create({
        title: "Please Fill all the Fields",
        type: "warning",
      });
      setPicLoading(false);
      return;
    }

    if (!isEmailValid) {
      toaster.create({
        title: "Please enter a valid email address",
        type: "warning",
      });
      setPicLoading(false);
      return;
    }

    if (strengthLevel === "weak") {
      toaster.create({
        title: "Please choose a stronger password",
        type: "warning",
      });
      setPicLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toaster.create({
        title: "Passwords Do Not Match",
        type: "warning",
      });
      setPicLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );

      toaster.create({
        title: "Registration Successful",
        type: "success",
      });

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      navigate("/chat");
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Something went wrong",
        type: "error",
      });
      setPicLoading(false);
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
        w={{ base: 'auto', sm: '100%', md: '100%' }}
        flex={{ base: "1", sm: "none", md: "none" }}
        overflowY={{ base: "auto", sm: "visible", md: "visible" }}
        pr={{ base: "1", sm: "0", md: "0" }}
        pb={{ base: "1", sm: "0", md: "0" }}
      >
        <Box w="100%">
          <Text mb="2" color="whiteAlpha.900" fontWeight="medium">Name</Text>
          <Input
            w="100%"
            h={{ base: "48px", sm: "auto", md: "auto" }}
            minH={{ base: "48px", sm: "44px", md: "44px" }}
            py={{ base: "0", sm: "10px", md: "10px" }}
            placeholder="Enter Your Name"
            color="white"
            borderColor="whiteAlpha.200"
            bg="rgba(255, 255, 255, 0.05)"
            _placeholder={{ color: "rgba(255, 255, 255, 0.65)" }}
            _focus={{ borderColor: "rgba(254, 99, 6, 0.6)", bg: "rgba(255, 255, 255, 0.08)" }}
            transition="all 0.2s"
            onChange={(e) => setName(e.target.value)}
          />
        </Box>

        <Box w="100%">
          <Text mb="2" color="whiteAlpha.900" fontWeight="medium">Email Address</Text>
          <Input
            value={email}
            type="email"
            placeholder="Enter Your Email Address"
            w="100%"
            h={{ base: "48px", sm: "auto", md: "auto" }}
            minH={{ base: "48px", sm: "44px", md: "44px" }}
            py={{ base: "0", sm: "10px", md: "10px" }}
            color="white"
            borderColor={
              showEmailError
                ? "rgba(239, 68, 68, 0.8)"
                : (!isEmailEmpty && isEmailValid)
                  ? "rgba(34, 197, 94, 0.8)"
                  : "whiteAlpha.200"
            }
            bg="rgba(255, 255, 255, 0.05)"
            _placeholder={{ color: "rgba(255, 255, 255, 0.65)" }}
            _hover={{
              borderColor: showEmailError
                ? "rgba(239, 68, 68, 0.8)"
                : (!isEmailEmpty && isEmailValid)
                  ? "rgba(34, 197, 94, 0.8)"
                  : "whiteAlpha.300"
            }}
            _focus={{
              borderColor: showEmailError
                ? "rgba(239, 68, 68, 0.8)"
                : (!isEmailEmpty && isEmailValid)
                  ? "rgba(34, 197, 94, 0.8)"
                  : "rgba(254, 99, 6, 0.6)",
              bg: "rgba(255, 255, 255, 0.08)"
            }}
            transition="all 0.2s"
            onChange={(e) => setEmail(e.target.value)}
          />
          {showEmailError && (
            <Text color="rgba(239, 68, 68, 0.8)" fontSize="xs" mt="1.5">
              Please enter a valid email address
            </Text>
          )}
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
              minH={{ base: "48px", sm: "44px", md: "44px" }}
              py={{ base: "0", sm: "10px", md: "10px" }}
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
          {password && (
            <Box mt="2" transition="all 0.3s ease">
              <Box
                w="100%"
                h="4px"
                bg="whiteAlpha.100"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  h="100%"
                  w={
                    strengthLevel === "weak"
                      ? "33%"
                      : strengthLevel === "medium"
                        ? "66%"
                        : "100%"
                  }
                  bg={
                    strengthLevel === "weak"
                      ? "rgba(239, 68, 68, 0.8)"
                      : strengthLevel === "medium"
                        ? "rgba(245, 158, 11, 0.8)"
                        : "rgba(34, 197, 94, 0.8)"
                  }
                  transition="width 0.3s ease-in-out, background-color 0.3s ease-in-out"
                />
              </Box>
              <Text
                mt="1.5"
                fontSize="xs"
                fontWeight="medium"
                color={
                  strengthLevel === "weak"
                    ? "rgba(239, 68, 68, 0.9)"
                    : strengthLevel === "medium"
                      ? "rgba(245, 158, 11, 0.9)"
                      : "rgba(34, 197, 94, 0.9)"
                }
                transition="color 0.3s ease"
              >
                Password Strength: {strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1)}
              </Text>
            </Box>
          )}
        </Box>

        <Box w="100%">
          <Text mb="2" color="whiteAlpha.900" fontWeight="medium">Confirm Password</Text>
          <Input
            value={confirmPassword}
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            w="100%"
            h={{ base: "48px", sm: "auto", md: "auto" }}
            minH={{ base: "48px", sm: "44px", md: "44px" }}
            py={{ base: "0", sm: "10px", md: "10px" }}
            color="white"
            borderColor={
              showPasswordMismatchError
                ? "rgba(239, 68, 68, 0.8)"
                : (!isConfirmPasswordEmpty && passwordsMatch)
                  ? "rgba(34, 197, 94, 0.8)"
                  : "whiteAlpha.200"
            }
            bg="rgba(255, 255, 255, 0.05)"
            _placeholder={{ color: "rgba(255, 255, 255, 0.65)" }}
            _hover={{
              borderColor: showPasswordMismatchError
                ? "rgba(239, 68, 68, 0.8)"
                : (!isConfirmPasswordEmpty && passwordsMatch)
                  ? "rgba(34, 197, 94, 0.8)"
                  : "whiteAlpha.300"
            }}
            _focus={{
              borderColor: showPasswordMismatchError
                ? "rgba(239, 68, 68, 0.8)"
                : (!isConfirmPasswordEmpty && passwordsMatch)
                  ? "rgba(34, 197, 94, 0.8)"
                  : "rgba(254, 99, 6, 0.6)",
              bg: "rgba(255, 255, 255, 0.08)"
            }}
            transition="all 0.2s"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {showPasswordMismatchError && (
            <Text color="rgba(239, 68, 68, 0.8)" fontSize="xs" mt="1.5">
              Passwords do not match
            </Text>
          )}
        </Box>

        <Box w="100%">
          <Text mb="2" color="whiteAlpha.900" fontWeight="medium">Upload Your Picture</Text>
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            w="100%"
            h={{ base: "48px", sm: "auto", md: "auto" }}
            minH={{ base: "48px", sm: "44px", md: "44px" }}
            color="white"
            borderColor="whiteAlpha.200"
            bg="rgba(255, 255, 255, 0.05)"
            _focus={{ borderColor: "rgba(254, 99, 6, 0.6)", bg: "rgba(255, 255, 255, 0.08)" }}
            transition="all 0.2s"
            onChange={(e) => postDetails(e.target.files?.[0])}
          />
        </Box>
      </VStack>

      <Box
        pt={{ base: "3", sm: "0", md: "0" }}
        mt={{ base: "1", sm: "3", md: "3" }}
        borderTop={{ base: "1px solid rgba(255, 255, 255, 0.1)", sm: "none", md: "none" }}
        flexShrink={0}
      >
        <Button
          width="100%"
          h={{ base: "48px", sm: "auto", md: "auto" }}
          minH={{ base: "48px", sm: "44px", md: "44px" }}
          py={{ base: "0", sm: "12px", md: "12px" }}
          onClick={handleSubmit}
          loading={picLoading}
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
          Sign Up
        </Button>
      </Box>
    </Box>
  );
};

export default Signup;