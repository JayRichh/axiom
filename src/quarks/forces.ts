import { Vector3 } from 'three';
import { IParticle } from '../types/Particle';

export class ApplyForce {
    private force: Vector3;

    constructor(force: Vector3) {
        this.force = force;
    }

    apply(particle: IParticle, deltaTime: number) {
        particle.velocity.add(this.force.clone().multiplyScalar(deltaTime));
    }
}

export class ForceOverLife {
    private force: Vector3;
    private scale: (t: number) => number;

    constructor(force: Vector3, scale: (t: number) => number) {
        this.force = force;
        this.scale = scale;
    }

    apply(particle: IParticle, deltaTime: number) {
        const t = 1 - (particle.life / particle.maxLife);
        const scaledForce = this.force.clone().multiplyScalar(this.scale(t) * deltaTime);
        particle.velocity.add(scaledForce);
    }
}

export class ColorOverLife {
    private gradient: (t: number) => { r: number; g: number; b: number };

    constructor(gradient: (t: number) => { r: number; g: number; b: number }) {
        this.gradient = gradient;
    }

    apply(particle: IParticle) {
        const t = 1 - (particle.life / particle.maxLife);
        const color = this.gradient(t);
        particle.color.setRGB(color.r, color.g, color.b);
    }
}

export class SizeOverLife {
    private scale: (t: number) => number;

    constructor(scale: (t: number) => number) {
        this.scale = scale;
    }

    apply(particle: IParticle) {
        const t = 1 - (particle.life / particle.maxLife);
        particle.size *= this.scale(t);
    }
}
