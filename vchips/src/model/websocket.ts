// import * as WebSocket from "ws"

export const connection = new WebSocket("wss://ws.vchips.app")

export function websocketLogin(userId: string, tableId: string) {
  connection.send(JSON.stringify({
      "action": "login",
        "userId": userId,
        "tableId": tableId
  }))
}

export function websocketUpdate(tableId: string, tablePayload: any) {
  connection.send(JSON.stringify({
      "action": "update",
        "tableId": tableId,
        "table": tablePayload
  }))
}

