import * as THREE from 'three'
import { RigidBody, CuboidCollider, interactionGroups } from '@react-three/rapier'
import { useNextTickTexture } from '../../hooks/useNextTickTexture'
import { Triplet } from '../../types'
import { Collisions } from '../../constants'

export function Box({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: { position?: Triplet, rotation?: Triplet, scale?: number }) {
  const texture = useNextTickTexture('environment/box.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
  });

  return (
    <RigidBody type='fixed' position={position} rotation={rotation}>
      <mesh castShadow receiveShadow scale={scale} userData={{ material: 'concrete' }}>
        <boxGeometry />
        <meshStandardMaterial map={texture} />
      </mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} scale={scale} collisionGroups={interactionGroups(Collisions.WORLD)}/>
    </RigidBody>
  )
}
