interface Props {
  onExport: () => void
  onImport: () => void
  onClear: () => void
  nodeCount: number
}

export default function Toolbar({ onExport, onImport, onClear, nodeCount }: Props) {
  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
      <span className="text-xs text-gray-400 mr-2">
        {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
      </span>
      <button
        onClick={onImport}
        className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        aria-label="Import funnel from JSON file"
      >
        Import JSON
      </button>
      <button
        onClick={onExport}
        className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        aria-label="Export funnel as JSON file"
      >
        Export JSON
      </button>
      {nodeCount > 0 && (
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
          aria-label="Clear canvas"
        >
          Clear
        </button>
      )}
    </div>
  )
}
