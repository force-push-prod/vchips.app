import {Game, generateQueueForRound, findPlayer} from './game';
import {PlayerId, PlayersCashAmount, TableInterface, GameInterface, ChipAmount} from './types';

export class Table implements TableInterface {
    smallBlindAmount!: number;
    bigBlindAmount!: number;
    buttonPlayer!: PlayerId;
    players: string[] = [];
    playersCashAmount: PlayersCashAmount = {};
    previousGames: GameInterface[] = [];

    fromJSON(s: string) { Object.assign(this, JSON.parse(s)); };
    toJSON() { return this; }

    constructor(obj: TableInterface) {
        Object.assign(this, obj);
    }

    initializeNewGame() {
        const sb = findPlayer(this.players, this.buttonPlayer, 'sb');
        const bb = findPlayer(this.players, this.buttonPlayer, 'bb');
        const gameStacks = Object.assign({}, this.playersCashAmount);
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
            winners: [],
        });
    }

    addPreviousGame(game: Game) {
        if (!game.isAllFinished) throw new Error('Game must be finished before being added to previous game');
        this.previousGames.push(game);
        this.buttonPlayer = this.players[this.players.indexOf(game.buttonPlayer) + 1] ?? this.players[0];
    }
}

export function createNewTable(smallBlindAmount: ChipAmount, bigBlindAmount: ChipAmount ): Table {
    return new Table({
        smallBlindAmount: smallBlindAmount,
        bigBlindAmount: bigBlindAmount,
        players: [],
        previousGames: [],
        playersCashAmount: {}
    });
}

export function getMockTable(): Table {
    const players = ['Alice', 'Bob', 'Carlos', 'Dave', 'Eve', 'Frank'];
    return new Table({
        smallBlindAmount: 25,
        bigBlindAmount: 50,
        players: players,
        previousGames: [],
        playersCashAmount: Object.assign({}, ...players.map(p => ({ [p]: 1000 }))),
    });
}

export async function createTableNetworkCall(smallBlindAmount: ChipAmount, bigBlindAmount: ChipAmount ){
    let response = await fetch('https://vchips.app/tables/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            table: createNewTable(smallBlindAmount, bigBlindAmount),
        })
    });
    return response.text();
}