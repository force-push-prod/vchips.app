import { dynamoDBDocumentClient } from "../resources/Clients"
import crypto from "crypto"

export async function handler(event: any) {
    // login user
    // generate user uuid
    const userId = crypto.randomUUID();
    const currentTime = new Date().getTime() / 1000;
    const user = {
        userId: userId,
        ttl: currentTime + (12 * 60 * 60) // 12 hour
    }
    // store user in dynamoDB
    await dynamoDBDocumentClient.put({
        TableName: "VChipsUsers",
        Item: user
    })

    return {
        statusCode: 200,
        body: user
    }
}