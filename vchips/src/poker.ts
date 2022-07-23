type ChipAmount = number;
type PlayerId = string;
export type GameRoundName = "pre-flop" | "flop" | "turn" | "river" | "showdown";

type PlayerChipMap = Record<PlayerId, ChipAmount>;

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

export interface PlayerActionRaise {
  type: "raise";
  addedAmount: ChipAmount;
  totalAmount: ChipAmount;
}

export type PlayerAction = PlayerActionFold | PlayerActionCheck | PlayerActionCall | PlayerActionRaise;

interface Pot {
  amount: ChipAmount;
  players: PlayerId[];
}

interface TableInterface {
  smallBlindAmount: ChipAmount;
  bigBlindAmount: ChipAmount;
  players: PlayerId[];
  tableStacks: PlayerChipMap;
  previousGames: GameInterface[];
  currentGame: Game | null;
}

interface GameInterface {
  allPlayers: PlayerId[];
  buttonPlayer: PlayerId;
  gameStacks: PlayerChipMap;
  pots: Pot[];
  currentRound: GameRoundName;
  currentBets: PlayerChipMap;
  settledQueue: PlayerId[];
  actQueue: PlayerId[];
  potResults: Record<PlayerId, WLSOption>[];
  minimumBet: ChipAmount;
}

interface ResultSummary {
  winnerChipMap: PlayerChipMap;
}

export const WIN = 'win' as const;
export const LOSE = 'lose' as const;
export const SPLIT = 'split' as const;

export type WLSOption = typeof WIN | typeof LOSE | typeof SPLIT;

export function isConsistent(choices: WLSOption[], completed: boolean) {
  const winCount = choices.filter(c => c === 'win').length;
  const splitCount = choices.filter(c => c === 'split').length;
  const loseCount = choices.filter(c => c === 'lose').length;

  if (splitCount > 0)
    if (winCount > 0) return false;

  if (winCount > 1) return false;

  if (completed) {
    if (winCount + splitCount + loseCount <= 1) return false;
    if (splitCount === 1) return false;
    if (splitCount > 1 && winCount > 0) return false;
    if (splitCount === 0 && winCount !== 1) return false;
  }

  return true;
}

export function deriveHintedOption(others: WLSOption[], isLastOneToAct: boolean): WLSOption | undefined {
  const possibleOptions: WLSOption[] = [];
  if (isConsistent([...others, WIN], isLastOneToAct)) possibleOptions.push(WIN);
  if (isConsistent([...others, LOSE], isLastOneToAct)) possibleOptions.push(LOSE);
  if (isConsistent([...others, SPLIT], isLastOneToAct)) possibleOptions.push(SPLIT);

  if (possibleOptions.length === 1)
    return possibleOptions[0];
  else
    return undefined;
}



export function findPlayer(players: PlayerId[], button: PlayerId, type: 'utg' | 'sb' | 'bb'): PlayerId {
  const buttonIndex = players.indexOf(button);

  if (buttonIndex === -1)
    throw Error('Button player is not in players: ' + { players, button });

  let i = 0;

  switch (type) {
    case 'sb':
      i = buttonIndex + 1;
      break;

    case 'bb':
      i = buttonIndex + 2;
      break;

    case 'utg':
      i = buttonIndex + 3;
      break;

    default:
      throw Error('Unexpected type: ' + type);
  }
  if (i >= players.length) i -= players.length;

  if (players[i] === undefined)
    throw Error('Internal Error: Unexpected undefined');

  return players[i];
}

function generateQueueForRound(allPlayers: PlayerId[], inGamePlayers: PlayerId[], buttonPlayer: PlayerId, order: 'pre-flop' | 'post-pre-flop') {
  // Here is how the algorithm is implemented in the way that minimizes cognitive overload:
  // Given
  //     allPlayers  [  1  2  3  4  5  6  7  8  ]
  // inGamePlayers   [     2        5  6     8  ]

  // First: generate allPlayers * 3 (to account for all cases where overflow is possible), so
  //         result  [  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  ]

  // Find the player we want to start with.
  //         result  [                 6  7  8  1  2  3  4  5  6  7  8  1  2  3  4  5  6  7  8  ]

  // Filter so that we only include players that are in inGamePlayers
  //         result  [                 6     8     2        5  6     8     2        5  6     8  ]

  // Take the first x elements, where x = inGamePlayers.length
  //         result                 [  6     8     2        5  ]  --  Done!

  let result = [...allPlayers, ...allPlayers, ...allPlayers];
  const buttonPlayerPosition = allPlayers.indexOf(buttonPlayer);
  if (buttonPlayerPosition === -1) throw new Error('Button player is not found in player list');

  let targetPlayerIndex: number;
  if (order === 'pre-flop')
    targetPlayerIndex = buttonPlayerPosition + 3;
  else if (order === 'post-pre-flop')
    targetPlayerIndex = buttonPlayerPosition + 1;
  else
    throw new Error('Unexpected order: ' + order);

  result.splice(0, targetPlayerIndex);
  result = result.filter(p => inGamePlayers.includes(p));
  return result.slice(0, inGamePlayers.length);
}


