import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"

export const dynamoDBDocumentClient = DynamoDBDocument.from(
    new DynamoDBClient({
        region: "us-east-1",
    }),
    {
        marshallOptions: {
            removeUndefinedValues: true
        }
    }
)