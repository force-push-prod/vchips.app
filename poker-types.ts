type ChipAmount = number;
type PlayerId = string;
type GameRoundName = "pre-flop" | "flop" | "turn" | "river";

interface Player {
  id: PlayerId;
  stack: ChipAmount;
}

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

interface Game {
  smallBlindPlayer: PlayerId;
  bigBlindPlayer: PlayerId;
  pots: Pot[];
  rounds: Round[];
  inGamePlayers: PlayerId[];
  decisions: { player: PlayerId, decision: PlayerDecision }[];
  results: PotResult[];
}

interface Table {
  smallBlindAmount: ChipAmount;
  bigBlindAmount: ChipAmount;
  players: Player[];
  currentGame: Game;
  previousGames: Game[];
}

function process(table: Table, decision: PlayerDecision): Table {
  return table;
}

function undo(table: Table) {
  return table;
}
