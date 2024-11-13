import { BufferGeometry, Material, Layers, Vector3, Color } from 'three';

export enum RenderMode {
    Trail = 'Trail',
    Mesh = 'Mesh',
    BillBoard = 'BillBoard',
    VerticalBillBoard = 'VerticalBillBoard',
    HorizontalBillBoard = 'HorizontalBillBoard',
    StretchedBillBoard = 'StretchedBillBoard'
}

export interface EmissionBurst {
    time: number;
    count: number | (() => number) | Value;
    cycle: number;
    interval: number;
    probability: number;
}

export interface ParticleSystemSettings {
    duration: number;
    looping: boolean;
    shape: EmitterShape;
    startLife: Value;
    startSpeed: Value;
    startRotation: Value;
    startSize: Value;
    emissionOverTime: Value;
    worldSpace: boolean;
    autoDestroy?: boolean;
    emissionBursts: EmissionBurst[];
    renderMode: RenderMode;
    material: Material;
}

export interface EmitterShape {
    getRandomPoint(): Vector3;
}

export interface Value {
    getValue(): number;
}

export interface IParticle {
    position: Vector3;
    rotation: number;
    size: number;
    life: number;
    maxLife: number;
    speed: Vector3;
    active: boolean;
    velocity: Vector3;
    age: number;
    uvTile: number;
    color: Color;
    angularVelocity: number;
    previousPosition?: Vector3;
    memory: Float32Array;
    died: boolean;
}

export interface IParticleSystem {
    worldSpace: boolean;
    particleNum: number;
    duration: number;
    looping: boolean;
    particles: IParticle[];
    emitter: any;
    _renderer?: any;
    instancingGeometry: BufferGeometry;
    rendererEmitterSettings: any;
    paused: boolean;

    getRendererSettings(): any;
    pause(): void;
    play(): void;
    restart(): void;
    clone(): IParticleSystem;
    toJSON(metaData: any, options: any): any;
}
