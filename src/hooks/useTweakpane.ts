import { useEffect, useRef, useState } from 'react'
import { Pane } from 'tweakpane'
import type { FolderApi } from '@tweakpane/core'

type TweakpaneConfig = {
  [folder: string]: {
    [param: string]: any
  }
}

interface TweakpaneInputEvent {
  value: any
}

export function useControls(folder: string, config: TweakpaneConfig[string]) {
  const paneRef = useRef<Pane>()
  const [values, setValues] = useState(() => {
    const initial: { [key: string]: any } = {}
    Object.entries(config).forEach(([key, value]) => {
      initial[key] = value.value !== undefined ? value.value : value
    })
    return initial
  })

  useEffect(() => {
    // Create Tweakpane instance if it doesn't exist
    if (!paneRef.current) {
      paneRef.current = new Pane()
    }

    const folderPane = paneRef.current.addFolder({ title: folder })

    // Add controls for each config item
    const bindings = Object.entries(config).map(([key, value]) => {
      const binding = folderPane.addBinding(
        values,
        key,
        value.value !== undefined ? value : undefined
      )

      binding.on('change', (ev: TweakpaneInputEvent) => {
        setValues((prev) => ({
          ...prev,
          [key]: ev.value,
        }))
      })

      return binding
    })

    // Cleanup
    return () => {
      bindings.forEach((binding) => binding.dispose())
      folderPane.dispose()
      if (paneRef.current) {
        paneRef.current.dispose()
      }
    }
  }, [folder, config])

  return values
}
