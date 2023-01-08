import React from 'react'
import Typist from 'react-typist'
import 'react-typist/dist/Typist.css'

const TypeOut = ({ children }: { children: React.ReactNode }) => (
  <Typist
    stdTypingDelay={20}
    avgTypingDelay={55}
    cursor={{ hideWhenDone: true, hideWhenDoneDelay: 4000 }}
  >
    {children as any}
  </Typist>
)

export default TypeOut
