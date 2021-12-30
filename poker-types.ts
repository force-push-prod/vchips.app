// type ChipAmount = number;
// type PlayerId = string;
// type GameRoundName = "pre-flop" | "flop" | "turn" | "river" | "showdown";

// interface Player {
//   id: PlayerId;
//   stack: ChipAmount;
// }

// type PlayersCashAmount = Record<PlayerId, ChipAmount>;

// interface PlayerActionFold {
//   type: "fold";
// }

// interface PlayerActionCheck {
//   type: "check";
// }

// interface PlayerActionCall {
//   type: "call";
//   addedAmount: ChipAmount;
//   totalAmount: ChipAmount;
// }

// interface PlayerActionRaise {
//   type: "raise";
//   addedAmount: ChipAmount;
//   totalAmount: ChipAmount;
// }

// type PlayerAction = PlayerActionFold | PlayerActionCheck | PlayerActionCall | PlayerActionRaise;

// interface Pot {
//   amount: ChipAmount;
//   players: PlayerId[];
// }

// type PlayerStates = "active" | "folded" | "all-in" | "called";

// interface TableInterface {
//   smallBlindAmount: ChipAmount;
//   bigBlindAmount: ChipAmount;
//   players: PlayerId[];
//   playersCashAmount: PlayersCashAmount;
//   previousGames: GameInterface[];
// }

// interface GameInterface {
//   allPlayers: PlayerId[];
//   buttonPlayer: PlayerId;
//   gameStacks: PlayersCashAmount;
//   pots: Pot[];
//   currentRound: GameRoundName;
//   currentBets: Record<PlayerId, ChipAmount>;
//   settledQueue: PlayerId[];
//   actQueue: PlayerId[];
//   winners: PlayerId[][];
// }

// interface ResultOption {
//   potName: string;
//   potAmount: ChipAmount;
//   involvedPlayers: PlayerId[];
//   winners: PlayerId[];
// }

// function findPlayer(players: PlayerId[], button: PlayerId, type: 'utg' | 'sb' | 'bb'): PlayerId {
//   const buttonIndex = players.indexOf(button);

//   if (buttonIndex === -1)
//     throw Error('Button player is not in players: ' + { players, button });

//   let i = 0;

//   switch (type) {
//     case 'sb':
//       i = buttonIndex - 1;
//       break;

//     case 'bb':
//       i = buttonIndex - 2;
//       break;

//     case 'utg':
//       i = buttonIndex - 3;
//       break;

//     default:
//       throw Error('Unexpected type: ' + type);
//   }
//   if (i < 0) i = players.length + i;

//   if (players[i] === undefined)
//     throw Error('Internal Error: Unexpected undefined');

//   return players[i];
// }

// function generateQueueForRound(allPlayers: PlayerId[], inGamePlayers: PlayerId[], buttonPlayer: PlayerId, order: 'pre-flop' | 'post-pre-flop') {
//   // Here is how the algorithm is implemented in the way that minimizes cognitive overload:
//   // Given
//   //     allPlayers  [  1  2  3  4  5  6  7  8  ]
//   // inGamePlayers   [     2        5  6     8  ]

//   // First: generate allPlayers * 3 (to account for all cases where overflow is possible), so
//   //         result  [  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  ]

//   // Find the player we want to start with.
//   //         result  [                 6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  ]

//   // Filter so that we only include players that are in inGamePlayers
//   //         result  [                 6     8     2        5  6     8     2        5  6     8  ]

//   // Take the first x elements, where x = inGamePlayers.length
//   //         result                 [  6     8     2        5  ]  --  Done!

//   let result = [...allPlayers, ...allPlayers, ...allPlayers];
//   const buttonPlayerPosition = allPlayers.indexOf(buttonPlayer);
//   if (buttonPlayerPosition === -1) throw new Error('Button player is not found in player list');

//   let targetPlayerIndex: number;
//   if (order === 'pre-flop')
//     targetPlayerIndex = buttonPlayerPosition + 3;
//   else if (order === 'post-pre-flop')
//     targetPlayerIndex = buttonPlayerPosition + 2;
//   else
//     throw new Error('Unexpected order: ' + order);

//   result.splice(0, targetPlayerIndex);
//   result = result.filter(p => inGamePlayers.includes(p));
//   result.splice(0, inGamePlayers.length);
//   return result;
// }


