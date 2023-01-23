import React, { ReactNode, useEffect, useState } from 'react'
import TypeOut from '../TypeOut'

const DynamicTypeOut = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState(children)
  const [needsUpdate, setNeedsUpdate] = useState(false)

  useEffect(() => {
    if (JSON.stringify(children) !== JSON.stringify(content)) {
      setNeedsUpdate(true)
    }
  }, [children])

  useEffect(() => {
    setContent(children)
    setNeedsUpdate(false)
  }, [needsUpdate])

  return needsUpdate ? <></> : <TypeOut>{content as any}</TypeOut>
}

export default DynamicTypeOut
