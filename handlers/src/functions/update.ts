import { dynamoDBDocumentClient } from "../resources/Clients"
import {getEventBody} from "../resources/Utils"
import { Table } from "../resources/Types";
import {broadcastUpdateThroughWebsocket} from "../resources/Utils";

export async function handler(event: any) {
    // parse body
    const input: any = getEventBody(event);
    // get update to the table
    const newTablePayload = input.table;

    // get current table
    const table = await dynamoDBDocumentClient.get({
        TableName: "VChipsTable",
        Key: {
            tableId: input.tableId
        }
    }).then(res => res.Item ? res.Item as Table : undefined);
    if (table) {
        // update table
        table.nestedTablePayload = newTablePayload;
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

    // send the updated table to other players via websocket
    await broadcastUpdateThroughWebsocket(table, event.requestContext.connectionId);

    return {
        statusCode: 200,
        body: JSON.stringify(table.nestedTablePayload)
    }
}