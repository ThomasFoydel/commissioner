import React from 'react'

const PageSelector = ({ onChange, page }: { onChange: Function; page: number }) => {
  return (
    <div>
      <p className="center text-center mb-2">PAGE {page + 1}</p>
      <div className="flex justify-center">
        <button
          onClick={() => onChange((page: number) => (page > 0 ? page - 1 : 0))}
          className="button w-[120px] mr-2"
        >
          previous
        </button>
        <button onClick={() => onChange((page: number) => page + 1)} className="button w-[120px] ml-2">
          next
        </button>
      </div>
    </div>
  )
}

export default PageSelector
