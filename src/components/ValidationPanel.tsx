import type { ValidationWarning } from '../hooks/useFunnelValidation'

interface Props {
  warnings: ValidationWarning[]
}

export default function ValidationPanel({ warnings }: Props) {
  if (warnings.length === 0) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-amber-50 border border-amber-200 rounded-lg shadow-lg px-4 py-3 max-w-md">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-amber-600 text-sm font-semibold">
          {warnings.length} {warnings.length === 1 ? 'issue' : 'issues'} found
        </span>
      </div>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
            <span className="mt-0.5">•</span>
            <span>{w.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
