import { useFrame } from '@react-three/fiber'
import { GunOpticObject } from '../../../config/gunAttachments'
import { Layers, RenderOrder } from '../../../constants'
import { SMG_OPTIC_PARAMS } from '../../../data'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'
import { GunAnimations } from './animations'
import * as THREE from 'three'

const glassNormalArray = new Float32Array([0,1,0.5, 0,1,0.5, 0,1,0.5, 0,1,0.5]);

export function OpticGlass({ optic, animations }: { optic: GunOpticObject, animations: GunAnimations }) {
  // Using the new crosshairs tilesheet
  const { texture: glassTexture, setFrame } = useSpriteSheet('guns/crosshairs_tilesheet_black.png', 4, 4);

  useFrame(() => {
    // Update frame based on optic type and animation state
    setFrame(animations.frame);
  });

  return (
    <>
    <mesh dispose={null} receiveShadow renderOrder={RenderOrder.GUN_SCOPE} layers={Layers.GUN} userData={{ shootThrough: true }}>
      <planeGeometry args={[1, 1, 1, 1]}>
        <bufferAttribute attach="attributes-normal" array={glassNormalArray} itemSize={3}/>
      </planeGeometry>
      <meshLambertMaterial 
        map={glassTexture} 
        color={optic.glassColor} 
        transparent 
        alphaTest={0.01} 
        depthTest={false}
      />
    </mesh>
    <mesh dispose={null} renderOrder={RenderOrder.GUN_BODY} layers={Layers.GUN} userData={{ shootThrough: true }}>
      <planeGeometry args={[1, 1, 1, 1]}>
        <bufferAttribute attach="attributes-normal" array={glassNormalArray} itemSize={3}/>
      </planeGeometry>
      <meshLambertMaterial 
        map={glassTexture} 
        color={optic.glassColor}  
        transparent 
        alphaTest={0.0001} 
        depthTest={false} 
        emissive={optic.glassColor} 
        emissiveIntensity={1} 
        blending={THREE.MultiplyBlending}
      />
    </mesh>
    </>
  )
}
