import type p5 from "p5";
import { Circle, Quadtree } from "@timohausmann/quadtree-ts";
import { distSq } from "./helpers";

export interface ParticleCollection<P extends { pos: p5.Vector }>
  extends Iterable<P> {
  addParticle(particle: P): void;
  getParticles(pos: p5.Vector, r?: number): P[];
  update(): void;
}

export class ArrayParticleCollection<P extends { pos: p5.Vector }>
  implements ParticleCollection<P>
{
  protected particles: P[];

  constructor() {
    this.particles = [];
  }

  addParticle(particle: P): void {
    this.particles.push(particle);
  }

  getParticles(pos: p5.Vector, r: number): P[] {
    return this.particles.filter((x) => distSq(pos, x.pos) < r * r);
  }

  update(): void { }

  [Symbol.iterator]() {
    return this.particles[Symbol.iterator]();
  }
}

export class QuadtreeParticleCollection<
  P extends { pos: p5.Vector }
> extends ArrayParticleCollection<P> {
  protected qtree: Quadtree<Circle<P>>;

  constructor() {
    super();
    this.qtree = new Quadtree({ width: 1, height: 1 });
  }

  addParticle(particle: P): void {
    super.addParticle(particle);
    this.addParticleToQtree(particle);
  }

  getParticles(pos: p5.Vector, r: number): P[] {
    return this.qtree
      .retrieve(new Circle({ x: pos.x, y: pos.y, r }))
      .map((x) => x.data!);
  }

  update(): void {
    // simply regenerate the quadtree lol
    // this should still be O(N log N)
    this.qtree.clear();
    for (const particle of this.particles) {
      this.addParticleToQtree(particle);
    }
  }

  protected addParticleToQtree(particle: P): void {
    const circle = new Circle<P>({
      x: particle.pos.x,
      y: particle.pos.y,
      r: 0.0000001,
      data: particle,
    });
    this.qtree.insert(circle);
  }
}
