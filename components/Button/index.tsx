import React, { ReactNode } from 'react'

enum Type {
  button = 'button',
  submit = 'submit',
  reset = 'reset',
}
const Button = ({
  className,
  type,
  onClick,
  children,
}: {
  className?: string
  type?: Type
  onClick: Function
  children: ReactNode
}) => {
  return (
    <button
      onClick={(e) => onClick(e)}
      type={type || Type.button}
      className={`${className} button center block my-4 w-full sm:ml-0 sm:transform-none sm:w-[200px]`}
    >
      {children}
    </button>
  )
}

export default Button
