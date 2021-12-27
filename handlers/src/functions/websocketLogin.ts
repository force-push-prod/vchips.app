import { dynamoDBDocumentClient } from "../resources/Clients"
import {getEventBody, broadcastUpdateThroughWebsocket} from "../resources/Utils"
import { Table } from "../resources/Types";
// Player Join Table
export async function handler(event: any) {
    // parse body
    const input: any = getEventBody(event);
    const tableId = input.tableId;
    const userId = input.userId;

    // get current table
    const table = await dynamoDBDocumentClient.get({
        TableName: "VChipsTable",
        Key: {
            tableId: tableId
        }
    }).then(res => res.Item ? res.Item as Table : undefined);
    if (table) {
        // add user to table
        table.players[userId] = event.requestContext.connectionId;
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
        body: JSON.stringify(table.nestedTablePayload)
    }
}