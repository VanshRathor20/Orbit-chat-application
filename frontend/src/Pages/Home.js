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
    <Container maxW='md' minH='100vh' display='flex' justifyContent='center' alignItems='center' py={{ base: '12', md: '20' }} px='4'>
      <Box w='100%' display='flex' flexDirection='column' gap={{ base: '10', md: '6' }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          w='100%'
        >
          <Text
            fontSize={{ base: '6xl', md: '7xl' }}
            fontWeight='normal'
            fontFamily="'Pacifico', cursive"
            color='white'
            textAlign='center'
            w='100%'
            css={{
              textShadow: '0 1px 2px rgba(254, 99, 6, 0.4)',
            }}
          >
            Orbit
          </Text>
        </Box>

        <Box
          w='100%'
          p={{ base: '6', md: '8' }}
          borderRadius='24px'
          color='white'
          bg='rgba(255, 255, 255, 0.07)'
          backdropFilter='blur(32px)'
          border='1px solid rgba(255, 255, 255, 0.1)'
          boxShadow='inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          position='relative'
          overflow='hidden'
        >
          <Tabs.Root
            value={tab}
            onValueChange={(details) => setTab(details.value)}
            variant='plain'
          >
            <Tabs.List
              mb='1em'
              justifyContent='center'
              w='100%'
              bg='rgba(0, 0, 0, 0.2)'
              borderRadius='full'
              p='1'
              border='1px solid rgba(255, 255, 255, 0.05)'
              position='relative'
            >
              <Tabs.Trigger
                value='members'
                w='50%'
                justifyContent='center'
                color='rgba(255, 255, 255, 0.5)'
                _selected={{
                  color: 'white',
                }}
                borderRadius='full'
                transition='all 0.2s'
                zIndex={1}
              >
                Login
              </Tabs.Trigger>
              <Tabs.Trigger
                value='projects'
                w='50%'
                justifyContent='center'
                color='rgba(255, 255, 255, 0.5)'
                _selected={{
                  color: 'white',
                }}
                borderRadius='full'
                transition='all 0.2s'
                zIndex={1}
              >
                Sign Up
              </Tabs.Trigger>
              <Tabs.Indicator
                bg='rgba(254, 99, 6, 0.18)'
                border='1px solid rgba(254, 99, 6, 0.4)'
                backdropFilter='blur(8px)'
                borderRadius='full'
              />
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