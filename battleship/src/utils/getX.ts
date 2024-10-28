import { Ship } from "../ws_server/index";

export const getX = (s: Ship) =>
  s.direction
    ? [s.position.x]
    : Array.from({ length: s.length }, (_, k) => s.position.x + k);