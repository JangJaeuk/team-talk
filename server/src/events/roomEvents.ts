import { EventEmitter } from "events";

export const roomEvents = new EventEmitter();

export const ROOM_EVENTS = {
  ROOM_CREATED: "room:created",
} as const;
