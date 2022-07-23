import { Game } from '../poker'

const WIN = 'win' as const;
const LOSE = 'lose' as const;
const SPLIT = 'split' as const;

type WLSOption = typeof WIN | typeof LOSE | typeof SPLIT;

interface PotInfo {
  text: string;
  choiceNeeded: boolean;
  settled: boolean;
  chosenOption?: WLSOption;
  hintedOption?: WLSOption;
  potAmount: number;
}

interface Props {
  isDisconnected: boolean;
  currentGame: Game;
  potInfos: PotInfo[];
  onChooseWLS: (potIndex: number, option: WLSOption) => void;
}

export default function ShowdownDisplay(props: Props) {
  return (
    <div className={`h-full w-full primary-game-display-transition p-5 ${props.isDisconnected && 'container-disconnected'}`}>
      {
        props.potInfos.map((potInfo, potIndex) => (
          <div key={potIndex} className="flex flex-col items-center border-2 py-2">
            <div>{potInfo.text}</div>
            <div className="text-xl">Pot: {potInfo.potAmount}</div>
            {!potInfo.choiceNeeded ? null :
                <div className='flex items-center'>
                  {
                    [WIN, LOSE, SPLIT].map(option => (
                      <Button
                        key={option}
                        type={option}
                        isSelected={option === potInfo.chosenOption}
                        pulsing={option === potInfo.hintedOption}
                        onClick={() => props.onChooseWLS(potIndex, option)}
                      />
                    ))
                  }
                </div>
            }
          </div>
        ))
      }
    </div>
  )
}

function Button(props: {
  onClick: () => void,
  type: WLSOption,
  pulsing: boolean,
  isSelected: boolean,
}) {
  let text = props.type;

  const color = props.type === WIN ? 'bg-green-200' : props.type === 'lose' ? 'bg-red-200' : 'bg-yellow-200';

  return (
    <button
      className={`text-xl font-medium border-2 p-3 mx-1 rounded ${props.isSelected && 'font-bold border-black'} ${color} ${props.pulsing && 'showdown-button-pulse'}`}
      onClick={() => props.onClick()}>
      {text}
    </button>
  )
}
