import React from 'react'
import { Table } from '../poker'
import DraggableList from './DraggableList'

interface Props {
  isDisconnected: boolean;
  disconnect: () => void;
  table: Table;
  onUpdate: (newTable: Table) => void;
}

export default function SetupGameDisplay(props: Props) {
  const startGame = () => {
    props.table.tableStacks = Object.assign({}, ...props.table.players.map(p => ({ [p]: 1000 })))
    props.table.currentGame = props.table.initializeNewGame();
    props.onUpdate(props.table);
  }

  return (
    <div className={`h-full w-full primary-game-display container-rainbow ${props.isDisconnected && 'container-disconnected'}`}>
      <div className="whitespace-pre">{JSON.stringify(props, null, 4)}</div>
      <div className="flex flex-col items-center">
        <DraggableList initialCards={props.table.players} onChange={(newPlayers) => { props.onUpdate({ ...props.table, players: newPlayers } as Table) }} />
      </div>
      <button className="text-xl font-medium border rounded" onClick={() => startGame()}>Start Game with 1000 chips each</button>
      <button className="text-xl font-medium border rounded" onClick={() => props.disconnect()}>Disconnect</button>
    </div>
  )
}
