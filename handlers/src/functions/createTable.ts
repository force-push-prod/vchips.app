import { dynamoDBDocumentClient } from "../resources/Clients"
import crypto from "crypto"
import {getEventBody} from "../resources/Utils"

interface CreateTableInput {
    smallBlindAmount: number;
    bigBlindAmount: number;
    startingCashAmount: number;
}

export async function handler(event: any) {
    // get input body
    const input: CreateTableInput = getEventBody(event);
    // create table
    // generate table uuid
    let tableId = crypto.randomUUID();
    tableId = tableId.substring(tableId.length - 4);
    const currentTime = new Date().getTime() / 1000;
    const table = {
        tableId: tableId,
        ttl: currentTime + (12 * 60 * 60), // 12 hour
        rounds: [],
        players: [],
        playersCashAmount: {},
        smallBlindAmount: input.smallBlindAmount,
        bigBlindAmount: input.bigBlindAmount,
        startingCashAmount: input.startingCashAmount,
    }
    // store user in dynamoDB
    await dynamoDBDocumentClient.put({
        TableName: "VChipsTable",
        Item: table
    })

    return {
        statusCode: 200,
        body: table
    }
}