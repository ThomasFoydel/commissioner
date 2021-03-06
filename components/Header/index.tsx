import { useEthers } from "@usedapp/core"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"

const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
        return () => {
            setMounted(false)
        }
    })
    const { systemTheme, theme, setTheme } = useTheme()
    const currentTheme = theme === "system" ? systemTheme : theme
    if (currentTheme === "dark") {
        return <button onClick={() => mounted && setTheme("light")}>SUN</button>
    }
    return <button onClick={() => mounted && setTheme("dark")}>MOON</button>
}

const Header = () => {
    const { account } = useEthers()
    return (
        <div className="text-center flex justify-center">
            <Link href="/commissions">
                <p className="link mx-3">all commissions</p>
            </Link>
            <Link href="/create">
                <p className="link mx-3">create commission</p>
            </Link>
            {account && (
                <Link href={`/user/${account.toLowerCase()}`}>
                    <p className="link mx-3">my profile</p>
                </Link>
            )}
            <Link href="/terminal">
                <p className="link mx-3">terminal</p>
            </Link>
            <ThemeToggle />
        </div>
    )
}

export default Header
