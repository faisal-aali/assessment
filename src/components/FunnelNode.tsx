import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NODE_TEMPLATES, type FunnelNodeData } from '../types/funnel'

type Props = NodeProps & { data: FunnelNodeData }

export default function FunnelNode({ data }: Props) {
  const template = NODE_TEMPLATES[data.category]
  const isThankYou = data.category === 'thankyou'

  return (
    <div
      className="bg-white rounded-xl shadow-md border-2 w-48 overflow-hidden"
      style={{ borderColor: template.color }}
    >
      {/* incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* header */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: template.color + '12' }}
      >
        <span className="text-base">{template.icon}</span>
        <span className="text-sm font-semibold text-gray-800 truncate">{data.label}</span>
      </div>

      {/* body */}
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

      {/* outgoing handle - not on thank you pages */}
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
