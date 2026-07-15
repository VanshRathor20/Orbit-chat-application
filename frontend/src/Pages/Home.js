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
    <Container
      maxW={{ base: 'md', sm: 'md', md: 'md' }}
      minH={{ base: '100dvh', sm: '100vh', md: '100vh' }}
      h={{ base: '100dvh', sm: 'auto', md: 'auto' }}
      overflow={{ base: 'hidden', sm: 'visible', md: 'visible' }}
      display='flex'
      justifyContent='center'
      alignItems={{ base: 'stretch', sm: 'center', md: 'center' }}
      py={{ base: '0', sm: '20', md: '20' }}
      px={{ base: '0', sm: '4', md: '4' }}
    >
      <Box
        w='100%'
        display='flex'
        flexDirection='column'
        minH={{ base: '100dvh', sm: 'auto', md: 'auto' }}
        h={{ base: '100dvh', sm: 'auto', md: 'auto' }}
        maxH={{ base: '100dvh', sm: 'none', md: 'none' }}
        justifyContent={{ base: 'space-between', sm: 'flex-start', md: 'flex-start' }}
        gap={{ base: '0', sm: '6', md: '6' }}
        overflow={{ base: 'hidden', sm: 'visible', md: 'visible' }}
      >
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          w='100%'
          flex={{ base: '1', sm: 'none', md: 'none' }}
          position='relative'
          bg={{ base: '#fe6306', sm: 'transparent', md: 'transparent' }}
          pt={{ base: '0', sm: '0', md: '0' }}
          pb={{ base: '0', sm: '0', md: '0' }}
        >
          <Box
            display={{ base: 'block', sm: 'none', md: 'none' }}
            position='absolute'
            top='0'
            left='0'
            right='0'
            bottom='0'
            backgroundImage='url("/orbit_favicon-removebg-preview.png")'
            backgroundSize='contain'
            backgroundPosition='center'
            backgroundRepeat='no-repeat'
            opacity='0.15'
            pointerEvents='none'
          />
          <Text
            fontSize={{ base: '7xl', sm: '7xl', md: '7xl' }}
            fontWeight='normal'
            fontFamily="'Pacifico', cursive"
            color='white'
            textAlign='center'
            w='100%'
            zIndex={1}
            css={{
              textShadow: '0 1px 2px rgba(254, 99, 6, 0.4)',
            }}
          >
            Orbit
          </Text>
        </Box>

        <Box
          w='100%'
          pt={{ base: 6, sm: 8, md: 8 }}
          px={{ base: 6, sm: 8, md: 8 }}
          pb={{ base: 'calc(24px + env(safe-area-inset-bottom, 16px))', sm: 8, md: 8 }}
          mt={{ base: '-32px', sm: '0', md: '0' }}
          borderTopRadius={{ base: '32px', sm: '24px', md: '24px' }}
          borderBottomRadius={{ base: '0px', sm: '24px', md: '24px' }}
          color='white'
          bg='rgba(255, 255, 255, 0.07)'
          backdropFilter='blur(32px)'
          border='1px solid rgba(255, 255, 255, 0.1)'
          boxShadow='inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          position='relative'
          maxH={{ base: '70vh', sm: 'none', md: 'none' }}
          display={{ base: 'flex', sm: 'block', md: 'block' }}
          flexDirection={{ base: 'column', sm: 'unset', md: 'unset' }}
          overflow={{ base: 'hidden', sm: 'visible', md: 'visible' }}
          zIndex={{ base: 50, sm: 'auto', md: 'auto' }}
        >
          <Tabs.Root
            value={tab}
            onValueChange={(details) => setTab(details.value)}
            variant='plain'
            display={{ base: 'flex', sm: 'block', md: 'block' }}
            flexDirection={{ base: 'column', sm: 'unset', md: 'unset' }}
            h={{ base: '100%', sm: 'auto', md: 'auto' }}
            overflow={{ base: 'hidden', sm: 'visible', md: 'visible' }}
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
                h={{ base: '44px', sm: 'auto', md: 'auto' }}
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
                h={{ base: '44px', sm: 'auto', md: 'auto' }}
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

            <Box
              key={tab}
              animation='panelFadeIn 240ms ease-out'
              flex={{ base: '1', sm: 'none', md: 'none' }}
              display={{ base: 'flex', sm: 'block', md: 'block' }}
              flexDirection={{ base: 'column', sm: 'unset', md: 'unset' }}
              overflow={{ base: 'hidden', sm: 'visible', md: 'visible' }}
              px='1'
            >
              {tab === 'members' ? <Login /> : <Signup />}
            </Box>
          </Tabs.Root>
        </Box>
      </Box>
    </Container>
  )
}

export default Home