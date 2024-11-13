import * as THREE from 'three'
import { GunAnimations } from './animations'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { SMG_PARAMS } from '../../../data'
import { Layers, RenderOrder } from '../../../constants'
import { PlayerState } from '../../../state/playerState'

export function IronSight({ animations, hasOptic, normalArray }: { animations: GunAnimations, hasOptic: boolean, normalArray: Uint8Array } ) {
  const ref = useRef<THREE.Group>(null!);
  const renderParams = hasOptic ? SMG_PARAMS.ironsight.optic : SMG_PARAMS.ironsight.stock;
  const { scene: sightModel } = useGLTF(renderParams.model);
  
  useFrame(() => {
    const sight = ref.current;

    if (!PlayerState.aiming && !sight.visible) return;
    
    sight.visible = animations.frame === 0 ? false : true;

    // reset - adjusted position for 3D model
    sight.position.set(0.2, renderParams.offsetY - 0.2, 0);
    sight.rotation.set(0, 0, 0);
    
    // Adjusted movement multipliers for 3D model
    sight.position.x += animations.posX * 0.8;
    sight.position.y += animations.jumpY / 3;

    sight.position.x += animations.roll / 20;

    sight.position.setZ(animations.frame === 0 ? 5 : 0);
    sight.visible = animations.frame === 2;

    sight.position.x += animations.velX / 4;
    sight.position.y += animations.velY / 6;
    sight.position.x += animations.frame === 1 ? 0.02 : 0;
    sight.position.y += animations.frame === 1 ? -0.015 : 0;

    sight.position.x -= animations.kickX / 4;
    sight.position.y -= animations.kickY / 4;
    sight.position.z += animations.knockback * 0.8;
    
    sight.position.x += animations.reloadX * 0.8;
    sight.rotation.z -= animations.reloadY * 0.8;
    sight.position.y += animations.reloadY * 0.8;

    sight.position.y += animations.knockback / 4;
    
    sight.updateMatrix();
  });

  return (
    <group 
      dispose={null} 
      ref={ref} 
      renderOrder={RenderOrder.GUN_IRONSIGHT} 
      layers={Layers.GUN} 
      matrixAutoUpdate={false} 
      matrixWorldAutoUpdate={false} 
      userData={{ shootThrough: true }}
      scale={0.35} // Reduced scale for better proportion with 3D model
    >
      <primitive object={sightModel} />
    </group>
  );
}
