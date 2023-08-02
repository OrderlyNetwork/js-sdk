import { MessageHandler, SendFunc } from "@/types/ws";
import { WebSocketSubject } from "rxjs/webSocket";

export default class BaseHandler implements MessageHandler {
  // constructor(readonly wsSubject: WebSocketSubject<any>) {}
  handle(message: any, send: SendFunc) {
    throw new Error("Method not implemented.");
  }
}
