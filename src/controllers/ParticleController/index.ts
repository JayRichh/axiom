import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { ParticleSystem } from '../../quarks/ParticleSystem'
import { BatchedRenderer } from '../../quarks/BatchedRenderer'
import { createParticleEffect } from './utils'
import { useFrame } from '@react-three/fiber'

export function ParticleController() {
    const batchSystemRef = useRef<BatchedRenderer>(null!)
    const systemsRef = useRef<ParticleSystem[]>([])

    useEffect(() => {
        batchSystemRef.current = new BatchedRenderer()
        
        return () => {
            systemsRef.current.forEach(system => system.destroy())
            systemsRef.current = []
        }
    }, [])

    useFrame((state, delta) => {
        if (batchSystemRef.current) {
            batchSystemRef.current.update(delta)
        }
    })

    const createEffect = (type: string, position: THREE.Vector3, normal: THREE.Vector3) => {
        if (batchSystemRef.current) {
            const particles = createParticleEffect(type, position, normal, batchSystemRef.current)
            systemsRef.current.push(...particles)
            particles.forEach(particle => batchSystemRef.current.addSystem(particle))
        }
    }

    // Make createEffect available globally for other components to use
    useEffect(() => {
        (window as any).createParticleEffect = createEffect
        return () => {
            delete (window as any).createParticleEffect
        }
    }, [])

    return null
}
