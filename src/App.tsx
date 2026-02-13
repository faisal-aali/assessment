import { useCallback, useRef, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  type Connection,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import Sidebar from './components/Sidebar'
import FunnelNode from './components/FunnelNode'
import CustomEdge from './components/CustomEdge'
import ValidationPanel from './components/ValidationPanel'
import { useFunnelValidation } from './hooks/useFunnelValidation'
import { NODE_TEMPLATES, type NodeCategory, type FunnelNodeData } from './types/funnel'
import { v4 as uuid } from 'uuid'

const nodeTypes = { funnel: FunnelNode }
const edgeTypes = { custom: CustomEdge }

function generateLabel(category: NodeCategory, existingNodes: Node[]) {
  const base = NODE_TEMPLATES[category].label
  if (category === 'sales' || category === 'order' || category === 'thankyou') {
    const count = existingNodes.filter(
      (n) => (n.data as FunnelNodeData).category === category
    ).length
    return count === 0 ? base : `${base} ${count + 1}`
  }
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

  const { warnings, warningNodeIds } = useFunnelValidation(nodes, edges)

  // update node data with warning flags whenever validation changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          hasWarning: warningNodeIds.has(node.id),
        },
      }))
    )
  }, [warningNodeIds, setNodes])

  const onConnect = useCallback(
    (params: Connection) => {
      const exists = edges.some(
        (e) => e.source === params.source && e.target === params.target
      )
      if (exists) return

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'custom',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          },
          eds
        )
      )
    },
    [setEdges, edges]
  )

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return false

      const sourceNode = nodes.find((n) => n.id === connection.source)
      if (!sourceNode) return false

      const sourceData = sourceNode.data as FunnelNodeData
      if (sourceData.category === 'thankyou') return false

      return true
    },
    [nodes]
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
      type: 'custom' as const,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    }),
    []
  )

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          isValidConnection={isValidConnection}
          fitView
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
          <Controls />
        </ReactFlow>
        <ValidationPanel warnings={warnings} />
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
