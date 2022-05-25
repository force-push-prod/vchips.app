import React from 'react';
import { Game, PlayerId } from '../poker'

const WIN = 'win' as const;
const LOSE = 'lose' as const;
const SPLIT = 'split' as const;

type WLSOption = typeof WIN | typeof LOSE | typeof SPLIT;

interface PotInfo {
  currentStateText: string;
  // You have folded
  // Side pot: Not involved
  // Waiting for xxx to select
  // Waiting for xxx to confirm
  // Please select showdown result
  // There is a conflict: please re-select result
  potIndex: number;
  potAmount: number;
  actionNeeded: boolean;
  selectedOption?: WLSOption;
  hintedOption?: WLSOption;
}

interface Props {
  isDisconnected: boolean;
  currentGame: Game;
  // potInfos: PotInfo[];

  // netGain: number;
  // myStackNew: number;
}

/*
Action Needed - Yes
- possible options: win, lose, split
- selected options: win, lose, split
- hinted options (only possible correct options)

- for win:
  - 1 or more lose

- for lose:
  - 1 win, no split

- for split:
  -

Action Needed - No
- state: win, lose
*/


function derivePossibleOptions(others: WLSOption[]) {
  let winPossible = false, losePossible = false, splitPossible = false;

  if ((true) && !(WIN in others) && !(SPLIT in others)) winPossible = true;
  if ((true) && (true) && !(SPLIT in others)) losePossible = true;
  if (!(LOSE in others) && !(WIN in others) && (true)) splitPossible = true;
}


function derivePotInfosFromGame(g: Game, forPlayer: string): PotInfo[] {
  const potInfos: PotInfo[] = [];
  const players = g.allPlayers;
  if (g.actQueue.length !== 0) throw new Error('Unexpected actQueue length');
  const foldedPlayers = players.filter(p => !g.settledQueue.includes(p));

  g.pots.forEach((pot, potIndex) => {
    let currentStateText = 'init', actionNeeded = false, selectedOption, hintedOption;

    if (foldedPlayers.includes(forPlayer)) {
      currentStateText = 'You have folded';
      actionNeeded = false;
      selectedOption = undefined;
      hintedOption = undefined;
    } else if (!pot.players.includes(forPlayer)) {
      currentStateText = 'You are not involved in this pot';
      actionNeeded = false;
      selectedOption = undefined;
      hintedOption = undefined;
    } else if (pot.players.length === 1 && pot.players[0] === forPlayer) {
      currentStateText = 'You won: you are the only player in this pot';
      actionNeeded = false;
      selectedOption = undefined;
      hintedOption = undefined;
    }

    potInfos.push({
      potIndex,
      potAmount: pot.amount,
      currentStateText,
      actionNeeded,
      selectedOption,
      hintedOption,
    });
  });

  return potInfos;
}

export default function ShowdownDisplay(props: Props) {
  return (
    <div className={`h-full w-full primary-game-display-transition p-5 ${props.isDisconnected && 'container-disconnected'} ${props.actionNeeded && 'container-my-turn'}`}>
      <div className="flex flex-col items-center">
        <div className="text-xl">Pot: { }</div>
        <Button onClick={() => { }} type='win' opponentName={null} pulsing={false} />
        <Button onClick={() => { }} type='lose' opponentName={null} pulsing={false} />
        <Button onClick={() => { }} type='split' opponentName={null} pulsing={true} />
      </div>
    </div>
  )
}

function Button(props: {
  onClick: () => void,
  type: WLSOption,
  opponentName: string | null,
  pulsing: boolean,
}) {
  let text;
  if (props.opponentName === null) {
    text =
      props.type === WIN ? 'I Win' :
        props.type === 'lose' ? 'I Lose' :
          'Split';
  } else {
    text =
      props.type === WIN ? `I win, ${props.opponentName} loses` :
        props.type === 'lose' ? `I lose, ${props.opponentName} wins` :
          `Split with ${props.opponentName}`;
  }

  const color = props.type === WIN ? 'bg-green-200' : props.type === 'lose' ? 'bg-red-200' : 'bg-yellow-200';

  return (
    <button
      className={`text-xl font-medium border rounded ${color} ${props.pulsing && 'showdown-button-pulse'}`}
      onClick={() => props.onClick()}>
      {text}
    </button>
  )
}
