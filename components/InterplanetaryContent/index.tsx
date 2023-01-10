import React, { useState, useEffect } from 'react'
import { truncateContent } from '../../utils'
import { readTextFromIpfs } from '../../utils/ipfs/client'
import TypeOut from '../TypeOut'

const InterplanetaryContent = ({
  path,
  label,
  maxChars,
}: {
  path: string
  label?: string
  maxChars?: number
}) => {
  const [content, setContent] = useState('')
  useEffect(() => {
    if (!path) return
    let mounted = true
    const fetchContent = async () => {
      try {
        const text = await readTextFromIpfs(path)
        if (text && mounted)
          setContent(maxChars ? truncateContent(String(text), maxChars) : String(text))
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

  if (!content) return <></>
  return <TypeOut>{label ? `${label} ${content}` : content}</TypeOut>
}

export default InterplanetaryContent
