import { Spinner, Stack, Text } from "@chakra-ui/react";

const ChatLoading = () => {
  return (
    <Stack align="center" justify="center" p={4} gap={3}>
      <Spinner size="lg" color="teal.500" />
      <Text fontSize="sm" color="gray.500">
        Loading...
      </Text>
    </Stack>
  );
};

export default ChatLoading;
