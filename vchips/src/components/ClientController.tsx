import React from 'react'
import PrimaryGameDisplay from './PrimaryGameDisplay'
import JoinGameDisplay from './JoinGameDisplay'
import { PlayerAction, PokerServer, Table, Game, findPlayer, WLSOption } from '../poker'
import SetupGameDisplay from './SetupGameDisplay'
import ShowdownDisplay from './ShowdownDisplay'

interface Props {
  debugPlayerId?: string;
}

interface State {
  playerId: string;
  isConnected: boolean;
  table: Table | null;
}

export default class ClientController extends React.Component<Props, State> {
  state: State = {
    playerId: this.props.debugPlayerId ?? '',
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
    table.players.push(this.state.playerId);
    this.server.updateTable(table);
  }

  onDisconnected = () => {
    this.setState({ isConnected: false });
  }

  connect = ({ name, code }: { name: string, code: string }) => {
    this.setState({ playerId: name }, () => {
      // @ts-ignore
      this.server.connect(name, { onConnect: this.onConnected, onDisconnect: this.onDisconnected, onUpdate: this.onUpdate });
    });
  }

  disconnect = () => {
    this.setState({ playerId: '', table: null });
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

  onChooseWLS = (potIndex: number, action: WLSOption) => {
    if (!this.state.table?.currentGame)
      throw new Error('Unexpected undefined game');
    this.state.table.currentGame.setPlayerResult(this.state.playerId, potIndex, action);
    this.server.updateTable(this.state.table);
  }

  render() {
    const { table } = this.state;
    const currentGame = table?.currentGame;

    return (
      <div className='w-full h-full'>
        {
          this.state.playerId === '' || table === null ?
            <JoinGameDisplay
              previousId={this.state.playerId}
              onSubmit={(fields) => this.connect(fields)}
            />
            :
            !currentGame ?
              <SetupGameDisplay
                isDisconnected={!this.state.isConnected}
                disconnect={() => this.disconnect()}
                table={table}
                onUpdate={(newTable: Table) => this.server.updateTable(newTable)}
              />
              :
              currentGame.currentRound === 'showdown' ?
                <ShowdownDisplay
                  isDisconnected={!this.state.isConnected}
                  currentGame={currentGame}
                  potInfos={currentGame.getPotResultsForPlayer(this.state.playerId)}
                  onChooseWLS={this.onChooseWLS}
                />
                :
                <PrimaryGameDisplay
                  currentRound={currentGame.currentRound}
                  isDisconnected={!this.state.isConnected}
                  isMyTurn={currentGame.currentPlayer === this.state.playerId}
                  myStack={currentGame.gameStacks[this.state.playerId]}
                  potSizes={currentGame.pots.map(p => p.amount)}
                  position={extractPosition(currentGame, this.state.playerId)}
                  actions={currentGame.currentPlayer === this.state.playerId ? currentGame.currentPlayerActions : []}
                  betted={currentGame.currentBets[this.state.playerId] ?? 0}
                  state={extractDisplayStateFromGame(currentGame, this.state.playerId)}
                  disconnect={() => this.disconnect()}
                  act={(a: PlayerAction) => this.onAction(a)}
                />
        }
      </div>
    )
  }
}

function extractPosition(game: Game, player: string): ('sb' | 'bb' | 'utg' | 'button')[] {
  return [
    findPlayer(game.allPlayers, game.buttonPlayer, 'utg') === player && 'utg',
    findPlayer(game.allPlayers, game.buttonPlayer, 'sb') === player && 'sb',
    findPlayer(game.allPlayers, game.buttonPlayer, 'bb') === player && 'bb',
    game.buttonPlayer === player && 'button',
  ].filter(Boolean) as any;
}

type ClientState = 'folded' | 'checked' | 'raised' | 'called' | 'default';
function extractDisplayStateFromGame(game: Game, player: string): ClientState {
  if (!game.settledQueue.includes(player) && !game.actQueue.includes(player))
    return 'folded';

  if (game.actQueue.includes(player))
    return 'default';

  const playerBet = game.currentBets[player] ?? 0;
  const maxBetExceptPlayer = Math.max(0, ...Object.entries(game.currentBets).filter(([p, _]) => p !== player).map(([_, x]) => x));
  if (playerBet === 0)
    return 'checked';

  if (playerBet === maxBetExceptPlayer)
    return 'called';

  if (playerBet > maxBetExceptPlayer)
    // return 'raised'; TODO: Currently there is no way to determine if the player raised
    return 'called';

  throw new Error('?');
}
