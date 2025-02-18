import { RocketIcon } from 'lucide-react'
import React from 'react'

export default function RocketComponent({ degrees }: { degrees: number }) {
  return (
    <div>
      <RocketIcon
        size={32}
        className='fill-red-500'
        style={{ transform: `rotate(${-45 - degrees / 3}Deg)`, transition: 'all', animationDuration: '10ms' }}
      />
    </div>
  )
}