import { BatchedRenderer } from '../../quarks/BatchedRenderer'
import { concreteHit } from './effects/concreteHit'
import { Vector3 } from 'three'
import { metalHit } from './effects/metalHit'
import { muzzle } from './effects/muzzle'
import { bulletCasing } from './effects/bulletCasing'

export const createParticleEffect = (type: string, position: Vector3, normal: Vector3, batchSystem: BatchedRenderer) => {
    switch (type) {
        case 'concrete':
            return concreteHit(position, normal, batchSystem)
        case 'metal':
            return metalHit(position, normal, batchSystem)
        default:
            return []
    }
}