export class Table implements TableInterface {
  smallBlindAmount!: number;
  bigBlindAmount!: number;
  buttonPlayer?: PlayerId;
  players!: string[];
  tableStacks!: PlayerChipMap;
  previousGames!: GameInterface[];
  currentGame: Game | null = null;

  fromJSON(s: string) {
    Object.assign(this, JSON.parse(s));
    if (this.currentGame)
      this.currentGame = new Game(this.currentGame);
  };
  toJSON() { return this; }

  constructor(obj: TableInterface) {
    Object.assign(this, obj);
    if (this.currentGame)
      this.currentGame = new Game(this.currentGame);
  }

  initializeNewGame() {
    if (this.players.length <= 1)
      throw new Error('Cannot start game with 1 or less people');
    this.buttonPlayer ??= this.players[0];

    const sb = findPlayer(this.players, this.buttonPlayer, 'sb');
    const bb = findPlayer(this.players, this.buttonPlayer, 'bb');
    const gameStacks = Object.assign({}, this.tableStacks);
    // TODO: Check if they have that amount of chips
    gameStacks[sb] -= this.smallBlindAmount;
    gameStacks[bb] -= this.bigBlindAmount;

    return new Game({
      allPlayers: this.players,
      buttonPlayer: this.buttonPlayer,
      gameStacks,
      pots: [{ amount: 0, players: Array.from(this.players) }],
      currentRound: 'pre-flop',
      currentBets: { [sb]: this.smallBlindAmount, [bb]: this.bigBlindAmount },
      settledQueue: [],
      actQueue: generateQueueForRound(this.players, this.players, this.buttonPlayer, 'pre-flop'),
      potResults: [],
      minimumBet: this.smallBlindAmount,
    });
  }

  addPreviousGame(game: Game) {
    this.previousGames.push(game);
    const { winnerChipMap } = game.getResultSummary();

    this.tableStacks = mergePlayerChipMap(game.gameStacks, winnerChipMap);

    this.buttonPlayer = this.players[this.players.indexOf(game.buttonPlayer) + 1] ?? this.players[0];

    function mergePlayerChipMap(a: PlayerChipMap, b: PlayerChipMap): PlayerChipMap {
      const c = Object.assign({}, a);
      for (const key in b) c[key] += b[key];
      return c;
    }
  }
}

