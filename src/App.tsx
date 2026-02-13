import { useCallback, useRef, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import Sidebar from './components/Sidebar'
import FunnelNode from './components/FunnelNode'
import CustomEdge from './components/CustomEdge'
import Toolbar from './components/Toolbar'
import ValidationPanel from './components/ValidationPanel'
import EmptyCanvas from './components/EmptyCanvas'
import { ValidationProvider } from './context/ValidationContext'
import { useFunnelValidation } from './hooks/useFunnelValidation'
import { usePersistence } from './hooks/usePersistence'
import { useUndoRedo } from './hooks/useUndoRedo'
import { NODE_TEMPLATES, type NodeCategory, type FunnelNodeData } from './types/funnel'
import { v4 as uuid } from 'uuid'

const nodeTypes = { funnel: FunnelNode }
const edgeTypes = { custom: CustomEdge }

function getNodeData(node: Node): FunnelNodeData {
  return node.data as unknown as FunnelNodeData
}

function generateLabel(category: NodeCategory, existingNodes: Node[]) {
  const base = NODE_TEMPLATES[category].label
  if (category === 'sales' || category === 'order' || category === 'thankyou') {
    const count = existingNodes.filter(
      (n) => getNodeData(n).category === category
    ).length
    return count === 0 ? base : `${base} ${count + 1}`
  }
  const count = existingNodes.filter(
    (n) => getNodeData(n).category === category
  ).length
  return `${base} ${count + 1}`
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const { warnings, warningNodeIds } = useFunnelValidation(nodes, edges)
  const { save, load, exportJSON, importJSON } = usePersistence()
  const { takeSnapshot, undo, redo } = useUndoRedo()

  // load saved state on mount
  useEffect(() => {
    const saved = load()
    if (saved) {
      setNodes(saved.nodes as Node[])
      setEdges(saved.edges as Edge[])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        save(nodes, edges)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [nodes, edges, save])

  // keyboard shortcuts for undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo(nodes, edges, (n) => setNodes(n as Node[]), (e) => setEdges(e as Edge[]))
        } else {
          undo(nodes, edges, (n) => setNodes(n as Node[]), (e) => setEdges(e as Edge[]))
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nodes, edges, setNodes, setEdges, undo, redo])

  const handleNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      const hasStructuralChange = changes.some(
        (c) => c.type === 'remove' || c.type === 'add'
      )
      if (hasStructuralChange) {
        takeSnapshot(nodes, edges)
      }
      onNodesChange(changes)
    },
    [onNodesChange, takeSnapshot, nodes, edges]
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const hasStructuralChange = changes.some(
        (c) => c.type === 'remove' || c.type === 'add'
      )
      if (hasStructuralChange) {
        takeSnapshot(nodes, edges)
      }
      onEdgesChange(changes)
    },
    [onEdgesChange, takeSnapshot, nodes, edges]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const exists = edges.some(
        (e) => e.source === params.source && e.target === params.target
      )
      if (exists) return

      takeSnapshot(nodes, edges)
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
    [setEdges, edges, nodes, takeSnapshot]
  )

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (connection.source === connection.target) return false

      const sourceNode = nodes.find((n) => n.id === connection.source)
      if (!sourceNode) return false

      const sourceData = getNodeData(sourceNode)
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

      takeSnapshot(nodes, edges)

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

      setNodes((nds) => [...nds, newNode])
    },
    [screenToFlowPosition, nodes, edges, setNodes, takeSnapshot]
  )

  const handleExport = useCallback(() => {
    exportJSON(nodes, edges)
  }, [nodes, edges, exportJSON])

  const handleImport = useCallback(async () => {
    const state = await importJSON()
    if (state) {
      takeSnapshot(nodes, edges)
      setNodes(state.nodes as Node[])
      setEdges(state.edges as Edge[])
    }
  }, [importJSON, setNodes, setEdges, nodes, edges, takeSnapshot])

  const handleClear = useCallback(() => {
    takeSnapshot(nodes, edges)
    setNodes([])
    setEdges([])
    localStorage.removeItem('funnel-builder-state')
  }, [setNodes, setEdges, nodes, edges, takeSnapshot])

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'custom' as const,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    }),
    []
  )

  const handleAddFromSidebar = useCallback(
    (category: NodeCategory) => {
      takeSnapshot(nodes, edges)
      const newNode: Node = {
        id: uuid(),
        type: 'funnel',
        position: { x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 },
        data: {
          label: generateLabel(category, nodes),
          category,
          buttonLabel: NODE_TEMPLATES[category].buttonLabel,
        } satisfies FunnelNodeData,
      }
      setNodes((nds) => [...nds, newNode])
    },
    [nodes, edges, setNodes, takeSnapshot]
  )

  const minimapNodeColor = useCallback((node: Node) => {
    const data = getNodeData(node)
    return NODE_TEMPLATES[data.category]?.color ?? '#94a3b8'
  }, [])

  return (
    <ValidationProvider value={warningNodeIds}>
      <div className="flex h-screen">
        <Sidebar onAddNode={handleAddFromSidebar} />
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
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
            snapToGrid
            snapGrid={[20, 20]}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={minimapNodeColor}
              nodeStrokeWidth={3}
              zoomable
              pannable
              className="!bg-gray-50 !border-gray-200"
            />
          </ReactFlow>
          {nodes.length === 0 && <EmptyCanvas />}
          <Toolbar
            onExport={handleExport}
            onImport={handleImport}
            onClear={handleClear}
            nodeCount={nodes.length}
          />
          <ValidationPanel warnings={warnings} />
        </div>
      </div>
    </ValidationProvider>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  )
}
