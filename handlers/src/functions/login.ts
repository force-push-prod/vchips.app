import { dynamoDBDocumentClient } from "../resources/Clients"
import crypto from "crypto"

export async function handler(event: any) {
    // login user
    // generate user uuid
    const userId = crypto.randomUUID();
    const currentTime = new Date().getTime();
    const user = {
        userId: userId,
        ttl: currentTime + (2 * 60 * 60 * 1000) // 2 hour
    }
    // store user in dynamoDB
    await dynamoDBDocumentClient.put({
        TableName: "VChipsUsers",
        Item: user
    })

    return {
        statusCode: 200,
        body: JSON.stringify(user)
    }
}