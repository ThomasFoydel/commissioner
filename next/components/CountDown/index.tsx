import React, { useEffect, useState } from 'react'
import { timeStringFromSeconds } from '../../utils/terminal'

const CountDown = ({
  endTimestamp,
  onCompletion,
}: {
  endTimestamp: number
  onCompletion: Function
}) => {
  const [secondsLeft, setSecondsLeft] = useState(
    Date.now() / 1000 - endTimestamp > 0 ? Date.now() / 1000 - endTimestamp : 0
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = endTimestamp - Date.now() / 1000 > 0 ? endTimestamp - Date.now() / 1000 : 0
      setSecondsLeft(timeLeft)

      if (timeLeft <= 0) onCompletion(true)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return <span>{timeStringFromSeconds(secondsLeft)}</span>
}

export default CountDown
