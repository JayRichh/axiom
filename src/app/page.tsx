'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { DynamicLoadingScreen } from '../components/ui/DynamicLoadingScreen'

const Scene3D = dynamic(() => import('../components/Scene3D'), {
  ssr: false,
  loading: () => <DynamicLoadingScreen />
})

function ErrorFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Scene3D />
    </ErrorBoundary>
  )
}
