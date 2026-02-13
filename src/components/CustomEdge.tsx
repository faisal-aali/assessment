import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
  EdgeLabelRenderer,
} from '@xyflow/react'

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#94a3b8',
          strokeWidth: 2,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="bg-white px-2 py-0.5 rounded text-xs text-gray-500 border border-gray-200 shadow-sm"
          >
            {data.label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
