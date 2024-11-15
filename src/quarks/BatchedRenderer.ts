import {
    BufferGeometry,
    Camera,
    Group,
    Layers,
    Material,
    Matrix3,
    Object3D,
    Scene,
    Texture,
    Vector3,
    WebGLRenderer,
} from 'three';
import { SpriteBatch } from './SpriteBatch';
import { RenderMode } from './types';
import { IParticle } from '../types/Particle';
import { Value } from './types';

export type ValueGenerator = Value;
export type FunctionValueGenerator = () => number;

export interface StoredBatchSettings extends VFXBatchSettings {}

export interface VFXBatch {
    settings: StoredBatchSettings;
    addSystem(system: IParticleSystem): void;
    removeSystem(system: IParticleSystem): void;
    update(): void;
    applyDepthTexture(texture: Texture | null): void;
}

export interface TrailBatch extends VFXBatch {}

/**
 * the settings for rendering a batch of VFX system.
 */
export interface VFXBatchSettings {
    /**
     * Geometry for instancing.
     * @type {BufferGeometry}
     */
    instancingGeometry: BufferGeometry;
    /**
     * Material for rendering.
     * @type {Material}
     */
    material: Material;
    /**
     * Number of horizontal tiles in the texture.
     * @type {number}
     */
    uTileCount: number;
    /**
     * Number of vertical tiles in the texture.
     * @type {number}
     */
    vTileCount: number;
    /**
     * Whether to blend tiles.
     * @type {boolean}
     */
    blendTiles: boolean;
    /**
     * Enable soft particles.
     * @type {boolean}
     */
    softParticles: boolean;
    /**
     * Near fade distance for soft particles.
     * @type {number}
     */
    softNearFade: number;
    /**
     * Far fade distance for soft particles.
     * @type {number}
     */
    softFarFade: number;
    /**
     * Render mode.
     * @type {RenderMode}
     */
    renderMode: RenderMode;
    /**
     * Render order.
     * @type {number}
     */
    renderOrder: number;
    /**
     * layers control visibility of the object.
     * @type {Layers}
     */
    layers: Layers;
}

export interface SerializationOptions {
    /**
     * Use URL for image.
     * @type {boolean}
     */
    useUrlForImage?: boolean;
}

export type RendererEmitterSettings = TrailSettings | MeshSettings | BillBoardSettings | StretchedBillBoardSettings;

export interface StretchedBillBoardSettings {
    /**
     * how stretched the particle is in the direction of the camera based on the speed of the particle.
     * @type {number}
     */
    speedFactor: number;
    /**
     * how stretched the particle is in the direction of the camera based on the size of the particle.
     * @type {number}
     */
    lengthFactor: number;
}

export interface BillBoardSettings {}

export interface TrailSettings {
    /**
     * Start length of the trail.
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startLength: ValueGenerator | FunctionValueGenerator;
    /**
     * Whether to follow the local origin.
     * @type {boolean}
     */
    followLocalOrigin: boolean;
}

export interface MeshSettings {
    /**
     * Rotation axis.
     * @type {Vector3}
     */
    rotationAxis?: Vector3;
    /**
     * Initial rotation around the X-axis.
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startRotationX: ValueGenerator | FunctionValueGenerator;
    /**
     * Initial rotation around the Y-axis.
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startRotationY: ValueGenerator | FunctionValueGenerator;
    /**
     * Initial rotation around the Z-axis.
     * @type {ValueGenerator | FunctionValueGenerator}
     */
    startRotationZ: ValueGenerator | FunctionValueGenerator;
}

export interface IParticleSystem {
    /**
     * Whether the system is in world space.
     * @type {boolean}
     */
    worldSpace: boolean;
    /**
     * Number of particles.
     * @type {number}
     */
    particleNum: number;
    /**
     * Duration of the system.
     * @type {number}
     */
    duration: number;
    /**
     * Whether the system is looping.
     * @type {boolean}
     */
    looping: boolean;
    /**
     * Array of particles.
     * @type {Array<IParticle>}
     */
    particles: Array<IParticle>;
    /**
     * Optional renderer.
     * @type {BatchedRenderer}
     */
    _renderer?: BatchedRenderer;
    instancingGeometry: BufferGeometry;
    rendererEmitterSettings: RendererEmitterSettings;

