import Link from 'next/link'
// import { useTheme } from 'next-themes'
import { useEthers } from '@usedapp/core'
import React, { useEffect, useState } from 'react'

// const ThemeToggle = () => {
//   const [mounted, setMounted] = useState(false)
//   useEffect(() => {
//     setMounted(true)
//     return () => {
//       setMounted(false)
//     }
//   }, [])
//   const { systemTheme, theme, setTheme } = useTheme()
//   const currentTheme = theme === 'system' ? systemTheme : theme
//   if (currentTheme === 'dark') {
//     return <button onClick={() => mounted && setTheme('light')}>SUN</button>
//   }
//   return <button onClick={() => mounted && setTheme('dark')}>MOON</button>
// }

const Header = () => {
  const { account } = useEthers()
  return (
    <div className="text-center flex justify-center h-[30px]">
      <Link href="/">
        <a className="link mx-3">about</a>
      </Link>
      <Link href="/commissions">
        <a className="link mx-3">commissions</a>
      </Link>
      <Link href="/create">
        <a className="link mx-3">create</a>
      </Link>
      {account && (
        <Link href={`/user/${account.toLowerCase()}`}>
          <a className="link mx-3">profile</a>
        </Link>
      )}
      <Link href="/terminal">
        <a className="link mx-3">terminal</a>
      </Link>
      {/* <ThemeToggle /> */}
    </div>
  )
}

export default Header
