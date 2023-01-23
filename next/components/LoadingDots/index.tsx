import Typist from 'react-typist'
import React, { useState } from 'react'

const LoadingDots = () => {
  let texts = ['...', '...']
  const [currentTextCounter, setCurrentTextCounter] = useState(0)
  return (
    <Typist
      key={currentTextCounter}
      avgTypingDelay={400}
      onTypingDone={() => {
        if (currentTextCounter < texts.length - 1) setCurrentTextCounter(currentTextCounter + 1)
        else setCurrentTextCounter(0)
      }}
    >
      {texts[currentTextCounter]}
    </Typist>
  )
}
export default LoadingDots
