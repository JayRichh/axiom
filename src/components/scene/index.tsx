import { Ground } from './Ground'
import { Box } from './Box'
import { Barrel } from './Barrel'
import { Environment, Sky } from '@react-three/drei'
import { Euler, PointLight } from 'three'
import { useWorldState } from '../../state/worldState'
import { lerp } from '../../helpers'
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

const lights = new Array(10).fill(null).map(() => new PointLight(`hsl(${0}, 100%, 50%)`, 2, 2));
lights.forEach(light => { 
  light.position.set(-25 + Math.random() * 50, 2, -25 + Math.random() * 50);
});

export function Scene() {
  const time = useWorldState(state => state.time);
  const { gl, scene } = useThree();

  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
    gl.shadowMap.autoUpdate = true;
  }, [time]);
  
  useEffect(() => {
    lights.forEach(light => {
      scene.add(light);
    });
  }, []);

  return <>
    <Sky 
      distance={450000} 
      sunPosition={[0, Math.sin(time * Math.PI) * 100, -100]} 
      inclination={0.5} 
      azimuth={0.25} 
    />
    
    <directionalLight 
      intensity={lerp(0.01, 1, time)} 
      position={[-150, lerp(50, 400, time), lerp(-40, -205, time)]} 
      castShadow 
      shadow-camera-near={0} 
      shadow-camera-far={600}
      shadow-camera-left={-25}
      shadow-camera-right={25}
      shadow-camera-bottom={-25}
      shadow-camera-top={25}
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-bias={0.00002}
    />
    
    <fog attach="fog" args={[`hsl(217.5, 7.08%, ${lerp(7, 42, time)}%)`, 0, 400]}/>
    <pointLight args={['#ff7', time > 0.15 ? 0 : 1, 7, 1]} position={[0, 3.4, -4]}/>
    
    <Ground />
    <Box position={[2.5, 0.25, -2.5]} rotation={[0, Math.PI / 4, 0]} scale={0.5}/>
    <Box position={[5.5, -0.185, -2.375]} rotation={[Math.PI / 3, 0, 0]}/>
    <Box position={[4.5, 0, -2.505]} rotation={[Math.PI / 4, 0, 0]}/>
    <Box position={[6.5, -0.27, -2.45]} rotation={[Math.PI / 8, 0, 0]}/>
    <Box position={[2.5, 0.5, -4.5]}/>
    <Box position={[2.5, 0.5, -7.5]}/>
    <Box position={[-4.5, 2, -7.5]} scale={4}/>
    
    <Barrel position={[0, 0, -20]}/>
    <Barrel position={[-1, 0, -26]}/>
    <Barrel position={[-2, 0, -14]}/>
  </>
}