    getRendererSettings(): VFXBatchSettings;

    paused: boolean;
    pause(): void;
    play(): void;
    restart(): void;

    clone(): IParticleSystem;

    toJSON(metaData: any, options: SerializationOptions): any;
}

/**
 * the class represents the batch renderer. a three.js scene should only have one batchedRenderer
 * It batches all particle systems that has the same rendering pipeline to a single VFXBatch.
 */
export class BatchedRenderer extends Object3D {
    /**
     * Batches for rendering.
     * @type {Array<VFXBatch>}
     */
    batches: Array<VFXBatch> = [];
    /**
     * Map of systems to batch indices.
     * @type {Map<IParticleSystem, number>}
     */
    systemToBatchIndex: Map<IParticleSystem, number> = new Map<IParticleSystem, number>();
    type = 'BatchedRenderer';

    /**
     * Depth texture.
     * @type {Texture | null}
     */
    depthTexture: Texture | null = null;

    constructor() {
        super();
    }

    private static equals(a: StoredBatchSettings, b: VFXBatchSettings) {
        return (
            a.material.side === b.material.side &&
            a.material.blending === b.material.blending &&
            a.material.transparent === b.material.transparent &&
            a.material.type === b.material.type &&
            a.material.alphaTest === b.material.alphaTest &&
            (a.material as any).map === (b.material as any).map &&
            a.renderMode === b.renderMode &&
            a.blendTiles === b.blendTiles &&
            a.softParticles === b.softParticles &&
            a.softFarFade === b.softFarFade &&
            a.softNearFade === b.softNearFade &&
            a.uTileCount === b.uTileCount &&
            a.vTileCount === b.vTileCount &&
            a.instancingGeometry === b.instancingGeometry &&
            a.renderOrder === b.renderOrder &&
            a.layers.mask === b.layers.mask
        );
    }

    /**
     * Adds a particle system to a batch.
     * @param {IParticleSystem} system - The particle system to add.
     */
    addSystem(system: IParticleSystem) {
        system._renderer = this;
        const settings = system.getRendererSettings();
        for (let i = 0; i < this.batches.length; i++) {
            if (BatchedRenderer.equals(this.batches[i].settings, settings)) {
                this.batches[i].addSystem(system);
                this.systemToBatchIndex.set(system, i);
                return;
            }
        }
        let batch;
        switch (settings.renderMode) {
            case RenderMode.Trail:
                batch = new SpriteBatch(settings); // TODO: Implement TrailBatch
                break;
            case RenderMode.Mesh:
            case RenderMode.BillBoard:
            case RenderMode.VerticalBillBoard:
            case RenderMode.HorizontalBillBoard:
            case RenderMode.StretchedBillBoard:
                batch = new SpriteBatch(settings);
                break;
        }
        if (this.depthTexture) {
            batch.applyDepthTexture(this.depthTexture);
        }
        batch.addSystem(system);
        this.batches.push(batch as any);
        this.systemToBatchIndex.set(system, this.batches.length - 1);
        this.add(batch);
    }

    /**
     * Deletes a particle system from its batch.
     * @param {IParticleSystem} system - The particle system to delete.
     */
    deleteSystem(system: IParticleSystem) {
        const batchIndex = this.systemToBatchIndex.get(system);
        if (batchIndex != undefined) {
            this.batches[batchIndex].removeSystem(system);
            this.systemToBatchIndex.delete(system);
        }
    }

    /**
     * Sets the depth texture for all batches. it will be used for soft particles.
     * @param {Texture | null} depthTexture - The depth texture to set.
     */
    setDepthTexture(depthTexture: Texture | null) {
        this.depthTexture = depthTexture;
        for (const batch of this.batches) {
            batch.applyDepthTexture(depthTexture);
        }
    }

    /**
     * Updates a particle system when the particle system has changed requires reloading.
     * @param {IParticleSystem} system - The particle system to update.
     */
    updateSystem(system: IParticleSystem) {
        this.deleteSystem(system);
        this.addSystem(system);
    }

    /**
     * Updates all batches.
     * @param {number} delta - The time delta for the update.
     */
    update(delta: number) {
        this.systemToBatchIndex.forEach((value, ps) => {
            (ps as any).update(delta);
        });
        for (let i = 0; i < this.batches.length; i++) {
            this.batches[i].update();
        }
    }
}
