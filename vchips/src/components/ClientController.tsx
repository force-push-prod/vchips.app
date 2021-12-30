import React from 'react'
import PrimaryGameDisplay from './PrimaryGameDisplay'
import JoinGameDisplay from './JoinGameDisplay'
import type { PlayerAction, PokerServer, Table } from '../poker'
import SetupGameDisplay from './SetupGameDisplay'

interface Props { }
interface State {
  playerName: string;
  playerId: string | null;
  isConnected: boolean;
  table: Table | null;
}

export default class ClientController extends React.Component<Props, State> {
  state: State = {
    playerName: '',
    playerId: null,
    isConnected: false,
    table: null,
  }

  get isMyTurn() { return false; }
  get server() {
    // @ts-ignore
    return (globalThis.server as PokerServer);
  }

  onConnected = (table: Table) => {
    this.setState({ isConnected: true });
    table.players.push(this.state.playerName);
    this.server.updateTable(table);
  }

  onDisconnected = () => {
    this.setState({ isConnected: false });
  }

  connect = ({ name, code }: { name: string, code: string }) => {
    this.setState({ playerName: name, playerId: name }, () => {
      // @ts-ignore
      this.server.connect(name, { onConnect: this.onConnected, onDisconnect: this.onDisconnected, onUpdate: this.onUpdate });
    });
  }

  disconnect = () => {
    this.setState({ playerId: null });
    if (this.state.playerId !== null)
      this.server.disconnect(this.state.playerId);
  }

  onUpdate = (table: Table) => {
    this.setState({ table });
  }

  onAction = (action: PlayerAction) => {
    if (!this.state.table?.currentGame)
      throw new Error('Unexpected undefined game');
    this.state.table.currentGame.act(action);
    this.server.updateTable(this.state.table);
  }

  render() {
    const { table } = this.state;
    const currentGame = table?.currentGame;
    console.log(currentGame?.currentPlayer);

    return (
      <div className='w-full h-full'>
        {
          this.state.playerId === null ?
            <JoinGameDisplay
              previousName={this.state.playerName}
              onSubmit={(fields) => this.connect(fields)}
            />
            :
            table === null ?
              <div>Error</div>
              :
              !currentGame ?
                <SetupGameDisplay
                  isDisconnected={!this.state.isConnected}
                  disconnect={() => this.disconnect()}
                  table={table}
                  onUpdate={(newTable: Table) => this.server.updateTable(newTable)}
                />
                :
                <PrimaryGameDisplay
                  isDisconnected={!this.state.isConnected}
                  isMyTurn={currentGame.currentPlayer === this.state.playerId}
                  myStack={currentGame.gameStacks[this.state.playerId]}
                  potSizes={currentGame.pots.map(p => p.amount)}
                  actions={currentGame.currentPlayer === this.state.playerId ? currentGame.currentPlayerActions : []}
                  betted={currentGame.currentBets[this.state.playerId] ?? 0}
                  state={currentGame.actQueue.includes(this.state.playerId) ? 'default' :
                    currentGame.settledQueue.includes(this.state.playerId) ? 'called' : 'folded'
                  }
                  disconnect={() => this.disconnect()}
                  act={(a: PlayerAction) => this.onAction(a)}
                />
        }
      </div>
    )
  }
}
