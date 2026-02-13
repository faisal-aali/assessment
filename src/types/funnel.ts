export type NodeCategory = 'sales' | 'order' | 'upsell' | 'downsell' | 'thankyou'

export interface FunnelNodeData {
  label: string
  category: NodeCategory
  buttonLabel: string
}

export const NODE_TEMPLATES: Record<NodeCategory, { label: string; buttonLabel: string; color: string; icon: string }> = {
  sales: {
    label: 'Sales Page',
    buttonLabel: 'Buy Now',
    color: '#3b82f6',
    icon: '📄',
  },
  order: {
    label: 'Order Page',
    buttonLabel: 'Complete Order',
    color: '#10b981',
    icon: '🛒',
  },
  upsell: {
    label: 'Upsell',
    buttonLabel: 'Yes, Add This!',
    color: '#f59e0b',
    icon: '⬆️',
  },
  downsell: {
    label: 'Downsell',
    buttonLabel: 'Get This Instead',
    color: '#ef4444',
    icon: '⬇️',
  },
  thankyou: {
    label: 'Thank You',
    buttonLabel: 'Go to Dashboard',
    color: '#8b5cf6',
    icon: '✅',
  },
}
