export default function EmptyCanvas() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="text-center">
        <div className="text-4xl mb-3 opacity-40">🔗</div>
        <p className="text-gray-400 text-sm font-medium">
          Drag nodes from the sidebar to start building your funnel
        </p>
        <p className="text-gray-300 text-xs mt-1">
          Connect them by dragging from one handle to another
        </p>
      </div>
    </div>
  )
}
