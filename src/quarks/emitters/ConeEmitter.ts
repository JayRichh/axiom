import { Vector3 } from 'three';
import { EmitterShape } from '../types';

interface ConeEmitterSettings {
    radius: number;
    arc: number;
    thickness: number;
    angle: number;
}

export class ConeEmitter implements EmitterShape {
    private radius: number;
    private arc: number;
    private thickness: number;
    private angle: number;
    private tempVector: Vector3;

    constructor(settings: ConeEmitterSettings) {
        this.radius = settings.radius;
        this.arc = settings.arc;
        this.thickness = settings.thickness;
        this.angle = settings.angle;
        this.tempVector = new Vector3();
    }

    getRandomPoint(): Vector3 {
        // Random angle around the circle
        const theta = Math.random() * this.arc;
        
        // Random radius (use thickness if specified)
        const r = this.radius * (1 - this.thickness + Math.random() * this.thickness);
        
        // Calculate point on circle
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        
        // Random distance along cone height based on angle
        const distance = Math.random();
        const height = Math.tan(this.angle) * r * distance;
        
        return this.tempVector.set(x, y, height);
    }
}
