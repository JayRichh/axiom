import { Vector3Object } from '@react-three/rapier'
import * as THREE from 'three'
import { BatchedRenderer } from '../../../quarks/BatchedRenderer'
import { ParticleSystem } from '../../../quarks/ParticleSystem'
import { ConeEmitter } from '../../../quarks/emitters/ConeEmitter'
import { ConstantValue, IntervalValue } from '../../../quarks/values'
import { RenderMode } from '../../../quarks/types'
import { randomDirection, randomFloat } from '../../../helpers'

const texture = new THREE.TextureLoader().load("effects/muzzleflash.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const material = new THREE.MeshStandardMaterial({ 
  map: texture, 
  depthWrite: false,
  depthTest: false,
  transparent: true,
  alphaTest: 0.01,
  blending: THREE.AdditiveBlending,
});

export const muzzle = (position: THREE.Vector3, direction: THREE.Vector3, batchSystem: BatchedRenderer) => {
  const flash = new ParticleSystem({
    duration: 1,
    looping: false,
    shape: new ConeEmitter({ radius: 0.0015, arc: 6.283185307179586, thickness: 0, angle: 0.1 }),
    startLife: new IntervalValue(0.7, 1),
    startSpeed: new IntervalValue(0.2, 1),
    startRotation: new IntervalValue(0, 6),
    startSize: new IntervalValue(0.7, 1),
    emissionOverTime: new ConstantValue(0),
    worldSpace: false,
    autoDestroy: true,
    
    emissionBursts: [{
      time: 0,
      cycle: 1,
      interval: 0.01,
      count: new ConstantValue(3),
      probability: 1
    }],
   
    renderMode: RenderMode.Mesh,
    material: material,
  });

  flash.emitter.position.copy(position);
  flash.emitter.lookAt(direction);

  return [flash];
}
