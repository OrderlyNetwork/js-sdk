import BaseHandler from "./baseHandler";
import { SendFunc } from "@/types/ws";

export default class PingHandler extends BaseHandler {
  handle(_: any, send: SendFunc) {
    send({ event: "pong", ts: Date.now() });
  }
}
