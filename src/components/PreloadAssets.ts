import { useThree } from '@react-three/fiber'
import { useNextTickTexture } from '../hooks/useNextTickTexture'
import * as THREE from 'three'
import { WorldState } from '../state/worldState'
import { WorldSubject } from '../state/worldState/types'
import { useGLTF } from '@react-three/drei'

export function PreloadAssets() {
  const { scene } = useThree();

  // preload gun textures
  useNextTickTexture('guns/crosshairs_tilesheet_black.png');
  useNextTickTexture('guns/reticles.png');

  // preload gun models
  useGLTF.preload('guns/smg/blasterA.glb');
  useGLTF.preload('guns/smg/scopeA.glb');
  useGLTF.preload('guns/smg/scopeB.glb');
  useGLTF.preload('guns/smg/foamBulletA.glb');

  // preload effect textures
  useNextTickTexture('effects/smoke.png');
  useNextTickTexture('effects/muzzleflash.png');
  useNextTickTexture('effects/bullethole.png');
  useNextTickTexture('effects/bullethole_normal.png');
  useNextTickTexture('effects/spark.png');
  useNextTickTexture('effects/casing.png');

  // preload environment textures
  useNextTickTexture('environment/barrel.png');
  useNextTickTexture('environment/ground.jpg');
  useNextTickTexture('environment/box.jpg');

  // preload bulletholes
  function preloadBulletholes() {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0, 0));
      plane.position.set(0, 1, -4);
      scene.add(plane);

      setTimeout(() => {
        WorldState.notify(WorldSubject.BULLET_IMPACT, { position: new THREE.Vector3(0, 1, -4), normal: new THREE.Vector3(0, 0, 1), object: plane })
        setTimeout(() => {
          scene.remove(plane);
          plane.geometry.dispose();
        }, 200);
      }, 200);
  }

  preloadBulletholes();

  return null;
}
