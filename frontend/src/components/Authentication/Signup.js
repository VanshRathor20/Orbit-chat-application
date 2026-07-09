import { Box, Button, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toaster } from "../ui/toaster"; 

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const navigate = useNavigate();

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
    <VStack gap="10px" align="stretch" w="100%">
      <Box w="100%">
        <Text mb="2" color="black" fontWeight="medium">Name</Text>
        <Input
          w="100%"
          placeholder="Enter Your Name"
          color="black"
          borderColor="blackAlpha.300"
          bg="whiteAlpha.700"
          _placeholder={{ color: "blackAlpha.600" }}
          onChange={(e) => setName(e.target.value)}
        />
      </Box>

      <Box w="100%">
        <Text mb="2" color="black" fontWeight="medium">Email Address</Text>
        <Input
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

      <Box w="100%">
        <Text mb="2" color="black" fontWeight="medium">Confirm Password</Text>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          w="100%"
          color="black"
          borderColor="blackAlpha.300"
          bg="whiteAlpha.700"
          _placeholder={{ color: "blackAlpha.600" }}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Box>

      <Box w="100%">
        <Text mb="2" color="black" fontWeight="medium">Upload Your Picture</Text>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          w="100%"
          color="black"
          borderColor="blackAlpha.300"
          bg="whiteAlpha.700"
          onChange={(e) => postDetails(e.target.files?.[0])}
        />
      </Box>

      <Button
        colorScheme="gray"
        width="100%"
        mt="3"
        onClick={handleSubmit}
        loading={picLoading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;