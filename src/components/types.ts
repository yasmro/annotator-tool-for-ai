export type ComponentKind = string

export type LayoutType = "none" | "box" | "flex" | "grid"

export const LAYOUT_TYPES = [
  { value: "none", label: "なし" },
  { value: "box", label: "Box" },
  { value: "flex", label: "Flex" },
  { value: "grid", label: "Grid" },
] as const

export function isLayoutType(type: LayoutType | undefined): type is "box" | "flex" | "grid" {
  return type === "box" || type === "flex" || type === "grid"
}

export interface FlexLayout {
  direction: "row" | "column"
  justify: "start" | "center" | "end" | "between" | "around"
  align: "start" | "center" | "end" | "stretch"
  gap: number
}

export interface GridLayout {
  columns: number
  rows: number
  gap: number
}

export interface Annotation {
  id: string
  x: number // 0..1 normalized
  y: number // 0..1 normalized
  w: number // 0..1 normalized
  h: number // 0..1 normalized
  componentKind: ComponentKind
  motionInfo: string
  color: string // 枠線の色
  parentId: string | null // 親矩形のID
  children: string[] // 子矩形のIDリスト
  layoutType: LayoutType // レイアウトタイプ
  flexLayout?: FlexLayout // Flexレイアウトの詳細
  gridLayout?: GridLayout // Gridレイアウトの詳細
}

export interface Project {
  id: string
  imageDataUrl: string | null
  imageNaturalWidth: number
  imageNaturalHeight: number
  annotations: Annotation[]
  selectedId: string | null
}

export interface ComponentSet {
  id: string
  name: string
  components: ComponentKind[]
  enabled: boolean
  isBuiltIn: boolean
}

export const COMPONENT_TYPES: ComponentKind[] = [
  "Accordion",
  "Alert",
  "Alert Dialog",
  "Aspect Ratio",
  "Avatar",
  "Badge",
  "Box",
  "Breadcrumb",
  "Button",
  "Button Group",
  "Calendar",
  "Card",
  "Carousel",
  "Chart",
  "Checkbox",
  "Collapsible",
  "Combobox",
  "Command",
  "Context Menu",
  "Data Table",
  "Date Picker",
  "Dialog",
  "Drawer",
  "Dropdown Menu",
  "Empty",
  "Field",
  "Form",
  "Hover Card",
  "Input",
  "Input Group",
  "Input OTP",
  "Item",
  "Kbd",
  "Label",
  "Menubar",
  "Navigation Menu",
  "Pagination",
  "Popover",
  "Progress",
  "Radio Group",
  "Resizable",
  "Scroll Area",
  "Select",
  "Separator",
  "Sheet",
  "Skeleton",
  "Slider",
  "Sonner",
  "Spinner",
  "Switch",
  "Table",
  "Tabs",
  "Textarea",
  "Toast",
  "Toggle",
  "Toggle Group",
  "Tooltip",
  "Other",
]
