import { Box, Container, Text, Tabs } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatState } from '../Context/ChatProvider'
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'

const Home = () => {
  const [tab, setTab] = useState('members')
  const { user } = ChatState()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/chat')
    }
  }, [user, navigate])

  return (
    <Container maxW='xl' minH='100vh' display='flex' justifyContent='center' pt='20'>
      <Box w='100%'>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          p={3}
          mb={4}
          h='80px'
          bg='translucent'
          w='100%'
          borderRadius='lg'
          borderWidth='1px'
        >
          <Text fontSize='4xl' fontWeight='bold' fontFamily='work-sans' color='white' textAlign='center' w='100%'>
            Yapp
          </Text>
        </Box>

        <Box bg='translucent' w='100%' p={4} borderRadius='lg' color='white' borderWidth='1px'>
          <Tabs.Root
            value={tab}
            onValueChange={(details) => setTab(details.value)}
            variant='plain'
            css={{
              '--tabs-indicator-bg': 'colors.gray.subtle',
              '--tabs-indicator-shadow': 'shadows.xs',
              '--tabs-trigger-radius': 'radii.full',
            }}
          >
            <Tabs.List mb='1em' justifyContent='center' w='100%'>
              <Tabs.Trigger value='members' w='50%' justifyContent='center' color='white'>
                Login
              </Tabs.Trigger>
              <Tabs.Trigger value='projects' w='50%' justifyContent='center' color='white'>
                Sign Up
              </Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>

            <Box key={tab} animation='panelFadeIn 240ms ease-out'>
              {tab === 'members' ? <Login /> : <Signup />}
            </Box>
          </Tabs.Root>
        </Box>
      </Box>
    </Container>
  )
}

export default Home