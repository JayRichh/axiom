import { Object3D, Vector3, BufferGeometry, Color } from 'three';
import { EmissionBurst, ParticleSystemSettings, RenderMode, IParticleSystem, Value } from './types';
import { IParticle } from '../types/Particle';
import { BatchedRenderer } from './BatchedRenderer';

export class ParticleSystem implements IParticleSystem {
    private settings: ParticleSystemSettings;
    private time: number;
    private active: boolean;
    
    // IParticleSystem public properties
    public particles: IParticle[];
    public emitter: Object3D;
    public _renderer?: BatchedRenderer;
    public worldSpace: boolean;
    public particleNum: number;
    public duration: number;
    public looping: boolean;
    public instancingGeometry: BufferGeometry;
    public rendererEmitterSettings: any;
    public paused: boolean;

    constructor(settings: ParticleSystemSettings) {
        this.settings = settings;
        this.particles = [];
        this.time = 0;
        this.active = true;
        this.emitter = new Object3D();
        this.paused = false;

        // Initialize IParticleSystem properties
        this.worldSpace = settings.worldSpace;
        this.particleNum = 0; // Will be updated during emission
        this.duration = settings.duration;
        this.looping = settings.looping;
        this.instancingGeometry = settings.material.userData?.geometry;
        this.rendererEmitterSettings = {};
    }

    private getEmissionCount(count: number | (() => number) | Value): number {
        if (typeof count === 'number') {
            return count;
        }
        if (typeof count === 'function') {
            return count();
        }
        if ('getValue' in count) {
            return count.getValue();
        }
        return 0;
    }

    update(delta: number) {
        if (!this.active || this.paused) return;

        this.time += delta;

        // Handle emission bursts
        this.settings.emissionBursts.forEach(burst => {
            if (this.time >= burst.time && this.time < burst.time + burst.interval) {
                const count = this.getEmissionCount(burst.count);
                if (Math.random() < burst.probability) {
                    this.emit(count);
                }
            }
        });

        // Update particles
        this.particles.forEach(particle => {
            if (!particle.active) return;

            particle.life -= delta;
            particle.age += delta;
            
            if (particle.life <= 0) {
                particle.active = false;
                particle.died = true;
                return;
            }

            // Update position using velocity
            particle.previousPosition?.copy(particle.position);
            particle.position.add(particle.velocity.multiplyScalar(delta));
            
            // Update rotation
            particle.rotation += particle.angularVelocity * delta;
        });

        // Update particle count
        this.particleNum = this.particles.filter(p => p.active).length;

        // Handle looping
        if (this.time >= this.duration) {
            if (this.looping) {
                this.restart();
            } else if (this.settings.autoDestroy && this.particles.every(p => !p.active)) {
                this.destroy();
            }
        }
    }

    private emit(count: number) {
        for (let i = 0; i < count; i++) {
            const position = this.settings.shape.getRandomPoint();
            const velocity = new Vector3(0, 0, this.settings.startSpeed.getValue());
            
            const particle: IParticle = {
                position: position,
                previousPosition: position.clone(),
                rotation: this.settings.startRotation.getValue(),
                size: this.settings.startSize.getValue(),
                life: this.settings.startLife.getValue(),
                maxLife: this.settings.startLife.getValue(),
                speed: velocity.clone(),
                velocity: velocity,
                active: true,
                age: 0,
                uvTile: 0,
                color: new Color(1, 1, 1),
                angularVelocity: 0,
                memory: new Float32Array(4),
                died: false
            };

            if (this.worldSpace) {
                particle.position.applyMatrix4(this.emitter.matrixWorld);
                particle.velocity.applyMatrix4(this.emitter.matrixWorld);
                particle.speed.applyMatrix4(this.emitter.matrixWorld);
            }

            this.particles.push(particle);
        }
    }

    pause() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    restart() {
        this.time = 0;
        this.particles = [];
        this.active = true;
        this.paused = false;
    }

    destroy() {
        if (this._renderer) {
            this._renderer.deleteSystem(this);
        }
    }

    getRendererSettings() {
        return {
            material: this.settings.material,
            renderMode: this.settings.renderMode,
            renderOrder: 0,
            layers: this.emitter.layers,
            instancingGeometry: this.instancingGeometry,
            uTileCount: 1,
            vTileCount: 1,
            blendTiles: false,
            softParticles: false,
            softNearFade: 0,
            softFarFade: 0
        };
    }

    clone(): IParticleSystem {
        return new ParticleSystem(this.settings);
    }

    toJSON(metaData: any, options: any): any {
        return {
            settings: this.settings,
            particles: this.particles,
            time: this.time,
            active: this.active,
            paused: this.paused
        };
    }
}
