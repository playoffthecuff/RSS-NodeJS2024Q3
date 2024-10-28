import { Ship } from "../ws_server/index";

export const getY = (s: Ship) =>
  s.direction
    ? Array.from({ length: s.length }, (_, k) => s.position.y + k)
    : [s.position.y];