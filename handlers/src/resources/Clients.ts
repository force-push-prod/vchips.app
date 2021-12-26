import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import { TextEncoder } from "util"

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

export const apigwManagementClient = new ApiGatewayManagementApiClient({
    region: "us-east-1",
    endpoint: "https://xxq3etuyyi.execute-api.us-east-1.amazonaws.com/production",
})

export const textEncoder = new TextEncoder()
