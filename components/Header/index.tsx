import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEthers } from '@usedapp/core'

const Header = () => {
  const { account } = useEthers()
  const router = useRouter()
  const routes = [
    { path: '/about', label: 'about' },
    { path: '/commissions', label: 'commissions' },
    { path: `/user/${account?.toLowerCase()}`, label: 'profile', hide: !account },
    { path: '/terminal', label: 'terminal' },
  ]
  
  return (
    <div style={{ textShadow: 'none' }} className="text-center flex justify-center h-[30px]">
      {routes
        .filter((route) => !route.hide)
        .map((route) => (
          <Link href={route.path}>
            <a className={`mx-3 ${router.asPath.toLowerCase() === route.path ? 'underline' : ''}`}>
              {route.label}
            </a>
          </Link>
        ))}
    </div>
  )
}

export default Header
