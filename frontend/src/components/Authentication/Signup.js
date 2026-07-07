import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import React, { useState } from "react";

const Signup =() => {
const [name, setName] = useState()
const [email, setEmail] = useState()
const [password, setPassword] = useState()
const [confirmPassword, setConfirmPassword] = useState()
const [pic, setPic] = useState()


return (
  <VStack spacing="5px">
    <FormControl id="first-name" isRequired>
      <FormLabel>Name</FormLabel>
      <Input
        placeholder="Enter Your Name"
        onChange={(e) => setName(e.target.value)}
      />
    </FormControl>

    <FormControl id="email" isRequired>
      <FormLabel>Email</FormLabel>
      <Input
        placeholder="Enter Your Email"
        onChange={(e) => setEmail(e.target.value)}
      />
    </FormControl>

    <FormControl id="password" isRequired> 
      <FormLabel>Password</FormLabel>
      <Input
        placeholder="Enter Your Password"
        onChange={(e) => setPassword(e.target.value)}
      />
    </FormControl>
  </VStack>
);
};

export default Signup;