// class Table implements TableInterface {
//   smallBlindAmount!: number;
//   bigBlindAmount!: number;
//   buttonPlayer!: PlayerId;
//   players: string[];
//   playersCashAmount: PlayersCashAmount;
//   previousGames: GameInterface[];

//   fromJSON(s: string) { Object.assign(this, JSON.parse(s)); };
//   toJSON() { return this; }

//   constructor(obj: TableInterface) {
//     Object.assign(this, obj);
//   }

//   initializeNewGame() {
//     const sb = findPlayer(this.players, this.buttonPlayer, 'sb');
//     const bb = findPlayer(this.players, this.buttonPlayer, 'bb');
//     const gameStacks = Object.assign({}, this.playersCashAmount);
//     // TODO: Check if they have that amount of chips
//     gameStacks[sb] -= this.smallBlindAmount;
//     gameStacks[bb] -= this.bigBlindAmount;

//     return new Game({
//       allPlayers: this.players,
//       buttonPlayer: this.buttonPlayer,
//       gameStacks,
//       pots: [{ amount: 0, players: Array.from(this.players) }],
//       currentRound: 'pre-flop',
//       currentBets: { [sb]: this.smallBlindAmount, [bb]: this.bigBlindAmount },
//       settledQueue: [],
//       actQueue: generateQueueForRound(this.players, this.players, this.buttonPlayer, 'pre-flop'),
//       winners: [],
//     });
//   }

//   addPreviousGame(game: Game) {
//     if (!game.isAllFinished) throw new Error('Game must be finished before being added to previous game');
//     this.previousGames.push(game);
//     this.buttonPlayer = this.players[this.players.indexOf(game.buttonPlayer) + 1] ?? this.players[0];
//   }
// }

// class Game implements GameInterface {
//   allPlayers!: PlayerId[];
//   buttonPlayer!: PlayerId;
//   gameStacks!: PlayersCashAmount;
//   pots!: Pot[];
//   currentRound!: GameRoundName;
//   currentBets!: Record<PlayerId, ChipAmount>;
//   settledQueue!: PlayerId[];
//   actQueue!: PlayerId[];
//   winners!: PlayerId[][];

//   fromJSON(s: string) { Object.assign(this, JSON.parse(s)); };
//   toJSON() { return this; }

//   constructor(obj: GameInterface) {
//     Object.assign(this, obj);
//   }

//   get isAllFinished(): Boolean {
//     return this.currentRound === 'showdown' && this.winners.length === this.pots.length;
//   }

//   get currentPlayer(): PlayerId {
//     return this.actQueue[0];
//   }

//   get currentPlayerActions(): PlayerAction[] {
//     const playerToAct = this.currentPlayer;
//     const maxBetSoFar = Math.max(...Object.values(this.currentBets), 0);
//     const playerBet = this.currentBets[playerToAct] ?? 0;
//     const diff = maxBetSoFar - playerBet;
//     const result: PlayerAction[] = [{ type: "fold" }];

//     if (diff === 0) {
//       result.push({ type: "raise", addedAmount: 0, totalAmount: playerBet });
//       result.push({ type: "check" });
//     } else {
//       result.push({ type: "raise", addedAmount: diff, totalAmount: maxBetSoFar }); // TODO: Re-raise
//       result.push({ type: "call", addedAmount: diff, totalAmount: maxBetSoFar });
//     }

//     return result;
//   }

//   get resultOptions(): ResultOption {
//     if (!this.isAllFinished) throw new Error('Expected state');
//     if (this.pots.length === 1) {
//       return {
//         potName: 'Pot',
//         potAmount: this.pots[0].amount,
//         involvedPlayers: this.pots[0].players,
//         winners: [],
//       };
//     }

//     return {
//       potName: this.winners.length === 0 ? 'Main Pot' : `Pot #${this.winners.length}`,
//       potAmount: this.pots[0].amount,
//       involvedPlayers: this.pots[0].players,
//       winners: [],
//     };
//   }

//   setResult(result: ResultOption) {
//     if (!this.isAllFinished) throw new Error('Expected state');
//     // TODO
//   }

//   act(action: PlayerAction) {
//     if (this.actQueue.length === 0) throw new Error('Never');
//     if (this.currentRound === 'showdown') throw new Error('Never');

