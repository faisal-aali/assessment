import { type DragEvent } from 'react'
import { NODE_TEMPLATES, type NodeCategory } from '../types/funnel'

const categories = Object.keys(NODE_TEMPLATES) as NodeCategory[]

export default function Sidebar() {
  const onDragStart = (e: DragEvent, category: NodeCategory) => {
    e.dataTransfer.setData('application/funnelnode', category)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="w-60 bg-gray-50 border-r border-gray-200 p-4 flex flex-col" role="complementary" aria-label="Node palette">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Drag to add
      </h2>
      <div className="space-y-2">
        {categories.map((cat) => {
          const tmpl = NODE_TEMPLATES[cat]
          return (
            <div
              key={cat}
              draggable
              onDragStart={(e) => onDragStart(e, cat)}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all select-none"
              role="button"
              tabIndex={0}
              aria-label={`Drag ${tmpl.label} node`}
            >
              <span
                className="w-8 h-8 rounded flex items-center justify-center text-sm"
                style={{ backgroundColor: tmpl.color + '18' }}
              >
                {tmpl.icon}
              </span>
              <span className="text-sm font-medium text-gray-700">{tmpl.label}</span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
