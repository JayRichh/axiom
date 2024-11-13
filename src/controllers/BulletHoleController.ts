import { useEffect, useRef } from 'react'
import { useNearestFilterTexture } from '../hooks/useNearestFilterTexture'
import * as THREE from 'three'
import { invlerp, randomFloat } from '../helpers'
// import { DecalGeometry } from 'three/examples/jsm/Addons.js'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { RenderOrder } from '../constants'
import { BulletImpactData, WorldSubject } from '../state/worldState/types'
import { WorldState } from '../state/worldState'

const MAX_BULLETHOLES = 50;
let renderOrderIndex = RenderOrder.BULLETHOLES;

const up = new THREE.Vector3(0, 0, 1);
const quaternion = new THREE.Quaternion();
const randomRotation = new THREE.Quaternion();
const orientation = new THREE.Euler();
const mat = new THREE.MeshStandardMaterial({
  depthWrite: false,
  transparent: true,
  alphaTest: 0.01,
  polygonOffset: true,
  polygonOffsetFactor: -1,
});

export function BulletHoleController() {
  const map = useNearestFilterTexture('effects/bullethole.png');
  const normalMap = useNearestFilterTexture('effects/bullethole_normal.png');
  const bulletHoles = useRef<{ parent: THREE.Object3D, hole: THREE.Mesh }[]>([]);
  
  useEffect(() => {
    const unsubscribe = WorldState.subscribe(WorldSubject.BULLET_IMPACT, addBulletHole)
    return () => unsubscribe();
  }, []);

  function addBulletHole({ position, normal, object }: BulletImpactData) {
    if (!position || !normal || !object) return;

    normal.transformDirection(object.matrixWorld);
    quaternion.setFromUnitVectors(up, normal);

    // rotate it but not too much so the normal still looks ok
    quaternion.rotateTowards(randomRotation.setFromAxisAngle(normal, 3), randomFloat(-0.5, 0.5))
    orientation.setFromQuaternion(quaternion);

    const scale = randomFloat(0.85, 1.05);
    const w = randomFloat(0.0975, 0.125) * scale;
    const h = randomFloat(0.0975, 0.125) * scale;
    const decalGeometry = new DecalGeometry(object as THREE.Mesh, position, orientation, new THREE.Vector3(w, h, 0.1));
    const mesh = new THREE.Mesh(decalGeometry, mat.clone());

    mesh.material.opacity = 0.75 + (Math.random() * 0.25);
    mesh.material.normalScale.set(0.25 + Math.random() * 0.65, 0.25 + Math.random() * 0.65);

    mesh.material.map = map;
    mesh.material.normalMap = normalMap;
    mesh.userData.shootThrough = true;

    mesh.renderOrder = renderOrderIndex;
    
    renderOrderIndex++;
    if (renderOrderIndex >= RenderOrder.BULLETHOLES + MAX_BULLETHOLES) {
      renderOrderIndex = RenderOrder.BULLETHOLES;
    }
    
    object.worldToLocal(mesh.position);
    mesh.scale.divide(object.scale);
    mesh.rotation.setFromQuaternion(object.quaternion.clone().invert());
    
    object.add(mesh)
    bulletHoles.current.push({ parent: object, hole: mesh });

    // fade out oldest bulletholes and remove if over the limit
    bulletHoles.current.forEach((bh, index) => {
      const threshold = Math.min(20, MAX_BULLETHOLES);

      const opacity = invlerp(
        MAX_BULLETHOLES, 
        MAX_BULLETHOLES - threshold, 
        bulletHoles.current.length - index
      );
      
      if (opacity === 0) {
        bh.parent.remove(bh.hole);
        bh.hole.geometry.dispose();
        bulletHoles.current.splice(index, 1);
        return;
      }

      if (bh.hole.material instanceof THREE.Material) {
        if (opacity < bh.hole.material.opacity) {
          bh.hole.material.opacity = opacity;
        }
      }
    });
  }

  return null;
}
