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
        <p className="link mx-3">about</p>
      </Link>
      <Link href="/commissions">
        <p className="link mx-3">commissions</p>
      </Link>
      <Link href="/create">
        <p className="link mx-3">create</p>
      </Link>
      {account && (
        <Link href={`/user/${account.toLowerCase()}`}>
          <p className="link mx-3">profile</p>
        </Link>
      )}
      <Link href="/terminal">
        <p className="link mx-3">terminal</p>
      </Link>
      {/* <ThemeToggle /> */}
    </div>
  )
}

export default Header
