type ChipAmount = number;
type PlayerId = string;
type GameRoundName = "pre-flop" | "flop" | "turn" | "river";

interface Player {
  id: PlayerId;
  stack: ChipAmount;
}

type PlayerStacks = Record<PlayerId, ChipAmount>;

interface PlayerDecisionFold {
  type: "fold";
}

interface PlayerDecisionCheck {
  type: "check";
}

interface PlayerDecisionCall {
  type: "call";
  addedAmount: ChipAmount;
  totalAmount: ChipAmount;
}

interface PlayerDecisionRaise {
  type: "raise";
  addedAmount: ChipAmount;
  totalAmount: ChipAmount;
}

interface PlayerDecisionAllIn {
  type: "all-in";
  addedAmount: ChipAmount;
  totalAmount: ChipAmount;
}

type PlayerDecision = PlayerDecisionFold | PlayerDecisionCheck | PlayerDecisionCall | PlayerDecisionRaise | PlayerDecisionAllIn;

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

// interface PlayerStatus {
// }

type PlayerStates = "active" | "folded" | "all-in" | "called";

interface Table {
  smallBlindAmount: ChipAmount;
  bigBlindAmount: ChipAmount;
  players: PlayerId[];
  tableStacks: PlayerStacks;
  // currentGame: Game;
  previousGames: Game[];
}

interface Game {
  // sbPlayerId: PlayerId;
  // bbPlayerId: PlayerId;
  buttonPlayer: PlayerId;
  gameStacks: PlayerStacks;
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

function process(table: Table, decision: PlayerDecision): Table {
  return table;
}

function undo(table: Table) {
  return table;
}

function findPlayer(players: PlayerId[], button: PlayerId, type: 'utg' | 'sb' | 'bb') {
  const buttonIndex = players.findIndex((p) => p === button);
  if (buttonIndex === -1)
    throw Error('Button player is not in players: ' + { players, button });
  switch (type) {
    case 'bb':

    case 'sb':

    case 'utg':

    default:
  }
}

function initGameFromTable(t: Table): Game {
  return {
    buttonPlayer: t.players[0], // Todo: get from previous games
    gameStacks: Object.assign({}, t.tableStacks),
    pots: [{ amount: 0, players: Array.from(t.players) }],
    currentRound: 'pre-flop',
    currentBets: {}, // Todo: sb/bb
    settledQueue: [],
    actQueue: Array.from(t.players),
  }
}

function getGameString(g: Game): string {
  let result = "";

  // Pots
  if (g.pots.length === 1)
    result += `Pot: ${g.pots[0].amount}\n`;
  else {
    result += `Pots:\n`;
    for (const p of g.pots)
      result += `- ${p.amount} (${p.players.join(', ')})\n`;
  }

  // Round
  result += `Round: ${g.currentRound}\n`;

  result += `\n`;

  for (const p of g.settledQueue) {
    result += `${p} (${g.gameStacks[p]}): ${g.currentBets[p] ?? 0}\n`;
  }

  result += '> ';

  for (const p of g.actQueue) {
    result += `${p} (${g.gameStacks[p]}): ${g.currentBets[p] ?? 0}\n`;
  }

  return result;
}

function getMockTable(): Table {
  const players = ['Alice', 'Bob', 'Carlos', 'Dave', 'Eve', 'Frank'];
  return {
    smallBlindAmount: 25,
    bigBlindAmount: 50,
    players: players,
    previousGames: [],
    tableStacks: Object.assign({}, ...players.map(p => ({ [p]: 1000 }))),
  }
}

const t = getMockTable()
const g = initGameFromTable(t)
console.log(getGameString(g))

prompt()
