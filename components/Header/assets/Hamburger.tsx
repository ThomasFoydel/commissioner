import React from 'react'

const Hamburger = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="512.000000pt"
      height="512.000000pt"
      viewBox="0 0 512.000000 512.000000"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
        fill="currentColor"
        stroke="currentColor"
      >
        <path
          d="M747 3936 c-49 -18 -64 -32 -89 -80 -37 -73 -13 -153 62 -203 l33
-23 1807 0 1807 0 33 23 c48 32 72 69 77 119 7 58 -23 118 -74 149 l-38 24
-1790 2 c-1480 2 -1797 0 -1828 -11z"
        />
        <path
          d="M735 2706 c-67 -29 -105 -106 -91 -181 9 -47 59 -102 104 -115 26 -8
593 -10 1834 -8 l1797 3 27 21 c53 39 69 71 69 134 0 63 -16 95 -69 134 l-27
21 -1807 2 c-1487 2 -1812 0 -1837 -11z"
        />
        <path
          d="M720 1468 c-48 -33 -72 -70 -77 -120 -7 -58 23 -118 74 -149 l38 -24
1805 0 1805 0 38 24 c51 31 81 91 74 149 -5 50 -29 87 -77 120 l-33 22 -1807
0 -1807 0 -33 -22z"
        />
      </g>
    </svg>
  )
}

export default Hamburger
