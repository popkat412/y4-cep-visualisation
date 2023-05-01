import p5 from "p5";
import {
  DAMPING_HALF_LIFE,
  FORCE_FACTOR,
  INTERACTION_RANGE,
  NUM_TYPES,
  PARTICLE_SIZE,
  REPULSION_DIST,
} from "./constants";
import { ParticleCollection } from "./particle-collection";

export default class Particle {
  pos: p5.Vector; // everything here is normalised to be be between 0 and 1
  vel: p5.Vector;
  acc: p5.Vector;

  inst: p5;

  type: number;

  particles: ParticleCollection<Particle>;

  private color: p5.Color;

  constructor(p: p5, particles: ParticleCollection<Particle>) {
    this.inst = p;
    this.pos = p.createVector(p.random(0, 1), p.random(0, 1));
    this.vel = p5.Vector.random2D();
    this.acc = p.createVector();
    this.type = Math.floor(p.random(NUM_TYPES));
    this.particles = particles;
    this.color = p.color(
      `hsl(${p.map(this.type, 0, NUM_TYPES, 0, 360)}, 100%, 50%)`
    );
  }

  draw(): void {
    const p = this.inst;

    p.noStroke();
    // auto generate a color based on the type
    p.fill(this.color);
    p.circle(this.pos.x * p.width, this.pos.y * p.height, PARTICLE_SIZE);
    // p.stroke("red");
    // p.noFill();
    // p.circle(this.pos.x, this.pos.y, this.data.radius + SEPARATION_DIST);
  }

  update(interactionMatrix: number[][]): void {
    const p = this.inst;

    const dt = 0.02;
    p.deltaTime;

    // interact with other particles
    for (const other of this.particles.getParticles(
      this.pos,
      INTERACTION_RANGE
    )) {
      if (other == this) continue;
      const rVec = p5.Vector.sub(other.pos, this.pos);
      const r = rVec.mag();

      const forceMag = this.getForceMag(
        r / INTERACTION_RANGE, // normalize the distance to be between 0 and 1
        interactionMatrix[this.type][other.type]
      );

      // this.inst.strokeWeight(1);
      // this.inst.line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      // console.log(forceMag);

      // apply force
      const f = rVec.copy().setMag(forceMag);
      this.acc.add(f);
    }

    // scale by interaction range
    this.acc.mult(INTERACTION_RANGE);

    // multiplier so things don't go too slowlyl
    this.acc.mult(FORCE_FACTOR);

    // damping
    const dampingFactor = Math.pow(0.5, dt / DAMPING_HALF_LIFE);
    this.vel.mult(dampingFactor);

    // euler integration
    this.acc.mult(dt);
    this.vel.add(this.acc);

    this.vel.mult(dt);
    this.pos.add(this.vel);

    this.acc.mult(0);

    // wrap around
    const buffer = PARTICLE_SIZE;
    if (this.pos.x < -buffer) this.pos.x = p.width;
    if (this.pos.y < -buffer) this.pos.y = p.height;
    if (this.pos.x > p.width + buffer) this.pos.x = 0;
    if (this.pos.y > p.height + buffer) this.pos.y = 0;
  }

  private getForceMag(r: number, forceFactor: number): number {
    if (r < REPULSION_DIST) {
      return r / REPULSION_DIST - 1;
    } else if (r < 1) {
      return (
        forceFactor *
        (1 - Math.abs(2 * r - 1 - REPULSION_DIST) / (1 - REPULSION_DIST))
      );
    }

    return 0;
  }
}
