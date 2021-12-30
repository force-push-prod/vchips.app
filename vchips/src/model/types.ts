
export type ChipAmount = number;
export type PlayerId = string;
export type GameRoundName = "pre-flop" | "flop" | "turn" | "river" | "showdown";

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

export type PlayerStates = "active" | "folded" | "all-in" | "called";

export interface TableInterface {
  smallBlindAmount: ChipAmount;
  bigBlindAmount: ChipAmount;
  players: PlayerId[];
  playersCashAmount: PlayersCashAmount;
  previousGames: GameInterface[];
}

export interface GameInterface {
  allPlayers: PlayerId[];
  buttonPlayer: PlayerId;
  gameStacks: PlayersCashAmount;
  pots: Pot[];
  currentRound: GameRoundName;
  currentBets: Record<PlayerId, ChipAmount>;
  settledQueue: PlayerId[];
  actQueue: PlayerId[];
  winners: PlayerId[][];
}

export interface ResultOption {
  potName: string;
  potAmount: ChipAmount;
  involvedPlayers: PlayerId[];
  winners: PlayerId[];
}

