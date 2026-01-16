import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import { nanoid } from "nanoid"
import type { Project, Annotation, ComponentSet } from "@/components/types"
import { COMPONENT_TYPES } from "@/components/types"

// デフォルトのコンポーネントセット
const DEFAULT_COMPONENT_SET: ComponentSet = {
  id: "built-in",
  name: "Built-in",
  components: COMPONENT_TYPES,
  enabled: true,
  isBuiltIn: true,
}

// 初期プロジェクト状態
const initialProject: Project = {
  id: nanoid(),
  imageDataUrl: null,
  imageNaturalWidth: 0,
  imageNaturalHeight: 0,
  annotations: [],
  selectedId: null,
}

// Context の型定義
interface EditorContextType {
  // 状態
  project: Project
  componentSets: ComponentSet[]
  defaultComponentKind: string
  zoom: number
  showInspector: boolean
  showAnnotationList: boolean
  dragOffsets: Map<string, { x: number; y: number }>

  // 計算プロパティ
  componentKinds: string[]
  selectedAnnotation: Annotation | undefined
  rootAnnotations: Annotation[]

  // 状態更新
  setProject: React.Dispatch<React.SetStateAction<Project>>
  setComponentSets: React.Dispatch<React.SetStateAction<ComponentSet[]>>
  setDefaultComponentKind: React.Dispatch<React.SetStateAction<string>>
  setZoom: React.Dispatch<React.SetStateAction<number>>
  setShowInspector: React.Dispatch<React.SetStateAction<boolean>>
  setShowAnnotationList: React.Dispatch<React.SetStateAction<boolean>>
  setDragOffsets: React.Dispatch<React.SetStateAction<Map<string, { x: number; y: number }>>>
}

const EditorContext = createContext<EditorContextType | null>(null)

// Provider コンポーネント
export function EditorProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(initialProject)
  const [componentSets, setComponentSets] = useState<ComponentSet[]>([DEFAULT_COMPONENT_SET])
  const [defaultComponentKind, setDefaultComponentKind] = useState<string>("Button")
  const [zoom, setZoom] = useState(1)
  const [showInspector, setShowInspector] = useState(true)
  const [showAnnotationList, setShowAnnotationList] = useState(true)
  const [dragOffsets, setDragOffsets] = useState<Map<string, { x: number; y: number }>>(new Map())

  // 計算プロパティ
  const componentKinds = componentSets.filter((s) => s.enabled).flatMap((s) => s.components)
  const selectedAnnotation = project.annotations.find((a) => a.id === project.selectedId)
  const rootAnnotations = project.annotations.filter((a) => !a.parentId)

  const value: EditorContextType = {
    project,
    componentSets,
    defaultComponentKind,
    zoom,
    showInspector,
    showAnnotationList,
    dragOffsets,
    componentKinds,
    selectedAnnotation,
    rootAnnotations,
    setProject,
    setComponentSets,
    setDefaultComponentKind,
    setZoom,
    setShowInspector,
    setShowAnnotationList,
    setDragOffsets,
  }

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

// Context を使用するためのフック
export function useEditorContext() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider")
  }
  return context
}
