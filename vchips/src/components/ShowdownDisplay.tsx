import React from 'react';

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
  selectedOption?: 'win' | 'lose' | 'split';
  hintedOption?: 'win' | 'lose' | 'split';
}

interface Props {
  isDisconnected: boolean;
  potsInfo: PotInfo[];

  // netGain: number;
  // myStackNew: number;
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
  type: 'win' | 'lose' | 'split',
  opponentName: string | null,
  pulsing: boolean,
}) {
  let text;
  if (props.opponentName === null) {
    text =
      props.type === 'win' ? 'I Win' :
        props.type === 'lose' ? 'I Lose' :
          'Split';
  } else {
    text =
      props.type === 'win' ? `I win, ${props.opponentName} loses` :
        props.type === 'lose' ? `I lose, ${props.opponentName} wins` :
          `Split with ${props.opponentName}`;
  }

  const color = props.type === 'win' ? 'bg-green-200' : props.type === 'lose' ? 'bg-red-200' : 'bg-yellow-200';

  return (
    <button
      className={`text-xl font-medium border rounded ${color} ${props.pulsing && 'showdown-button-pulse'}`}
      onClick={() => props.onClick()}>
      {text}
    </button>
  )
}
