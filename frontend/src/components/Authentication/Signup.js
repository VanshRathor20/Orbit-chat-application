import { Box, Button, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState(null);

  const handleSubmit = () => {
    // Placeholder until API hookup is implemented.
    console.log({ name, email, password, confirmPassword, pic });
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
          onChange={(e) => setPic(e.target.files?.[0] || null)}
        />
      </Box>

      <Button colorScheme="gray" width="100%" mt="3" onClick={handleSubmit}>
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;