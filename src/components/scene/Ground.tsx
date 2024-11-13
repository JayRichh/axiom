import * as THREE from 'three'
import { CuboidCollider, interactionGroups, RigidBody } from "@react-three/rapier"
import { useNextTickTexture } from '../../hooks/useNextTickTexture'
import { useNearestFilterTexture } from '../../hooks/useNearestFilterTexture'
import { Collisions } from '../../constants'

export function Ground() {
  const grid = useNextTickTexture('environment/ground.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat = new THREE.Vector2(400, 400);
  });

  return (
    <>
      <RigidBody type="fixed" collisionGroups={interactionGroups(Collisions.WORLD)}>
        <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2} userData={{ material: 'concrete' }}>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color="#ffe8c8" map={grid} />
        </mesh>
      </RigidBody>
      <CuboidCollider args={[100, 2, 100]} position={[0, -2, 0]} collisionGroups={interactionGroups(Collisions.WORLD)}/>
    </>
  )
}
