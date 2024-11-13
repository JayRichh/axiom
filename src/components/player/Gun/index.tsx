import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useGunEvents } from './events'
import { PlayerState } from '../../../state/playerState'
import { SMG_OPTIC_PARAMS, SMG_PARAMS } from '../../../data'
import { GameState } from '../../../state/gameState'
import { Layers, RenderOrder } from '../../../constants'
import { OpticReticle } from './OpticReticle'
import { MuzzleFlash } from './MuzzleFlash'
import { IronSight } from './IronSight'
import { Gun as GunType } from '../../../config/guns'
import { OpticGlass } from './OpticGlass'
import { PIPScope } from './PIPScope'
import { GunOptic } from '../../../config/gunAttachments'

const gunNormalArray = new Uint8Array([0,1,1, 0,1,1, 0,1,1, 0,1,1]);

const up = new THREE.Vector3(0, 1, 0);
const down = new THREE.Vector3(0, -1, 0);
const camDir = new THREE.Vector3();

export function Gun({ optic, attachments }: GunType) {
  const muzzleRef = useRef<THREE.Group>(null!);
  const gunRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);

  const hasOptic = optic !== null;
  
  // Load appropriate GLB model based on optic state
  const { scene: gunModel } = useGLTF(hasOptic ? SMG_OPTIC_PARAMS[optic].model : SMG_PARAMS.body);
  const { animations } = useGunEvents(muzzleRef);
  
  useFrame(({ clock }, dt) => {
    const [gun, body, muzzle] = [gunRef.current, bodyRef.current, muzzleRef.current];
    
    // reset - adjusted position for 3D model
    gun.position.set(0.2, -0.2, -0.3);
    gun.rotation.set(0, 0, 0);
    body.position.set(0, 0, 0);
    body.rotation.set(0, 0, 0);
    
    // position - adjusted for 3D models
    body.position.x += animations.posX * 0.9;
    body.position.y += animations.posY * 0.9;
    
    // sway - adjusted for 3D models
    body.position.x += animations.swayX / (PlayerState.aiming ? 3.5 : 1);
    body.position.y += animations.swayY / (PlayerState.aiming ? 3.5 : 1);
    body.position.x += Math.sin(1 + clock.getElapsedTime() * 3) * 0.0012;
    body.position.x -= Math.sin(2 + clock.getElapsedTime()) * 0.0012;
    body.position.y -= Math.sin(3 + clock.getElapsedTime()) * 0.0035;
    body.position.y += Math.sin(4 + clock.getElapsedTime() * 2) * 0.002;
    
    // mouse velocity - adjusted for 3D models
    animations.velocity();
    body.position.x += animations.velX / 1.75;
    body.position.y += animations.velY / (PlayerState.aiming ? 1.75 : 4.5);

    // roll - adjusted for 3D models
    gun.rotation.z += (animations.roll + (animations.velX * (PlayerState.aiming ? 1.8 : 2.7))) / 2;

    // reload
    body.position.x += animations.reloadX;
    body.rotation.z -= animations.reloadY;
    body.position.y += animations.reloadY;

    // jump
    body.position.y += animations.jumpY;
    
    // muzzle flash position adjustment for 3D model
    muzzle.position.x = -0.12 + (animations.frame * 0.04);
    gun.scale.set(0.12 + (animations.frame * 0.02), 0.12 + (animations.frame * 0.02), 0.12 + (animations.frame * 0.02));
    gun.position.y -= 0.02 + (animations.frame * 0.001);
    
    // recoil, kick, knockback, camera shake
    const RECOIL_THRESHOLD = 0.1;
    if (GameState.camera.getWorldDirection(camDir).angleTo(down) < Math.PI - RECOIL_THRESHOLD) {
      GameState.camera.rotateX(animations.recoilY * dt * 100);
      GameState.camera.rotateOnWorldAxis(up, animations.recoilX * dt * 100);

      const cameraShake = PlayerState.aiming 
        ? animations.kickX * 3.5
        : (-Math.abs(animations.kickX) * 2.7) + animations.kickX * 1.8;

      GameState.cameraWrapper.rotation.set(0, 0, 0);
      GameState.cameraWrapper.rotateOnWorldAxis(camDir, cameraShake);
    }

    body.position.x += animations.kickX;
    body.position.y += animations.kickY;
    gun.rotation.z += animations.kickX * 2.7;
    
    body.position.z += animations.knockback * (PlayerState.aiming ? 2.7 : 1);
    body.position.y += animations.knockback / 0.6;
    gun.rotation.x += animations.knockback * 3.5;
    
    GameState.camera.setFocalLength(15 + animations.zoom + animations.knockback * 4.5);
    
    gun.updateMatrix();
    body.updateMatrix();
  });

  return (
    <>
      {optic === GunOptic.ACOG && <PIPScope animations={animations}/>}
      <group dispose={null} ref={gunRef} scale={0.12} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>
        <group dispose={null} ref={bodyRef} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>
          <primitive object={gunModel} />
          
          <group dispose={null} ref={muzzleRef} position={[0, 0, -0.12]}>
            <MuzzleFlash animations={animations}/>
          </group>

          {optic && <OpticGlass optic={attachments.optics[optic]} animations={animations}/>}
        </group>  
        
        {optic && <OpticReticle optic={attachments.optics[optic]} animations={animations}/>}
        {!hasOptic && <IronSight hasOptic={hasOptic} animations={animations} normalArray={gunNormalArray}/>}
      </group>
    </>
  )
}
