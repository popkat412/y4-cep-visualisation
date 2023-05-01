import p5 from "p5";

export function distSq(a: p5.Vector, b: p5.Vector): number {
  const i = a.x - b.x;
  const j = a.y - b.y;
  return i * i + j * j;
}
