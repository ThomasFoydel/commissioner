import React, { useState, useEffect } from 'react'
import { readTextFromIpfs } from '../../utils/ipfs/client'

const InterplanetaryContent = ({ path }: { path: string }) => {
  const [content, setContent] = useState('Loading...')
  useEffect(() => {
    if (!path) return
    let mounted = true
    const fetchContent = async () => {
      try {
        const text = await readTextFromIpfs(path)
        if (text && typeof text === 'string') setContent(text)
        else throw new Error()
      } catch (err) {
        mounted && setContent('Error loading content.')
      }
    }
    fetchContent()
    return () => {
      mounted = false
    }
  }, [path])
  return <>{content}</>
}

export default InterplanetaryContent
