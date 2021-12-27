# vchips.app
Virtual Chips to play with friends
# API Spec 
Root domain: https://vchips.app
## REST endpoints
### /tables/create
POST:
Input Body:
```json
{
    "table": "all of the payload of the table object"
}
```
Response Body:
```json
"the id of the table"
```

## WebSocket endpoints
### Connect
Must first connect with the `wss://ws.vchips.app` domain
### login
Message Body Format:
```json
{
    "action": "login",
    "userId": "id of the user as string",
    "tableId": "id of the table as string"
}
```
Respond with payload table object
### update
Message Body Format:
```json
{
    "action": "update",
    "table": "all of the payload of the table object"
}
```
Respond with payload table object

### Websocket Responses
All table updates will be pushed to the client as a message with the following the object of table payload.