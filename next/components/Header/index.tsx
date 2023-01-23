import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useEthers } from '@usedapp/core'
import Hamburger from './assets/Hamburger'

const Header = () => {
  const { account } = useEthers()
  const routes = [
    { path: '/about', label: 'about' },
    { path: '/commissions', label: 'commissions' },
    { path: `/user/${account?.toLowerCase()}`, label: 'profile', hide: !account },
    { path: '/terminal', label: 'terminal' },
  ]

  const router = useRouter()
  const routerPath = router.asPath.toLowerCase()

  return (
    <>
      <div
        style={{ textShadow: 'none' }}
        className="text-center hidden sm:flex justify-center h-[30px]"
      >
        {routes
          .filter((route) => !route.hide)
          .map((route) => (
            <Link
              className={`hover:text-skin-button-muted transition mx-3 ${
                router.asPath.toLowerCase() === route.path ? 'underline' : ''
              }`}
              href={route.path}
              key={route.path}
            >
              {route.label}
            </Link>
          ))}
      </div>

      <MobileDrawer routes={routes} routerPath={routerPath} />
    </>
  )
}

const MobileDrawer = ({
  routes,
  routerPath,
}: {
  routes: { path: string; label: string; hide?: boolean }[]
  routerPath: string
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggledrawerOpen = () => setDrawerOpen((o) => !o)
  return (
    <>
      <div
        className={`flex flex-col absolute z-10 bg-[#111010] border-[#d0fc7e] border-[1px] w-full ${
          drawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          textShadow: 'none',
          transform: drawerOpen ? 'translateY(30px)' : 'translateY(-200%)',
          transition: '.75s all cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {routes.map((route) => (
          <Link
            onClick={() => setDrawerOpen(false)}
            className={`hover:text-skin-button-muted transition my-2 ml-2 ${
              routerPath === route.path ? 'underline' : ''
            }`}
            href={route.path}
            key={route.path}
          >
            {route.label}
          </Link>
        ))}
      </div>
      <div
        style={{ textShadow: 'none', position: 'relative' }}
        className="text-center flex sm:hidden justify-center h-[30px] z-50"
      >
        <button
          className="w-full h-[30px] bg-[#161716] focus:outline-none text-skin-button-accent hover:text-skin-button-muted hover:bg-[#101210] transition"
          onClick={toggledrawerOpen}
        >
          <Hamburger className="center transition w-[24px] h-[24px]" />
        </button>
      </div>
    </>
  )
}

export default Header
