import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGunEvents } from './events'
import { PlayerState } from '../../../state/playerState'
import { PISTOL_PARAMS } from '../../../data'
import { GameState } from '../../../state/gameState'
import { Gun as GunType } from '../../../config/guns'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'

const up = new THREE.Vector3(0, 1, 0);
const down = new THREE.Vector3(0, -1, 0);
const camDir = new THREE.Vector3();

export function SpriteGun({ optic }: GunType) {
  const muzzleRef = useRef<THREE.Group>(null!);
  const gunRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const spriteRef = useRef<THREE.Sprite>(null!);

  const { animations } = useGunEvents(muzzleRef);
  // Use 4 horizontal frames, 2 vertical frames (we'll only use top row)
  const { texture, setFrame } = useSpriteSheet(PISTOL_PARAMS.spriteSheet, 4, 2);
  
  useFrame(({ clock }, dt) => {
    const [gun, body, sprite] = [gunRef.current, bodyRef.current, spriteRef.current];
    
    // reset position - adjusted for sprite and viewport
    gun.position.set(0.4, -0.3, -0.5);
    gun.rotation.set(0, 0, 0);
    body.position.set(0, 0, 0);
    body.rotation.set(0, 0, 0);
    
    // position
    body.position.x += animations.posX * 0.9;
    body.position.y += animations.posY * 0.9;
    
    // sway
    body.position.x += animations.swayX / (PlayerState.aiming ? 3.5 : 1);
    body.position.y += animations.swayY / (PlayerState.aiming ? 3.5 : 1);
    body.position.x += Math.sin(1 + clock.getElapsedTime() * 3) * 0.0012;
    body.position.x -= Math.sin(2 + clock.getElapsedTime()) * 0.0012;
    body.position.y -= Math.sin(3 + clock.getElapsedTime()) * 0.0035;
    body.position.y += Math.sin(4 + clock.getElapsedTime() * 2) * 0.002;
    
    // mouse velocity
    animations.velocity();
    body.position.x += animations.velX / 1.75;
    body.position.y += animations.velY / (PlayerState.aiming ? 1.75 : 4.5);

    // roll
    gun.rotation.z += (animations.roll + (animations.velX * (PlayerState.aiming ? 1.8 : 2.7))) / 2;

    // reload
    body.position.x += animations.reloadX;
    body.rotation.z -= animations.reloadY;
    body.position.y += animations.reloadY;

    // jump
    body.position.y += animations.jumpY;
    
    // Update sprite frame for recoil animation
    if (texture && animations.knockback > 0) {
      // Scale knockback to frame index (0-3 for top 4 frames)
      // With new knockback values (0.15-0.25), multiply by 12 to get proper frame range
      const frameIndex = Math.min(Math.floor(animations.knockback * 12), 3);
      setFrame(frameIndex); // This will use frames 0-3 from the top row
    } else if (texture) {
      setFrame(0); // Reset to first frame when not in recoil
    }
    
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
    
    // Ensure matrices are updated
    gun.updateMatrix();
    gun.updateMatrixWorld();
    body.updateMatrix();
    body.updateMatrixWorld();
  });

  return (
    <group dispose={null} ref={gunRef} scale={0.5}>
      <group dispose={null} ref={bodyRef}>
        <group ref={muzzleRef} position={[0.2, 0.1, 0]}>
          {/* Empty group for muzzle position reference */}
        </group>
        {texture && (
          <sprite ref={spriteRef} scale={[1.4, 1.4, 1.9]} position={[-0.3, 0, 0]}>
            <spriteMaterial
              map={texture}
              transparent={true}
              depthTest={false}
            />
          </sprite>
        )}
      </group>
    </group>
  )
}
