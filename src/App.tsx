import { useCallback, useRef, useMemo } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  type Connection,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import Sidebar from './components/Sidebar'
import FunnelNode from './components/FunnelNode'
import { NODE_TEMPLATES, type NodeCategory, type FunnelNodeData } from './types/funnel'
import { v4 as uuid } from 'uuid'

const nodeTypes = { funnel: FunnelNode }

function generateLabel(category: NodeCategory, existingNodes: Node[]) {
  const base = NODE_TEMPLATES[category].label
  if (category === 'sales' || category === 'order' || category === 'thankyou') {
    const count = existingNodes.filter(
      (n) => (n.data as FunnelNodeData).category === category
    ).length
    return count === 0 ? base : `${base} ${count + 1}`
  }
  // upsell / downsell always get a number
  const count = existingNodes.filter(
    (n) => (n.data as FunnelNodeData).category === category
  ).length
  return `${base} ${count + 1}`
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds))
    },
    [setEdges]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const category = e.dataTransfer.getData('application/funnelnode') as NodeCategory
      if (!category) return

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      const newNode: Node = {
        id: uuid(),
        type: 'funnel',
        position,
        data: {
          label: generateLabel(category, nodes),
          category,
          buttonLabel: NODE_TEMPLATES[category].buttonLabel,
        } satisfies FunnelNodeData,
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition, nodes, setNodes]
  )

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep' as const,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }),
    []
  )

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  )
}
