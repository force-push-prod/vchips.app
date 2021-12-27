import { dynamoDBDocumentClient } from "../resources/Clients"
import crypto from "crypto"
import {getEventBody} from "../resources/Utils"
import {Table} from "../resources/Types"



export async function handler(event: any) {
    // get input body
    const input = getEventBody(event);
    const initTable = input.table;
    // create table
    let tableId = crypto.randomUUID();
    tableId = tableId.substring(tableId.length - 4);
    const currentTime = new Date().getTime() / 1000;
    const table : Table = {
        tableId: tableId,
        ttl: currentTime + (12 * 60 * 60), // 12 hour
        players: {},
        nestedTablePayload: initTable
    }
    // store user in dynamoDB
    await dynamoDBDocumentClient.put({
        TableName: "VChipsTable",
        Item: table
    })

    return {
        statusCode: 200,
        body: tableId
    }
}