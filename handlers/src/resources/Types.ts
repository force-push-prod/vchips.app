export type ChipAmount = number;
export type PlayerId = string;
export type GameRoundName = "pre-flop" | "flop" | "turn" | "river";

export interface Player {
  id: PlayerId;
  stack: ChipAmount;
}

export type PlayersCashAmount = Record<PlayerId, ChipAmount>;

export interface PlayerActionFold {
  type: "fold";
}

export interface PlayerActionCheck {
  type: "check";
}

export interface PlayerActionCall {
  type: "call";
  addedAmount: ChipAmount;
  totalAmount: ChipAmount;
}

export interface PlayerActionRaise {
  type: "raise";
  addedAmount: ChipAmount;
  totalAmount: ChipAmount;
}

export type PlayerAction = PlayerActionFold | PlayerActionCheck | PlayerActionCall | PlayerActionRaise;

export interface Pot {
  amount: ChipAmount;
  players: PlayerId[];
}

export interface PotResult extends Pot {
  winners: PlayerId[];
}

export interface Round {
  name: GameRoundName;
  bets: Record<PlayerId, ChipAmount>;
  currentPlayer: PlayerId | null;
  inGamePlayerStates: PlayerStates[];
}


export type PlayerStates = "active" | "folded" | "all-in" | "called";

export interface Table {
  smallBlindAmount: ChipAmount;
  bigBlindAmount: ChipAmount;
  players: Record<PlayerId, string>;
  playersCashAmount: PlayersCashAmount;
  startingCashAmount: ChipAmount;
  // currentGame: Game;
  previousGames: GameInterface[];
}

export interface GameInterface {
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