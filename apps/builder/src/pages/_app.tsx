import { useEffect } from 'react'
import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react'
import { customTheme } from '@/lib/theme'
import { useRouterProgressBar } from '@/lib/routerProgressBar'
import '@/assets/styles/routerProgressBar.css'
import '@/assets/styles/plate.css'
import '@/assets/styles/submissionsTable.css'
import '@/assets/styles/custom.css'
import { UserProvider } from '@/features/account'
import { TypebotProvider } from '@/features/editor'
import { useRouter } from 'next/router'
import { SupportBubble } from '@/components/SupportBubble'
import { WorkspaceProvider } from '@/features/workspace'
import { toTitleCase } from 'utils'
import { Session } from 'next-auth'
import { Plan } from 'db'
import { trpc } from '@/lib/trpc'
import { NewVersionPopup } from '@/components/NewVersionPopup'

const { ToastContainer, toast } = createStandaloneToast(customTheme)

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session?: Session }>) => {
  useRouterProgressBar()
  const { query, pathname } = useRouter()

  useEffect(() => {
    pathname.endsWith('/edit')
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'auto')
  }, [pathname])

  useEffect(() => {
    const newPlan = query.stripe?.toString()
    if (newPlan === Plan.STARTER || newPlan === Plan.PRO)
      toast({
        position: 'top-right',
        status: 'success',
        title: 'Upgrade success!',
        description: `Workspace upgraded to ${toTitleCase(newPlan)} 🎉`,
      })
  }, [query.stripe])

  const typebotId = query.typebotId?.toString()

  return (
    <>
      <ToastContainer />
      <ChakraProvider theme={customTheme}>
        <SessionProvider session={session}>
          <UserProvider>
            <TypebotProvider typebotId={typebotId}>
              <WorkspaceProvider typebotId={typebotId}>
                <Component {...pageProps} />
                <SupportBubble />
                <NewVersionPopup />
              </WorkspaceProvider>
            </TypebotProvider>
          </UserProvider>
        </SessionProvider>
      </ChakraProvider>
    </>
  )
}

export default trpc.withTRPC(App)
