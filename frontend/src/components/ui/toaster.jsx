'use client'

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
})

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }} zIndex={20000}>
        {(toast) => (
          <Toast.Root 
            width={{ md: 'sm' }}
            bg="var(--glass-bg)"
            backdropFilter="var(--glass-blur)"
            border="var(--glass-border)"
            borderRadius="var(--glass-radius-sm)"
            boxShadow="var(--glass-shadow)"
            color="var(--text-primary)"
            zIndex={20000}
          >
            {toast.type === 'loading' ? (
              <Spinner size='sm' color='blue.solid' />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap='1' flex='1' maxWidth='100%'>
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
