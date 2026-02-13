import { type DragEvent, type KeyboardEvent } from 'react'
import { NODE_TEMPLATES, type NodeCategory } from '../types/funnel'

const categories = Object.keys(NODE_TEMPLATES) as NodeCategory[]

interface Props {
  onAddNode?: (category: NodeCategory) => void
}

export default function Sidebar({ onAddNode }: Props) {
  const onDragStart = (e: DragEvent, category: NodeCategory) => {
    e.dataTransfer.setData('application/funnelnode', category)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleKeyDown = (e: KeyboardEvent, category: NodeCategory) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onAddNode?.(category)
    }
  }

  return (
    <aside
      className="w-60 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0"
      role="complementary"
      aria-label="Node palette"
    >
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-sm font-bold text-gray-800">Funnel Builder</h1>
        <p className="text-xs text-gray-400 mt-0.5">Drag & drop to create</p>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Page Types
        </h2>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const tmpl = NODE_TEMPLATES[cat]
            return (
              <div
                key={cat}
                draggable
                onDragStart={(e) => onDragStart(e, cat)}
                onKeyDown={(e) => handleKeyDown(e, cat)}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all select-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                role="button"
                tabIndex={0}
                aria-label={`Add ${tmpl.label} node. Drag to canvas or press Enter to place.`}
              >
                <span
                  className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: tmpl.color + '18' }}
                  aria-hidden="true"
                >
                  {tmpl.icon}
                </span>
                <div className="min-w-0">
                  <span className="text-sm font-medium text-gray-700 block">{tmpl.label}</span>
                  <span className="text-[10px] text-gray-400">{tmpl.buttonLabel}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-3 border-t border-gray-200">
        <div className="text-[10px] text-gray-400 space-y-0.5">
          <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">⌘Z</kbd> Undo</p>
          <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">⌘⇧Z</kbd> Redo</p>
          <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">Del</kbd> Remove selected</p>
        </div>
      </div>
    </aside>
  )
}
