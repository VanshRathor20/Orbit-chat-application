import { Avatar, Box, Text } from "@chakra-ui/react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      display="flex"
      alignItems="center"
      gap={3}
      p={2}
      mb={2}
      borderRadius="lg"
      _hover={{ bg: "gray.100" }}
    >
      <Avatar.Root size="sm">
        <Avatar.Fallback name={user.name} />
        <Avatar.Image src={user.pic} />
      </Avatar.Root>
      <Box>
        <Text fontWeight="medium">{user.name}</Text>
        <Text fontSize="sm" color="gray.500">
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
