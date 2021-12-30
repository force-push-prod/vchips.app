import React from 'react'
import {websocketLogin} from '../model/websocket'
import { createTableNetworkCall } from '../model/table'

interface Props {
  onSubmit?: () => void,
}

export default function JoinGameDisplay({ onSubmit }: Props) {
  const [userId, setUserId] = React.useState("")
  const [tableId, setTableId] = React.useState("")
  return (
    <div>
      <button className="border-2 border-blue-800 rounded px-5 m-3 bg-blue-200" type="submit" onClick={async () => {
        let result = await createTableNetworkCall(10, 20)
        console.log(result)
      }}>Create Table</button>
    <h1>
      Game Id: {tableId}
    </h1>
    <div className="m-3">
        <label>Your Name</label>
        <input
          className="border rounded mx-2"
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
      </div>
      <div className="m-3">
        <label>Game Code</label>
        <input
          className="border rounded mx-2"
          type="text"
          value={tableId}
          onChange={e => setTableId(e.target.value)}
        />
      </div>
      <button className="border-2 border-blue-800 rounded px-5 m-3 bg-blue-200" type="submit" onClick={() => {
        onSubmit && onSubmit()
        websocketLogin(userId, tableId)
      }}>Go</button>
    </div>
  )
}
