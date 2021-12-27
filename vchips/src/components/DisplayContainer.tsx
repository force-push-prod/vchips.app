import React, { ReactChild } from 'react'

interface Props {
  children: ReactChild,
}

export default function DisplayContainer({ children }: Props) {
  return (
    <div className="border-4 border-yellow-500" style={{ width: 500, height: 800 }}>
      {children}
    </div>
  )
}
