// types/Particle.d.ts
import { Vector3, Color } from 'three';

export interface IParticle {
    position: Vector3;
    previousPosition: Vector3;
    rotation: number;
    size: number;
    life: number;
    maxLife: number;
    speed: Vector3;
    velocity: Vector3;
    active: boolean;
    age: number;
    uvTile: number;
    color: Color;
    angularVelocity: number;
    memory: Float32Array;
    died: boolean;
}