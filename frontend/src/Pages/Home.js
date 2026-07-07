import { Box, Container, Text,Tabs } from '@chakra-ui/react'
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'
import React from 'react'

const Home = () => {
  return (
    <Container maxW='xl' centerContent>
        <Box d='flex' justifyContent='center' alignItems='center' p={3} bg='transparent' w='100%' m='40px 0 15px 0' borderRadius='lg' borderWidth='1px' >
          <Text fontSize='4xl' fontWeight='bold' fontFamily='work-sans' color='white' textAlign='center' w='100%' >
                Yapp
            </Text>
        </Box>
        <Box bg='transparent' w='100%' p={4} borderRadius='lg' color='white' borderWidth='1px'>

    <Tabs.Root
      defaultValue="members"
      variant="plain"
      css={{
        "--tabs-indicator-bg": "colors.gray.subtle",
        "--tabs-indicator-shadow": "shadows.xs",
        "--tabs-trigger-radius": "radii.full",
      }}
    >
      <Tabs.List mb='1em' justifyContent='center' w='100%'>
        <Tabs.Trigger value="members" w='50%'  justifyContent='center'>Login</Tabs.Trigger>
        <Tabs.Trigger value="projects" w='50%' justifyContent='center'>Sign Up</Tabs.Trigger>
      </Tabs.List>
      {/* login content */}
      <Tabs.Content value="members">
        <Login />
      </Tabs.Content>
      <Tabs.Content value="projects">
        <Signup />
      </Tabs.Content>
    </Tabs.Root>

        </Box>
    </Container>
  )
}

export default Home