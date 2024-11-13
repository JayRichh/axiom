import * as THREE from 'three'
import { GunAnimations } from './animations'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'
import { PlayerState } from '../../../state/playerState'
import { GunOpticObject } from '../../../config/gunAttachments'
import { SMG_OPTIC_PARAMS } from '../../../data'
import { Layers } from '../../../constants'

export function OpticReticle({ optic, animations }: { optic: GunOpticObject, animations: GunAnimations } ) {
  const ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  // Using new crosshairs tilesheet with adjusted dimensions
  const { texture } = useSpriteSheet('guns/reticles.png', 4, 4, optic.reticleShape);
  const reticleScale = SMG_OPTIC_PARAMS[optic.type].reticleScale;
  
  useFrame(() => {
    const reticle = ref.current;

    if (!PlayerState.aiming && !reticle.visible) return;

    reticle.visible = animations.frame === 0 ? false : true;

    // reset - adjusted position for 3D model
    reticle.position.set(0.2, 0.1, 0);
    reticle.rotation.set(0, 0, 0);

    // Adjusted movement values for 3D models
    reticle.position.x += animations.roll / 25;
    reticle.position.x += animations.velX / 15;

    reticle.position.x += animations.swayX / 10;
    reticle.position.y += animations.swayY / 10;

    reticle.position.setZ(animations.frame === 0 ? 5 : 0);
    reticle.position.x += animations.velX / 30;
    reticle.position.y += animations.velY / 30;
    reticle.position.x += animations.frame === 1 ? 0.015 : 0;
    reticle.position.y += animations.frame === 1 ? -0.01 : 0;
    
    reticle.position.x -= animations.kickX / 4;
    reticle.position.y -= animations.kickY / 4;
    
    const scale = animations.frame === 1 ? 0.8 : 1;
    reticle.scale.set(scale * reticleScale, scale * reticleScale, scale * reticleScale);
    
    // Adjusted opacity transitions for better visibility
    reticle.material.opacity = animations.frame === 1 
      ? optic.reticleOpacity * 0.3 
      : optic.reticleOpacity;

    reticle.updateMatrix();
  });

  return (
    <mesh 
      dispose={null} 
      layers={Layers.RETICLE} 
      ref={ref} 
      matrixAutoUpdate={false} 
      matrixWorldAutoUpdate={false} 
      userData={{ shootThrough: true }}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshLambertMaterial 
        map={texture} 
        color={optic.reticleColor} 
        transparent 
        depthTest={false} 
        emissive={optic.reticleColor} 
        emissiveIntensity={optic.reticleOpacity * 2.5}
      />
    </mesh>
  )
}