//     if (action.type === 'fold') {
//       this.actQueue.shift();
//     } else if (action.type === 'check') {
//       this.settledQueue.push(this.actQueue.shift()!);
//     } else if (action.type === 'call') {
//       // TODO: Check if they have that amount of chips
//       this.gameStacks[this.currentPlayer] -= action.addedAmount;
//       this.currentBets[this.currentPlayer] ??= 0;
//       this.currentBets[this.currentPlayer] += action.addedAmount;
//       if (this.currentBets[this.currentPlayer] !== action.totalAmount) throw Error('...');
//       this.settledQueue.push(this.actQueue.shift()!);
//     } else if (action.type === 'raise') {
//       // TODO: Check if they have that amount of chips
//       this.gameStacks[this.currentPlayer] -= action.addedAmount;
//       this.currentBets[this.currentPlayer] ??= 0;
//       this.currentBets[this.currentPlayer] += action.addedAmount;
//       if (this.currentBets[this.currentPlayer] !== action.totalAmount) throw Error('...');
//       this.actQueue.push(...this.settledQueue);
//       this.settledQueue = [];
//       this.settledQueue.push(this.actQueue.shift()!);
//     } else {
//       throw Error('Never');
//     }

//     if (this.actQueue.length === 0) {
//       this.actQueue = generateQueueForRound(this.allPlayers, this.settledQueue, this.buttonPlayer, 'post-pre-flop');
//       this.settledQueue = [];
//       // TODO: Handle side pots
//       const potSum = Object.values(this.currentBets).reduce((x, p) => x + p, 0);
//       this.pots[0].amount += potSum;
//       this.currentBets = {};

//       if (this.currentRound === 'pre-flop' || this.currentRound === 'flop' || this.currentRound === 'turn') {
//         this.currentRound = this.currentRound === 'pre-flop' ? 'flop' :
//           this.currentRound === 'flop' ? 'turn' : 'river';

//       } else if (this.currentRound === 'river') {
//         this.currentRound = 'showdown';
//       } else {
//         throw Error('Never');
//       }
//     }

//     const playerCountWithPositiveStack = Object.values(this.gameStacks).filter(stack => stack > 0).length;
//     if (playerCountWithPositiveStack <= 1)
//       this.currentRound = 'showdown';
//   }

//   toString(): string {
//     let result = "";
//     // Pots
//     if (this.pots.length === 1)
//       result += `Pot: ${this.pots[0].amount}\n`;
//     else {
//       result += `Pots:\n`;
//       for (const p of this.pots)
//         result += `- ${p.amount} (${p.players.join(', ')})\n`;
//     }

//     // Round
//     result += `Round: ${this.currentRound}\n`;
//     result += `\n`;

//     // Players
//     for (const p of this.settledQueue) result += `${p} (${this.gameStacks[p]}): ${this.currentBets[p] ?? 0}\n`;
//     result += '> ';
//     for (const p of this.actQueue) result += `${p} (${this.gameStacks[p]}): ${this.currentBets[p] ?? 0}\n`;

//     return result;
//   }
// }

// function getMockTable(): Table {
//   const players = ['Alice', 'Bob', 'Carlos', 'Dave', 'Eve', 'Frank'];
//   return new Table({
//     smallBlindAmount: 25,
//     bigBlindAmount: 50,
//     players: players,
//     previousGames: [],
//     playersCashAmount: Object.assign({}, ...players.map(p => ({ [p]: 1000 }))),
//   });
// }

// (() => {
//   const t = getMockTable()
//   const g = t.initializeNewGame()

//   while (true) {
//     console.log('----------------------')
//     console.log(g.toString())
//     console.log('----------------------')
//     console.log(g.currentPlayer)
//     console.log(g.currentPlayerActions.map((x, i) => i + 1 + ': ' + JSON.stringify(x)).join('\n'));

//     let selectedAction: PlayerAction;
//     do {
//       const input = prompt('Select: ')
//       selectedAction = g.currentPlayerActions[Number(input) - 1];
//     } while (!selectedAction)

//     if (selectedAction.type === 'raise') {
//       let raiseAmount: number;
//       do {
//         raiseAmount = Number(prompt('Raise amount: '))
//       } while (Number.isNaN(raiseAmount) || raiseAmount <= 0)
//       selectedAction.addedAmount = raiseAmount;
//       selectedAction.totalAmount += raiseAmount;
//     }

//     console.log('Applying...', selectedAction);
//     g.act(selectedAction);
//   }

// })()
