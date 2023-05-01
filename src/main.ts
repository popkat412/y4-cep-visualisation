import "./style.css";

import p5 from "p5";
import Particle from "./particle";
import { NUM_PARTICES, NUM_TYPES } from "./constants";
import {
  ArrayParticleCollection,
  ParticleCollection,
  // QuadtreeParticleCollection,
} from "./particle-collection";

const particles: ParticleCollection<Particle> = new ArrayParticleCollection();
// const particles: ParticleCollection<Particle> =
//   new QuadtreeParticleCollection();

let interactionMatrix: number[][] = [];

new p5((p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    // p.randomSeed(99);

    // initialise interactionMatrix
    for (let i = 0; i < NUM_TYPES; i++) {
      interactionMatrix[i] = [];
      for (let j = 0; j < NUM_TYPES; j++) {
        interactionMatrix[i][j] = p.random(-1, 1);
      }
    }

    for (let i = 0; i < NUM_PARTICES; i++) {
      particles.addParticle(new Particle(p, particles));
    }
  };

  p.draw = () => {
    p.background(0);

    for (const particle of particles) {
      particle.update(interactionMatrix);
    }
    for (const particle of particles) {
      particle.draw();
    }

    p.fill("white");
    p.noStroke();
    p.text(`Frame rate: ${p.frameRate().toFixed(2)}`, 10, 10);

    particles.update();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
