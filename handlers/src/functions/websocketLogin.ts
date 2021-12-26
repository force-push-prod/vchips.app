import { dynamoDBDocumentClient } from "../resources/Clients"
import {getEventBody, broadcastUpdateThroughWebsocket} from "../resources/Utils"
import { Table } from "../resources/Types";

export async function handler(event: any) {
    // parse body
    const input: any = getEventBody(event);
    // get gameId
    const tableId = input.tableId;
    const userId = input.userId;


    await dynamoDBDocumentClient.put({
        TableName: "VChipsUsers",
        Item: {
            userId: userId,
            tableId: tableId,
            "connectionId": event.requestContext.connectionId,
            "ttl": new Date().getTime() / 1000 + (12 * 60 * 60) // 12 hour
        }
    })
    // get current table
    const table = await dynamoDBDocumentClient.get({
        TableName: "VChipsTable",
        Key: {
            tableId: tableId
        }
    }).then(res => res.Item ? res.Item  as Table : undefined);
    if (table) {
        // add user to table
        table.players[userId] = event.requestContext.connectionId;
        table.playersCashAmount[userId] = table.startingCashAmount;
        // update table
        await dynamoDBDocumentClient.put({
            TableName: "VChipsTable",
            Item: table
        })
    } else{
        return {
            statusCode: 404,
            body: "Table not found"
        }
    }
    await broadcastUpdateThroughWebsocket(table, event.requestContext.connectionId);
    
    return {
        statusCode: 200,
        body: JSON.stringify(table)
    }
}