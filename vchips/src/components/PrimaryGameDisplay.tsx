import React from 'react'
import type { PlayerAction } from '../poker'


// const elem = ['container-rainbow', 'container-folded', 'container-checked', 'container-raised', 'container-called', 'container-default', 'container-disconnected', 'container-my-turn']

type ClientState = 'folded' | 'checked' | 'raised' | 'called' | 'default';

interface Props {
  isDisconnected: Boolean;
  isMyTurn: Boolean;
  state: ClientState;
  potSizes: number[];
  myStack: number;
  betted: number;
  actions: PlayerAction[];
  disconnect: () => void;
  act: (action: PlayerAction) => void;
}

export default function PrimaryGameDisplay(props: Props) {
  const [raiseInput, setRaiseInput] = React.useState(String((props.actions.filter(a => a.type === 'raise')[0] as any)?.addedAmount ?? 1));

  return (
    <div className={`h-full w-full primary-game-display container-${props.state} ${props.isDisconnected && 'container-disconnected'} ${props.isMyTurn && 'container-my-turn'}`}>
      {/* <div className="whitespace-pre">{JSON.stringify(props, null, 4)}</div> */}
      <button className="text-xl font-medium border rounded" onClick={() => props.disconnect()}>Disconnect</button>
      <div className="text-xl">Pot: {props.potSizes.toString()}</div>
      <div className="text-xl">My Stack: {props.myStack}</div>
      <div className="text-xl">Betted this round: {props.betted}</div>
      <div className="flex flex-col items-center">
        {
          props.actions.map(action =>
            <div
              className="cursor-pointer m-3 rounded border text-3xl shadow"
              key={action.type}
              onClick={() => action.type !== 'raise' && props.act(action)}
            >
              {action.type === 'fold' ? <>Fold</> :
                action.type === 'call' ? <>Call {action.addedAmount}</> :
                  action.type === 'check' ? <>Check</> :
                    action.type === 'raise' ?
                      <div className="flex gap-3">
                        <span onClick={(e) => {
                          props.act({
                            type: 'raise',
                            addedAmount: Number(raiseInput),
                            totalAmount: Number(raiseInput) + action.totalAmount - action.addedAmount
                          });
                        }}>Raise</span>
                        <input type="number" value={raiseInput} min={action.addedAmount} onChange={(e) => setRaiseInput(e.target.value)} />
                      </div>
                      :
                      <>Error</>
              }
            </div>
          )
        }
      </div>
    </div>
  )
}

// function SVG({ type }: { type: 'check' | 'raise' | 'folded' }) {
//   switch (type) {
//     case '':
//       return (
//         <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//           <path stroke-width="10" id="svg_6" d="m15.84159,53.96038l23.76237,29.20794l41.58417,-64.35644" opacity="NaN" stroke="#000000" fill="#fff0" />
//         </svg>
//       )
//   }
// }
