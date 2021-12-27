import React from 'react'

interface Props {
  onSubmit?: () => void,
}

export default function JoinGameDisplay({ onSubmit }: Props) {
  return (
    <div>
      <div className="m-3">
        <label>Your Name</label>
        <input className="border rounded mx-2" />
      </div>
      <div className="m-3">
        <label>Game Code</label>
        <input className="border rounded mx-2" />
      </div>
      <button className="border-2 border-blue-800 rounded px-5 m-3 bg-blue-200" type="submit" onClick={() => onSubmit && onSubmit()}>Go</button>
    </div>
  )
}
