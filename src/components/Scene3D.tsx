'use client'

import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Suspense } from 'react'
import { PostProcessing } from './scene/PostProcessing'
import { Console } from './debug/Console'
import { Stats } from './debug/Stats'
import { Scene } from './scene'
import { HUD } from './ui/HUD'
import { Controllers } from '../controllers'
import { Physics } from '@react-three/rapier'
import { PCFSoftShadowMap } from 'three'
import { PHYSICS_FPS } from '../constants'
import { LevaParams } from './debug/Leva'
import { LoadingScreen } from './ui/LoadingScreen'
import { PreloadAssets } from './PreloadAssets'
import { Player } from './player/Player'
import { LightsContextProvider } from '../contexts/LightsContext'

export default function Scene3D() {
  return (
    <>
      <Console/>
      <LevaParams/>
      <HUD/>
      <Canvas shadows={{ type: PCFSoftShadowMap }} gl={{ antialias: false }} dpr={2} onCreated={({ gl }) => {
        gl.shadowMap.autoUpdate = false;
        gl.shadowMap.needsUpdate = false;
      }}>  
        <Suspense fallback={<LoadingScreen/>}>
          <LightsContextProvider>
            <PreloadAssets/>
            <PointerLockControls maxPolarAngle={Math.PI / 1.025} pointerSpeed={0.4}/>
            <Stats/>
            <Physics gravity={[0, -12.81, 0]} timeStep={1/PHYSICS_FPS}>
              <Player />
              <Controllers/>
              <Scene/>
            </Physics>
            <PostProcessing/>
          </LightsContextProvider>
        </Suspense>
      </Canvas>
    </>
  )
}
