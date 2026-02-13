import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NODE_TEMPLATES, type FunnelNodeData } from '../types/funnel'
import { useWarningStatus } from '../context/ValidationContext'

type Props = NodeProps & { data: FunnelNodeData }

export default function FunnelNode({ id, data }: Props) {
  const template = NODE_TEMPLATES[data.category]
  const isThankYou = data.category === 'thankyou'
  const hasWarning = useWarningStatus(id)

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-2 w-48 overflow-hidden transition-shadow ${
        hasWarning ? 'ring-2 ring-amber-400 ring-offset-1' : ''
      }`}
      style={{ borderColor: template.color }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: template.color + '12' }}
      >
        <span className="text-base" aria-hidden="true">{template.icon}</span>
        <span className="text-sm font-semibold text-gray-800 truncate flex-1">{data.label}</span>
        {hasWarning && (
          <span className="text-amber-500 text-sm" title="This node has a warning" aria-label="Warning">⚠️</span>
        )}
      </div>

      <div className="px-3 py-3">
        <div className="w-full h-16 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
          <span className="text-xs text-gray-400">Page preview</span>
        </div>
        <div
          className="text-xs text-center py-1.5 rounded-md font-medium text-white"
          style={{ backgroundColor: template.color }}
        >
          {data.buttonLabel}
        </div>
      </div>

      {!isThankYou && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}
    </div>
  )
}
