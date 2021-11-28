type ChipAmount = number;
type PlayerId = string;
type GameRoundName = "pre-flop" | "flop" | "turn" | "river";

interface Player {
  id: PlayerId;
  stack: ChipAmount;
}

type PlayersCashAmount = Record<PlayerId, ChipAmount>;

interface PlayerActionFold {
  type: "fold";
}

interface PlayerActionCheck {
  type: "check";
}

interface PlayerActionCall {
  type: "call";
  addedAmount: ChipAmount;
  totalAmount: ChipAmount;
}

interface PlayerActionRaise {
  type: "raise";
  addedAmount: ChipAmount;
  totalAmount: ChipAmount;
}

type PlayerAction = PlayerActionFold | PlayerActionCheck | PlayerActionCall | PlayerActionRaise;

interface Pot {
  amount: ChipAmount;
  players: PlayerId[];
}

interface PotResult extends Pot {
  winners: PlayerId[];
}

interface Round {
  name: GameRoundName;
  bets: Record<PlayerId, ChipAmount>;
  currentPlayer: PlayerId | null;
  inGamePlayerStates: PlayerStates[];
}


type PlayerStates = "active" | "folded" | "all-in" | "called";

interface Table {
  smallBlindAmount: ChipAmount;
  bigBlindAmount: ChipAmount;
  players: PlayerId[];
  playersCashAmount: PlayersCashAmount;
  // currentGame: Game;
  previousGames: GameInterface[];
}

interface GameInterface {
  buttonPlayer: PlayerId;
  gameStacks: PlayersCashAmount;
  pots: Pot[];
  currentRound: GameRoundName;
  currentBets: Record<PlayerId, ChipAmount>;
  settledQueue: PlayerId[];
  actQueue: PlayerId[];
  // outQueue: PlayerId[];

  // rounds: Round[];
  // inGamePlayers: PlayerId[];
  // decisions: { player: PlayerId, decision: PlayerDecision }[];
  // results: PotResult[];
}

function process(table: Table, decision: PlayerAction): Table {
  return table;
}

function undo(table: Table) {
  return table;
}

function findPlayer(players: PlayerId[], button: PlayerId, type: 'utg' | 'sb' | 'bb'): PlayerId {
  const buttonIndex = players.indexOf(button);

  if (buttonIndex === -1)
    throw Error('Button player is not in players: ' + { players, button });

  let i = 0;

  switch (type) {
    case 'sb':
      i = buttonIndex - 1;
      break;

    case 'bb':
      i = buttonIndex - 2;
      break;

    case 'utg':
      i = buttonIndex - 3;
      break;

    default:
      throw Error('Unexpected type: ' + type);
  }
  if (i < 0) i = players.length + i;

  if (players[i] === undefined)
    throw Error('Internal Error: Unexpected undefined');

  return players[i];
}

class Game implements GameInterface {
  buttonPlayer!: PlayerId;
  gameStacks!: PlayersCashAmount;
  pots!: Pot[];
  currentRound!: GameRoundName;
  currentBets!: Record<PlayerId, ChipAmount>;
  settledQueue!: PlayerId[];
  actQueue!: PlayerId[];

  fromJSON(s: string) { Object.assign(this, JSON.parse(s)); };
  toJSON() { return this; }

  constructor(obj: GameInterface) {
    Object.assign(this, obj);
  }

  get currentPlayer(): PlayerId {
    return this.actQueue[0];
  }

  get currentPlayerActions(): PlayerAction[] {
    const playerToAct = this.currentPlayer;
    const maxBetSoFar = Math.max(...Object.values(this.currentBets), 0);
    const playerBet = this.currentBets[playerToAct] ?? 0;
    const diff = maxBetSoFar - playerBet;
    const result: PlayerAction[] = [{ type: "fold" }];

    if (diff === 0) {
      result.push({ type: "raise", addedAmount: 0, totalAmount: playerBet });
      result.push({ type: "check" });
    } else {
      result.push({ type: "raise", addedAmount: diff, totalAmount: maxBetSoFar }); // TODO: Re-raise
      result.push({ type: "call", addedAmount: diff, totalAmount: maxBetSoFar });
    }

    return result;
  }

