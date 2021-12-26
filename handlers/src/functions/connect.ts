import { dynamoDBDocumentClient } from "../resources/Clients"
import {getEventBody} from "../resources/Utils"

export async function handler(event: any) {
    
    return {
        statusCode: 200,
        body: 'Welcome to the V-Chips API!'
    }
}