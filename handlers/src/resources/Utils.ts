import { Buffer } from "buffer"
import * as crypto from "crypto"
import bcrypt from "bcryptjs"
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"
import { apigwManagementClient, textEncoder } from "./Clients"
import { dynamoDBDocumentClient } from "./Clients"
import {Table} from "./Types"

export function getEventBody(event: any): any {
    if (event.isBase64Encoded) {
        return JSON.parse(Buffer.from(event.body, "base64").toString())
    } else {
        return JSON.parse(event.body)
    }
}

export function generateId(): string {
    return crypto.randomBytes(16).toString("hex")
}

export async function generatePasswordHash(password: string, rounds: number = 10): Promise<string> {
    return bcrypt.genSalt(rounds).then(salt => bcrypt.hash(password, salt))
}


export function generateConditionExpression(
    expressionAttributeName: string,
    comparison: string,
    expressionAttributeValueName: string,
    expressionAttributeValue: string | undefined
): string {
    if (expressionAttributeValue !== undefined) {
        return `${expressionAttributeName} ${comparison} ${expressionAttributeValueName}`
    } else {
        return `attribute_not_exists(${expressionAttributeName})`
    }
}

export async function broadcastUpdateThroughWebsocket(
    table: Table,
    myConnectionId: string,
){

    const connections: Array<string> = Object.values(table.players);

    const payload = textEncoder.encode(JSON.stringify(table))
    const broadcasts = connections.flatMap(connectionId => {
        if (connectionId !== myConnectionId) {
            return new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: payload
            })
        }
    }).map(async broadcastUpdateCommand => {
        if (broadcastUpdateCommand) {
            try{
                await apigwManagementClient.send(broadcastUpdateCommand)
            } catch(e){
                // maybe delete from database
                console.log(e)
            }
        }
    }) ?? []
    
    return Promise.all(broadcasts)
}