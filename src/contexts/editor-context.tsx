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

// デフォルトの実装要件
export const DEFAULT_REQUIREMENTS = `1. **コンポーネントの階層**: 上記の注釈の階層構造に基づいて、適切なコンポーネント構造を作成してください。
2. **レイアウトコンテナ**:
   - **Box**: 基本的なコンテナ要素。子要素を配置可能ですが、特定のレイアウトロジックは持ちません
   - **Flex**: Flexboxを使用した柔軟なレイアウト。方向、配置、間隔の指定に従ってください
   - **Grid**: CSS Gridを使用したグリッドレイアウト。カラム数、行数、間隔の指定に従ってください
   - 通常のコンポーネント（Button、Input等）は子要素を持ちません
   - 子要素は必ず親要素の中に配置してください
3. **アクセシビリティ**: ARIA属性、キーボードナビゲーション、スクリーンリーダー対応を含めてください。
4. **スタイリング**:
   - Tailwind CSSを使用してください
   - レスポンシブデザインに対応してください
   - 注釈で指定されたモーション効果を実装してください
   - Flexbox/Gridのプロパティは注釈の詳細設定に基づいて適用してください
5. **ファイル構造**:
   - コンポーネントは \`components/\` フォルダに配置してください
   - ページは \`app/\` フォルダに配置してください
   - ユーティリティ関数は \`lib/\` フォルダに配置してください`

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
  customRequirements: string

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
  setCustomRequirements: React.Dispatch<React.SetStateAction<string>>
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
  const [customRequirements, setCustomRequirements] = useState<string>(DEFAULT_REQUIREMENTS)

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
    customRequirements,
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
    setCustomRequirements,
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
