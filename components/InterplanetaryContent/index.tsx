import React, { useState, useEffect } from 'react'
import axios from 'axios'

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
        const result = await axios.get(`https://ipfs.infura.io/ipfs/${path}`)
        const data = result?.data
        if (data && typeof data === 'string') setContent(data)
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
