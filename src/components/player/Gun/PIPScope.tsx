import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { GameState } from '../../../state/gameState'
import { Layers, RenderOrder } from '../../../constants'
import { GunAnimations } from './animations'
import { useGLTF } from '@react-three/drei'
import { useNearestFilterTexture } from '../../../hooks/useNearestFilterTexture'
import { PlayerState } from '../../../state/playerState'

const camPos = new THREE.Vector3();
const camQuat = new THREE.Quaternion();

export function PIPScope({ animations }: { animations: GunAnimations }) {
  const [secondaryCamera] = useState(new THREE.PerspectiveCamera(12, 1));
  const target = useMemo(() => new THREE.WebGLRenderTarget(512, 512), []);
  const ref = useRef<THREE.Mesh>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  
  const { scene, gl } = useThree();
  // Using the new scopeB model for ACOG
  const { scene: scopeModel } = useGLTF('guns/smg/scopeB.glb');
  // Using crosshairs tilesheet for scope texture
  const texture = useNearestFilterTexture('guns/crosshairs_tilesheet_black.png');

  useEffect(() => {
    scene.add(secondaryCamera);
  }, []);

  useFrame(() => {
    const scope = ref.current;
    const body = bodyRef.current;

    secondaryCamera.position.copy(GameState.camera.getWorldPosition(camPos));
    secondaryCamera.quaternion.copy(GameState.camera.getWorldQuaternion(camQuat));

    scope.visible = body.visible = animations.frame === 2 ? true : false;
    if (!scope.visible) return;

    // reset anim
    scope.position.set(0, 0, -0.145);
    body.position.set(0, -0.0025, -0.145);
    body.rotation.set(0, 0, 0);
    
    body.position.x -= animations.posX / 15;
    body.position.y -= animations.posY / 15;
    body.position.y += animations.jumpY / 7;
    
    scope.position.x += animations.posX / 10;
    scope.position.y += animations.posY / 10;
    scope.position.y += animations.jumpY / 7;

    // scope anim
    scope.position.x += animations.velX / 14;
    scope.position.y += animations.velY / 10;
    
    body.position.x += animations.kickX / 2;
    body.position.y += animations.kickY / 2;
    body.position.y += animations.knockback / 8;

    scope.position.z += animations.knockback;
    scope.position.y -= animations.knockback / 3;
    
    //body anim
    body.rotation.z += (animations.roll + (animations.velX * 2)) / (PlayerState.aiming ? 2 : 1);
    
    body.position.x += animations.posX / 5;
    body.position.y += animations.posY / 10;
    
    body.position.x += animations.velX / 14;
    body.position.y += animations.velY / 10;
    
    body.position.x += animations.swayX / 10;
    body.position.y += animations.swayY / 10;
    body.rotation.z += animations.kickX;
    body.position.z += animations.knockback / 2;
    
    // render
    GameState.camera.layers.disable(Layers.SCOPE);
    GameState.camera.layers.disable(Layers.GUN);
    GameState.camera.layers.disable(Layers.RETICLE);
    GameState.camera.setFocalLength(105);
    
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, secondaryCamera);
    gl.setRenderTarget(null);
    
    GameState.camera.layers.enable(Layers.SCOPE);
    GameState.camera.layers.enable(Layers.GUN);
    GameState.camera.layers.enable(Layers.RETICLE);
  }, 1);
  
  return <>
    <mesh dispose={null} ref={bodyRef} renderOrder={RenderOrder.GUN_SCOPE} layers={Layers.SCOPE}>
      <planeGeometry args={[0.08, 0.08]}/>
      <meshStandardMaterial map={texture} transparent depthTest={false} />
    </mesh>
    <primitive 
      object={scopeModel} 
      ref={ref}
      renderOrder={RenderOrder.GUN_SCOPE} 
      layers={Layers.SCOPE}
    >
      <meshBasicMaterial map={target.texture}/>
    </primitive>
  </>
}
