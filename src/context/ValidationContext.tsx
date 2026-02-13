import { createContext, useContext } from 'react'

const ValidationContext = createContext<Set<string>>(new Set())

export const ValidationProvider = ValidationContext.Provider

export function useWarningStatus(nodeId: string) {
  const warningIds = useContext(ValidationContext)
  return warningIds.has(nodeId)
}