  act(action: PlayerAction) {
    if (this.actQueue.length === 0)
      throw new Error('Never')

    if (action.type === 'fold') {
      this.actQueue.shift();
    } else if (action.type === 'check') {
      this.settledQueue.push(this.actQueue.shift()!);
    } else if (action.type === 'call') {
      // TODO: Check if they have that amount of chips
      this.gameStacks[this.currentPlayer] -= action.addedAmount;
      this.currentBets[this.currentPlayer] ??= 0;
      this.currentBets[this.currentPlayer] += action.addedAmount;
      if (this.currentBets[this.currentPlayer] !== action.totalAmount) throw Error('...');
      this.settledQueue.push(this.actQueue.shift()!);
    } else if (action.type === 'raise') {
      // TODO: Check if they have that amount of chips
      this.gameStacks[this.currentPlayer] -= action.addedAmount;
      this.currentBets[this.currentPlayer] ??= 0;
      this.currentBets[this.currentPlayer] += action.addedAmount;
      if (this.currentBets[this.currentPlayer] !== action.totalAmount) throw Error('...');
      this.actQueue.push(...this.settledQueue);
      this.settledQueue = [];
      this.settledQueue.push(this.actQueue.shift()!);
    } else {
      throw Error('Never');
    }

    if (this.actQueue.length === 0) {
      // TODO: Re-adjust order according to round
      this.actQueue = this.settledQueue;
      this.settledQueue = [];
      // TODO: Handle side pots
      const potSum = Object.values(this.currentBets).reduce((x, p) => x + p, 0);
      this.pots[0].amount += potSum;
      this.currentBets = {};

      if (this.currentRound === 'pre-flop' || this.currentRound === 'flop' || this.currentRound === 'turn') {
        this.currentRound = this.currentRound === 'pre-flop' ? 'flop' :
          this.currentRound === 'flop' ? 'turn' : 'river';

      } else if (this.currentRound === 'river') {
        // TODO: Ask for result and split the pots
        console.log('Finished');
      } else {
        throw Error('Never');
      }
    }
  }

  toString(): string {
    let result = "";
    // Pots
    if (this.pots.length === 1)
      result += `Pot: ${this.pots[0].amount}\n`;
    else {
      result += `Pots:\n`;
      for (const p of this.pots)
        result += `- ${p.amount} (${p.players.join(', ')})\n`;
    }

    // Round
    result += `Round: ${this.currentRound}\n`;
    result += `\n`;

    // Players
    for (const p of this.settledQueue) result += `${p} (${this.gameStacks[p]}): ${this.currentBets[p] ?? 0}\n`;
    result += '> ';
    for (const p of this.actQueue) result += `${p} (${this.gameStacks[p]}): ${this.currentBets[p] ?? 0}\n`;

    return result;
  }
}

function initGameFromTable(t: Table, buttonPlayer?: PlayerId): Game {
  buttonPlayer ??= t.players[0];
  const sb = findPlayer(t.players, buttonPlayer, 'sb');
  const bb = findPlayer(t.players, buttonPlayer, 'bb');

  return new Game({
    buttonPlayer,
    gameStacks: Object.assign({}, t.playersCashAmount),
    pots: [{ amount: 0, players: Array.from(t.players) }],
    currentRound: 'pre-flop',
    currentBets: { [sb]: t.smallBlindAmount, [bb]: t.bigBlindAmount }, // TODO: Deduct sb/bb from gameStack
    settledQueue: [],
    actQueue: Array.from(t.players), // TODO: Re-adjust order according to buttonPlayer
  })
}

function getMockTable(): Table {
  const players = ['Alice', 'Bob', 'Carlos', 'Dave', 'Eve', 'Frank'];
  return {
    smallBlindAmount: 25,
    bigBlindAmount: 50,
    players: players,
    previousGames: [],
    playersCashAmount: Object.assign({}, ...players.map(p => ({ [p]: 1000 }))),
  }
}

(() => {
  const t = getMockTable()
  const g = initGameFromTable(t)

  while (true) {
    console.log('----------------------')
    console.log(g.toString())
    console.log('----------------------')
    console.log(g.currentPlayer)
    console.log(g.currentPlayerActions.map((x, i) => i + 1 + ': ' + JSON.stringify(x)).join('\n'));

    let selectedAction: PlayerAction;
    do {
      const input = prompt('Select: ')
      selectedAction = g.currentPlayerActions[Number(input) - 1];
    } while (!selectedAction)

    if (selectedAction.type === 'raise') {
      let raiseAmount: number;
      do {
        raiseAmount = Number(prompt('Raise amount: '))
      } while (Number.isNaN(raiseAmount) || raiseAmount <= 0)
      selectedAction.addedAmount = raiseAmount;
      selectedAction.totalAmount += raiseAmount;
    }

    console.log('Applying...', selectedAction);
    g.act(selectedAction);
  }

})()
