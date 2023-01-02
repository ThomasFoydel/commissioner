import React, { useState, useEffect } from 'react'
import { readTextFromIpfs } from '../../utils/ipfs/client'

interface props {
  path: string
}

const InterplanetaryContent = (props: props) => {
  const { path } = props
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
