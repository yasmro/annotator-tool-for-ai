import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "ja"

type TranslationKeys = {
  appTitle: string
  export: string
  addRectangle: string
  preset: string
  component: string
  annotations: string
  inspector: string
  uploadTitle: string
  uploadHint: string
  selectImage: string
  noAnnotations: string
  layoutType: string
  componentType: string
  layoutContainer: string
  selectComponent: string
  motionInfo: string
  motionPlaceholder: string
  xPosition: string
  yPosition: string
  width: string
  height: string
  parentElement: string
  none: string
  borderColor: string
  flexboxProperties: string
  direction: string
  horizontal: string
  vertical: string
  justifyContent: string
  alignItems: string
  gap: string
  gridProperties: string
  columns: string
  rows: string
  duplicate: string
  delete: string
  selectAnnotation: string
  searchPlaceholder: string
  noComponentFound: string
}

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Header
    appTitle: "Image Annotation Editor",
    export: "Export",

    // Toolbar
    addRectangle: "Add Rectangle",
    preset: "Preset",
    component: "Component",
    annotations: "Annotations",
    inspector: "Inspector",

    // Upload
    uploadTitle: "Upload an image to get started",
    uploadHint: "Click or drag & drop",
    selectImage: "Select Image",

    // Annotation List
    noAnnotations: "No annotations",

    // Inspector
    layoutType: "Layout Type",
    componentType: "Component Type",
    layoutContainer: "Box (Layout Container)",
    selectComponent: "Select component",
    motionInfo: "Motion / Interaction Info",
    motionPlaceholder: "e.g., Scale on hover, open modal on click...",
    xPosition: "X Position",
    yPosition: "Y Position",
    width: "Width",
    height: "Height",
    parentElement: "Parent Element",
    none: "None",
    borderColor: "Border Color",

    // Flexbox
    flexboxProperties: "Flexbox Properties",
    direction: "Direction",
    horizontal: "Horizontal (row)",
    vertical: "Vertical (column)",
    justifyContent: "Justify Content",
    alignItems: "Align Items",
    gap: "Gap",

    // Grid
    gridProperties: "Grid Properties",
    columns: "Columns",
    rows: "Rows",

    // Actions
    duplicate: "Duplicate",
    delete: "Delete",
    selectAnnotation: "Select an annotation",

    // Combobox
    searchPlaceholder: "Search...",
    noComponentFound: "No component found",
  },
  ja: {
    // Header
    appTitle: "画像注釈エディター",
    export: "エクスポート",

    // Toolbar
    addRectangle: "矩形を追加",
    preset: "プリセット",
    component: "コンポーネント",
    annotations: "注釈一覧",
    inspector: "インスペクター",

    // Upload
    uploadTitle: "画像をアップロードして開始",
    uploadHint: "クリックまたはドラッグ&ドロップ",
    selectImage: "画像を選択",

    // Annotation List
    noAnnotations: "注釈がありません",

    // Inspector
    layoutType: "レイアウトタイプ",
    componentType: "コンポーネント種類",
    layoutContainer: "Box (レイアウトコンテナ)",
    selectComponent: "コンポーネントを選択",
    motionInfo: "モーション・動作情報",
    motionPlaceholder: "例: ホバー時に拡大、クリックでモーダルを開く...",
    xPosition: "X位置",
    yPosition: "Y位置",
    width: "幅",
    height: "高さ",
    parentElement: "親要素",
    none: "なし",
    borderColor: "枠線の色",

    // Flexbox
    flexboxProperties: "Flexboxプロパティ",
    direction: "方向",
    horizontal: "横 (row)",
    vertical: "縦 (column)",
    justifyContent: "主軸の配置",
    alignItems: "交差軸の配置",
    gap: "間隔 (gap)",

    // Grid
    gridProperties: "Gridプロパティ",
    columns: "カラム数",
    rows: "行数",

    // Actions
    duplicate: "複製",
    delete: "削除",
    selectAnnotation: "注釈を選択してください",

    // Combobox
    searchPlaceholder: "検索...",
    noComponentFound: "コンポーネントが見つかりません",
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export const LAYOUT_TYPES_I18N = {
  en: [
    { value: "none", label: "None" },
    { value: "box", label: "Box" },
    { value: "flex", label: "Flex" },
    { value: "grid", label: "Grid" },
  ],
  ja: [
    { value: "none", label: "なし" },
    { value: "box", label: "Box" },
    { value: "flex", label: "Flex" },
    { value: "grid", label: "Grid" },
  ],
} as const
