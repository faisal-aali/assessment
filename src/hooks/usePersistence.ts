import { useCallback } from 'react'
import type { Node, Edge } from '@xyflow/react'

const STORAGE_KEY = 'funnel-builder-state'

interface FunnelState {
  nodes: Node[]
  edges: Edge[]
}

export function usePersistence() {
  const save = useCallback((nodes: Node[], edges: Edge[]) => {
    try {
      const state: FunnelState = { nodes, edges }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.error('Failed to save funnel state:', err)
    }
  }, [])

  const load = useCallback((): FunnelState | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as FunnelState
    } catch (err) {
      console.error('Failed to load funnel state:', err)
      return null
    }
  }, [])

  const exportJSON = useCallback((nodes: Node[], edges: Edge[]) => {
    const state: FunnelState = { nodes, edges }
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'funnel.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const importJSON = useCallback((): Promise<FunnelState | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
          resolve(null)
          return
        }
        try {
          const text = await file.text()
          const state = JSON.parse(text) as FunnelState
          if (!state.nodes || !state.edges) {
            throw new Error('Invalid funnel file')
          }
          resolve(state)
        } catch (err) {
          console.error('Failed to import funnel:', err)
          resolve(null)
        }
      }
      input.click()
    })
  }, [])

  return { save, load, exportJSON, importJSON }
}
