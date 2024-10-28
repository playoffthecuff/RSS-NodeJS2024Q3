export const getC = (x: number[], y: number[]) => {
  const r: [number, number][] = [];
  for (const i of x) {
    for (const j of y) {
      r.push([i, j]);
    }
  }
  return r;
};