export class Game implements GameInterface {
  allPlayers!: PlayerId[];
  buttonPlayer!: PlayerId;
  gameStacks!: PlayerChipMap;
  pots!: Pot[];
  currentRound!: GameRoundName;
  currentBets!: PlayerChipMap;
  settledQueue!: PlayerId[];
  actQueue!: PlayerId[];
  potResults!: Record<PlayerId, WLSOption>[];
  minimumBet!: ChipAmount;

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
      result.push({ type: "raise", addedAmount: this.minimumBet, totalAmount: playerBet + this.minimumBet });
      result.push({ type: "check" });
    } else {
      result.push({ type: "raise", addedAmount: diff + this.minimumBet, totalAmount: maxBetSoFar + this.minimumBet }); // TODO: Re-raise
      result.push({ type: "call", addedAmount: diff, totalAmount: maxBetSoFar });
    }
    console.log(`Player ${playerToAct} has actions: ${result.map(a => a.type).join(', ')}`);
    return result;
  }

  getPotResultsForPlayer(playerId: PlayerId) {
    if (this.currentRound !== 'showdown') throw new Error('Cannot get pot results showdown');

    const foldedPlayers = this.allPlayers.filter(p => ![...this.actQueue, ...this.settledQueue].includes(p));

    return this.potResults.map((potResult, index) => {
      let text = '', choiceNeeded = false;
      if (foldedPlayers.includes(playerId)) {
        text = 'You folded';
      } else if (!this.pots[index].players.includes(playerId)) {
        text = 'Not involved';
      } else if (this.pots[index].players.length === 1) {
        if (this.pots[index].players[0] !== playerId) {
          throw new Error('Should be handled in previous case');
        }
        text = 'You won the pot';
      } else {
        choiceNeeded = true;
      }

      if (!choiceNeeded)
        return {
          text,
          choiceNeeded,
          settled: this.isPotSettled(index),
          potAmount: this.pots[index].amount,
        };

      const chosenOption = potResult[playerId];
      const involvedPlayers = this.pots[index].players;
      const allChoices = Object.values(potResult);
      const everyonePicked = allChoices.length === involvedPlayers.length;
      const settled = everyonePicked && isConsistent(allChoices, true);

      text = '';
      if (!chosenOption)
        text = 'Please select an option';
      else if (!everyonePicked)
        text = 'Waiting for everyone involved to make a choice';
      else if (!settled)
        text = 'Please re-select pot result';


      let hintedOption;
      if (chosenOption) {
        if (!settled && everyonePicked)
          hintedOption = deriveHintedOption(allChoices, true);
      } else {
        hintedOption = deriveHintedOption(allChoices, involvedPlayers.length - allChoices.length === 1);
      }
      return {
        text,
        choiceNeeded,
        settled,
        chosenOption,
        hintedOption,
        potAmount: this.pots[index].amount,
      }
    });
  }

  setPlayerResult(playerId: PlayerId, potIndex: number, wlsOption: WLSOption) {
    if (this.currentRound !== 'showdown') throw new Error('Cannot set player result during showdown');
    this.potResults[potIndex][playerId] = wlsOption;
  }

  isPotSettled(index: number) {
    const involvedPlayers = this.pots[index].players;
    const allChoices = Object.values(this.potResults[index]);
    const everyonePicked = allChoices.length === involvedPlayers.length;
    const settled = everyonePicked && isConsistent(allChoices, true);
    return settled;
  }

  isAllPotsSettled() {
    for (let i = 0; i < this.pots.length; i++) {
      if (!this.isPotSettled(i))
        return false;
    }
    return true;
  }

  getResultSummary(): ResultSummary {
    const winnerChipMap: PlayerChipMap = {};

    this.potResults.forEach((potResult, index) => {
      const winners = Object.entries(potResult).flatMap(([playerId, wls]) => wls !== LOSE ? playerId : []);
      const originalPot = this.pots[index];
      if (winners.length === 0) throw new Error('There must be winners');
      const winningAmount = originalPot.amount / winners.length;
      for (const winner of winners) {
        winnerChipMap[winner] ??= 0;
        winnerChipMap[winner] += winningAmount;
      }
    });

    return { winnerChipMap };
  }

  act(action: PlayerAction) {
    if (this.currentRound === 'showdown') throw new Error('Cannot act during showdown');
    if (this.actQueue.length === 0) throw new Error('Never');

    if (action.type === 'fold') {
      // Remove this player from all pots
      this.pots.forEach(pot => {
        pot.players = pot.players.filter(p => p !== this.currentPlayer)
      })
      this.actQueue.shift();

    } else if (action.type === 'check') {
      this.settledQueue.push(this.actQueue.shift()!);

    } else if (action.type === 'call') {
      this.gameStacks[this.currentPlayer] -= action.addedAmount;
      if (this.gameStacks[this.currentPlayer] < 0)
        throw new Error('Added amount was too large');
      this.currentBets[this.currentPlayer] ??= 0;
      this.currentBets[this.currentPlayer] += action.addedAmount;
      if (this.currentBets[this.currentPlayer] !== action.totalAmount) throw Error('...');
      this.settledQueue.push(this.actQueue.shift()!);

    } else if (action.type === 'raise') {
      this.gameStacks[this.currentPlayer] -= action.addedAmount;
      if (this.gameStacks[this.currentPlayer] < 0)
        throw new Error('Added amount was too large');
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
      this.actQueue = generateQueueForRound(this.allPlayers, this.settledQueue, this.buttonPlayer, 'post-pre-flop');
      this.settledQueue = [];
      // TODO: Handle side pots
      const potSum = Object.values(this.currentBets).reduce((x, p) => x + p, 0);
      this.pots[0].amount += potSum;
      this.currentBets = {};

      const gameStages: GameRoundName[] = ["pre-flop", "flop", "turn", "river", "showdown"];
      this.currentRound = gameStages[gameStages.indexOf(this.currentRound) + 1];
      if (this.currentRound === undefined || this.currentRound === 'pre-flop') throw new Error('Unexpected this.currentRound');
    }

    const inGamePlayers = [...this.actQueue, ...this.settledQueue];
    const inGamePlayerCountWithPositiveStack = Object.entries(this.gameStacks).filter(([player, stack]) => inGamePlayers.includes(player) && stack > 0).length;
    if (inGamePlayerCountWithPositiveStack === 1) {
      const potSum = Object.values(this.currentBets).reduce((x, p) => x + p, 0);
      this.pots[0].amount += potSum;
      this.currentBets = {};

      this.currentRound = 'showdown';
    }
    if (inGamePlayerCountWithPositiveStack < 1) throw new Error('Never');

    if (this.currentRound === 'showdown') {
      this.potResults = this.pots.map(() => ({}));
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

// function getMockTable(): Table {
//   const players = ['Alice', 'Bob', 'Carlos', 'Dave', 'Eve', 'Frank'];
//   return new Table({
//     smallBlindAmount: 25,
//     bigBlindAmount: 50,
//     players: players,
//     previousGames: [],
//     tableStacks: Object.assign({}, ...players.map(p => ({ [p]: 1000 }))),
//     currentGame: null,
//   });
// }

function getEmptyTable(): Table {
  return new Table({
    smallBlindAmount: 5,
    bigBlindAmount: 10,
    players: [],
    previousGames: [],
    tableStacks: {},
    currentGame: null,
  });
}

interface PokerHandlers {
  onUpdate: (newTable: Table) => void;
  onDisconnect: () => void;
  onConnect: (table: Table) => void;
}

export class PokerServer {
  private players: Record<PlayerId, PokerHandlers> = {};
  private table: Table = getEmptyTable();

  get connectedPlayers() {
    return Object.keys(this.players);
  }

  connect(playerId: string, handlers: PokerHandlers) {
    this.players[playerId] = handlers;
    handlers.onConnect(new Table(JSON.parse(JSON.stringify(this.table))));
  }

  disconnect(playerId: string) {
    if (playerId in this.players) {
      this.players[playerId].onDisconnect();
    }

    this.updateTable({ ...this.table, players: this.table.players.filter(p => p !== playerId) } as Table);
    delete this.players[playerId];
  }

  updateTable(newTable: Table) {
    this.table = new Table(JSON.parse(JSON.stringify(newTable)));
    for (const handlers of Object.values(this.players)) {
      handlers.onUpdate(new Table(JSON.parse(JSON.stringify(newTable))));
    }
  }
}

export class PokerWebSocketGateway{
  private table: Table = getEmptyTable();
  private connection: WebSocket = new WebSocket('wss://ws.vchips.app');
  private isLoggedIn: boolean = false;
  currentTableId = "";
  currentUserId = "";

  login(userId: string, tableId: string){
    this.currentTableId = tableId;
    this.currentUserId = userId;
    this.connection.send(JSON.stringify({
        "action": "login",
        "userId": userId,
        "tableId": tableId
    }));
  }

  async createTable(smallBlindAmount: ChipAmount, bigBlindAmount: ChipAmount ){
    this.table.smallBlindAmount = smallBlindAmount;
    this.table.bigBlindAmount = bigBlindAmount;
    let response = await fetch('https://vchips.app/tables/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            table: this.table,
        })
    });
    this.currentTableId = await response.text()
    return this.currentTableId;
  }

  registerCallbacks(handler: PokerHandlers){
    this.connection.onopen = () => {
      handler.onConnect(new Table(JSON.parse(JSON.stringify(this.table))));
    }
    this.connection.onmessage = (event) => {
      const newTable: Table = JSON.parse(event.data);
      console.log("New Table: " + newTable);
      if (!this.isLoggedIn){
        this.isLoggedIn = true;
        newTable.players.push(this.currentUserId);
        this.table = newTable;
        handler.onUpdate(new Table(JSON.parse(JSON.stringify(this.table))));
        this.updateTable(this.table);
      } else {
        this.table = newTable;
        handler.onUpdate(new Table(JSON.parse(JSON.stringify(this.table))));
      }
    }
    this.connection.onclose = () => {
      handler.onDisconnect();
    }
  }

  updateTable(newTable: Table) {
    this.connection.send(JSON.stringify({
      "action": "update",
      "tableId": this.currentTableId,
      "table": newTable
    }))
  }
}

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
