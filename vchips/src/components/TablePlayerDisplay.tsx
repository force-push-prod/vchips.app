import React, { useEffect } from 'react'
import { connection } from '../model/websocket'

interface Props {
  onSubmit?: () => void,
}

export default function TablePlayerDisplay({ onSubmit }: Props) {
    const [players, setPlayers] = React.useState("")
    useEffect(() => {
        connection.onmessage = message => {
            console.log(message)
            let tableData = JSON.parse(message.data)
            setPlayers(JSON.stringify(tableData))
        }
    })
  return (
    <div>
      <div className="m-3">
        <label>Table Players</label>
        <h2>{players}</h2>
      </div>
      <button className="border-2 border-blue-800 rounded px-5 m-3 bg-blue-200" type="submit" onClick={() => onSubmit && onSubmit()}>Go</button>
    </div>
  )
}
