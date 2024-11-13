import { Object3D, Texture } from 'three';
import { VFXBatch, VFXBatchSettings, IParticleSystem } from './BatchedRenderer';

export class SpriteBatch extends Object3D implements VFXBatch {
    settings: VFXBatchSettings;
    private systems: IParticleSystem[] = [];

    constructor(settings: VFXBatchSettings) {
        super();
        this.settings = settings;
        Object.defineProperty(this, 'type', { value: 'SpriteBatch' });
    }

    addSystem(system: IParticleSystem): void {
        this.systems.push(system);
    }

    removeSystem(system: IParticleSystem): void {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.splice(index, 1);
        }
    }

    update(): void {
        // Update sprite batch rendering
        // This would involve updating geometry/materials based on particle states
        // For now, this is a minimal implementation
        this.systems.forEach(system => {
            system.particles.forEach(particle => {
                if (particle.active) {
                    // Update particle rendering
                }
            });
        });
    }

    applyDepthTexture(texture: Texture | null): void {
        if (this.settings.material.userData) {
            this.settings.material.userData.depthTexture = texture;
        }
    }
}
