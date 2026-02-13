import { useMemo } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { FunnelNodeData } from '../types/funnel'

export interface ValidationWarning {
  nodeId: string
  message: string
}

export function useFunnelValidation(nodes: Node[], edges: Edge[]) {
  const warnings = useMemo(() => {
    const result: ValidationWarning[] = []

    for (const node of nodes) {
      const data = node.data as unknown as FunnelNodeData
      const outgoing = edges.filter((e) => e.source === node.id)
      const incoming = edges.filter((e) => e.target === node.id)

      // sales page should have exactly one outgoing edge
      if (data.category === 'sales' && outgoing.length !== 1) {
        if (outgoing.length === 0) {
          result.push({
            nodeId: node.id,
            message: `${data.label} needs an outgoing connection`,
          })
        } else {
          result.push({
            nodeId: node.id,
            message: `${data.label} should have only 1 outgoing connection`,
          })
        }
      }

      // orphan check — no incoming AND no outgoing (only if more than 1 node exists)
      if (nodes.length > 1 && outgoing.length === 0 && incoming.length === 0) {
        result.push({
          nodeId: node.id,
          message: `${data.label} is disconnected from the funnel`,
        })
      }
    }

    return result
  }, [nodes, edges])

  const warningNodeIds = useMemo(
    () => new Set(warnings.map((w) => w.nodeId)),
    [warnings]
  )

  return { warnings, warningNodeIds }
}
