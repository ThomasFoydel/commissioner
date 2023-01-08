import React from 'react'
import Link from 'next/link'
import { useEthers } from '@usedapp/core'

const Header = () => {
  const { account } = useEthers()
  return (
    <div style={{ textShadow: 'none' }} className="text-center flex justify-center h-[30px]">
      <Link href="/about">
        <a className="mx-3">about</a>
      </Link>
      <Link href="/commissions">
        <a className="mx-3">commissions</a>
      </Link>
      <Link href="/create">
        <a className="mx-3">create</a>
      </Link>
      {account && (
        <Link href={`/user/${account.toLowerCase()}`}>
          <a className="mx-3">profile</a>
        </Link>
      )}
      <Link href="/terminal">
        <a className="mx-3">terminal</a>
      </Link>
    </div>
  )
}

export default Header
