// Import necessary libraries and custom hooks
import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { lerp } from 'three/src/math/MathUtils.js'
import { PlayerState, usePlayerState } from '../state/playerState'
import { useMouseInputRef } from '../hooks/useMouseInput'
import { useKeyboardInputRef } from '../hooks/useKeyboardInput'
import { useFixedFrame } from '../hooks/useFixedFrame'
import { EquipmentType, PLAYER_INPUT_FPS } from '../constants'
import { EquipmentState } from '../state/equipmentState'
import { GunState } from '../state/equipmentState/gunState'
import { PlayerSubject } from '../state/playerState/types'
import { GameState } from '../state/gameState'

// Player movement settings
const PLAYER_SPEED = 50;
const RUN_MULTIPLIER = 2.2;
const SLOW_DOWN_SPEED = 15;
const JUMP_VELOCITY = 5.0;
const JUMP_COOLDOWN = 200;

// Helper vectors for movement calculations
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const velocity = new THREE.Vector3();

// Jump timing variables
let jumpStartTimestamp = 0;
let jumpEndTimestamp = 0;

export function PlayerController() {
  // Set up game environment and input hooks
  const { camera } = useThree();
  const rapier = useRapier();
  const keyboard = useKeyboardInputRef(['w', 's', 'a', 'd', 'r', ' ', 'shift']);
  const mouse = useMouseInputRef();
  const playerRef = usePlayerState(state => state.player);
  const alreadyTriedToFire = useRef(false);

  // Update player velocity
  useFixedFrame(PLAYER_INPUT_FPS, () => {
    const player = playerRef?.current;
    if (!player) return;
    PlayerState.setVelocity(player.linvel())
  });

  // Main game loop
  useFixedFrame(PLAYER_INPUT_FPS, (_, dt) => {
    const player = playerRef?.current;
    if (!player) return;

    // Read player inputs
    const { w, s, a, d, r, shift, space } = keyboard.current;
    const { lmb, rmb } = mouse.current;

    // Calculate camera directions
    forward.setFromMatrixColumn(camera.matrix, 0);
    forward.crossVectors(camera.up, forward);
    right.setFromMatrixColumn(camera.matrix, 0);
    
    let [horizontal, vertical] = [0, 0];
    
    // Check if player is on the ground
    const rayDirection = { x: 0, y: -3, z: 0 };

    if (!PlayerState.player) return;

    const rayOrigin1 = { x: player.translation().x + 0.1, y: player.translation().y, z: player.translation().z + 0.1 };
    const rayOrigin2 = { x: player.translation().x - 0.1, y: player.translation().y, z: player.translation().z - 0.1 };
    const rayOrigin3 = { x: player.translation().x + 0.1, y: player.translation().y, z: player.translation().z - 0.1 };
    const rayOrigin4 = { x: player.translation().x - 0.1, y: player.translation().y, z: player.translation().z + 0.1 };
    
    const grounded1 = rapier.world.castRay(new RAPIER.Ray(rayOrigin1, rayDirection), 0.25, false);
    const grounded2 = rapier.world.castRay(new RAPIER.Ray(rayOrigin2, rayDirection), 0.25, false);
    const grounded3 = rapier.world.castRay(new RAPIER.Ray(rayOrigin3, rayDirection), 0.25, false);
    const grounded4 = rapier.world.castRay(new RAPIER.Ray(rayOrigin4, rayDirection), 0.25, false);

    const grounded = grounded1 || grounded2 || grounded3 || grounded4;
    
    // Handle gun actions (shooting, reloading, aiming)
    if (PlayerState.canShoot && EquipmentState.equipped?.type === EquipmentType.GUN) {
      // Shoot or empty click
      if (lmb) {
        if (GunState.equipped.roundsLeft === 0) {
          if (!alreadyTriedToFire.current) {
            alreadyTriedToFire.current = true;
            PlayerState.notify(PlayerSubject.USE_EQUIPMENT);
          }
        } else {
          PlayerState.notify(PlayerSubject.USE_EQUIPMENT);
        }
      }

      // Reload gun
      if (r && !shift && !lmb && !rmb && !PlayerState.swappingEquipment) {
        GunState.reloadBegin();
      }

      // Reset single click on empty mag
      if (!lmb && alreadyTriedToFire.current) {
        alreadyTriedToFire.current = false;
      }
    }

    // Handle aiming
    if (!GunState.reloading && !PlayerState.swappingEquipment) {
      if (!PlayerState.running && !PlayerState.reloading) {
        if (rmb && !PlayerState.aiming) {
          PlayerState.setAiming();
        }
      }

      if (PlayerState.aiming && !rmb) {
        PlayerState.setAiming(false);
      }
    }

    // Handle player movement
    if (!PlayerState.jumping) {
      // Slow down player
      velocity.set(lerp(velocity.x, 0, SLOW_DOWN_SPEED * dt), 0, lerp(velocity.z, 0, SLOW_DOWN_SPEED * dt));
      
      // Set player state (walking, idling)
      if (w || a || s || d) {
        if (!shift) {
          if (!PlayerState.walking) {
            PlayerState.setWalking();
          }
        }
      } else {
        if (!PlayerState.idling) {
          PlayerState.setIdling();
        }
      }

      let speed = PLAYER_SPEED;
      
      // Handle sprinting
      if (!GunState.reloading) {
        if (shift && w && !PlayerState.aiming) {
          speed *= RUN_MULTIPLIER;
    
          if (!PlayerState.running) {
            PlayerState.setRunning();
          }
        }

        if (PlayerState.running && !w) {
          PlayerState.setRunning(false);

          if (a || s || d) {
            PlayerState.setWalking();
          }
        }
      }

      // Handle strafing
      if (a) { 
        if (!PlayerState.strafingLeft && !d) {
          PlayerState.setStrafingLeft();
        }
      } else {
        if (PlayerState.strafingLeft) {
          PlayerState.setStrafingLeft(false);
        }
      }
      
      if (d) { 
        if (!PlayerState.strafingRight && !a) {
          PlayerState.setStrafingRight();
        }
      } else {
        if (PlayerState.strafingRight) {
          PlayerState.setStrafingRight(false);
        }
      }

      if (a && d) {
        if (PlayerState.strafingLeft) {
          PlayerState.setStrafingLeft(false);
        } else if (PlayerState.strafingRight) {
          PlayerState.setStrafingRight(false);
        }
      }

      // Calculate movement velocity
      if (w) { vertical += lerp(0, speed, 0.7 * dt); }
      if (s) { vertical -= lerp(0, speed, 0.7 * dt); }
      if (a) { horizontal -= lerp(0, PlayerState.running ? speed / 3 : speed, 0.7 * dt); }
      if (d) { horizontal += lerp(0, PlayerState.running ? speed / 3 : speed, 0.7 * dt); }

      if (vertical !== 0) { velocity.add(forward.multiplyScalar(vertical)); }
      if (horizontal !== 0) { velocity.add(right.multiplyScalar(horizontal)); }

      player.setLinvel({ x: velocity.x, y: player.linvel().y, z: velocity.z }, true);
    }
  
    // Handle jumping
    if (space && !PlayerState.jumping && grounded && (Date.now() - jumpEndTimestamp > JUMP_COOLDOWN )
      || (!PlayerState.jumping && !grounded)) { 
    
        player.setLinvel({ x: velocity.x, y: -0.75, z: velocity.z }, true);
        if (space) {
          if (!GunState.reloading) {
            PlayerState.setJumping(true);
            
            jumpStartTimestamp = Date.now();
            player.applyImpulse({ x: 0, y: 0.8, z: 0}, true);
          }
        } else {
          PlayerState.setJumping(true, { fall: true });
        }
      }
      // End jump
      if (grounded && PlayerState.jumping && (Date.now() - jumpStartTimestamp > 400)) {
        PlayerState.setJumping(false);
        PlayerState.notify(PlayerSubject.JUMP_END);

        jumpEndTimestamp = Date.now();
      }
  });

  return null;
}