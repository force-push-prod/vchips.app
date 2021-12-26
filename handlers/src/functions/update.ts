import { dynamoDBDocumentClient } from "../resources/Clients"
import {getEventBody} from "../resources/Utils"
import { Table } from "../resources/Types";
import {broadcastUpdateThroughWebsocket} from "../resources/Utils";

export async function handler(event: any) {
    // parse body
    const input: any = getEventBody(event);
    // get update to the table
    const newTable: Table = input.table;


    await dynamoDBDocumentClient.put({
        TableName: "VChipsTable",
        Item: newTable
    })
    // send the updated table to other players via websocket
    await broadcastUpdateThroughWebsocket(newTable, event.requestContext.connectionId);

    return {
        statusCode: 200,
        body: JSON.stringify(newTable)
    }
}