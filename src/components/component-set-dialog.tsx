import { useState, useRef } from "react"
import { nanoid } from "nanoid"
import { Plus, Upload, Trash2, Settings2, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useEditorContext } from "@/contexts/editor-context"
import { useLanguage } from "@/contexts/language-context"
import type { ComponentSet } from "@/components/types"

interface StorybookIndexJson {
  v: number
  entries: Record<string, {
    type: "story" | "docs"
    id: string
    name: string
    title: string
    tags?: string[]
  }>
}

interface ComponentsJson {
  components: Array<{
    name: string
    category?: string
  }> | Record<string, string[]>
}

function parseStorybookIndex(json: StorybookIndexJson): string[] {
  const components = new Set<string>()

  for (const entry of Object.values(json.entries)) {
    if (entry.type === "story" || entry.type === "docs") {
      // title は "Category/ComponentName" の形式
      const parts = entry.title.split("/")
      const componentName = parts[parts.length - 1]
      if (componentName) {
        components.add(componentName)
      }
    }
  }

  return Array.from(components).sort()
}

function parseComponentsJson(json: ComponentsJson): string[] {
  if (Array.isArray(json.components)) {
    return json.components.map(c => c.name).sort()
  }

  // Record<category, components[]> 形式
  if (typeof json.components === "object") {
    const components = new Set<string>()
    for (const categoryComponents of Object.values(json.components)) {
      for (const name of categoryComponents) {
        components.add(name)
      }
    }
    return Array.from(components).sort()
  }

  // トップレベルがカテゴリのオブジェクト
  const components = new Set<string>()
  for (const [, value] of Object.entries(json)) {
    if (Array.isArray(value)) {
      for (const name of value) {
        if (typeof name === "string") {
          components.add(name)
        }
      }
    }
  }
  return Array.from(components).sort()
}

function parseJsonFile(json: unknown): string[] {
  // Storybook index.json 形式を検出
  if (typeof json === "object" && json !== null && "v" in json && "entries" in json) {
    return parseStorybookIndex(json as StorybookIndexJson)
  }
  // components.json 形式
  if (typeof json === "object" && json !== null && "components" in json) {
    return parseComponentsJson(json as ComponentsJson)
  }
  // カテゴリ別オブジェクト形式
  if (typeof json === "object" && json !== null && !Array.isArray(json)) {
    return parseComponentsJson(json as ComponentsJson)
  }
  // 配列形式
  if (Array.isArray(json)) {
    return json
      .map(item => (typeof item === "string" ? item : item.name))
      .filter(Boolean)
      .sort()
  }
  return []
}

export function ComponentSetDialog() {
  const { t } = useLanguage()
  const { componentSets, setComponentSets } = useEditorContext()
  const [open, setOpen] = useState(false)
  const [newSetName, setNewSetName] = useState("")
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const [importingSetId, setImportingSetId] = useState<string | null>(null)

  const handleToggleSet = (setId: string, enabled: boolean) => {
    setComponentSets(prev =>
      prev.map(s => (s.id === setId ? { ...s, enabled } : s))
    )
  }

  const handleDeleteSet = (setId: string) => {
    setComponentSets(prev => prev.filter(s => s.id !== setId))
  }

  const handleAddSet = () => {
    if (!newSetName.trim()) return

    const newSet: ComponentSet = {
      id: nanoid(),
      name: newSetName.trim(),
      components: [],
      enabled: true,
      isBuiltIn: false,
    }

    setComponentSets(prev => [...prev, newSet])
    setNewSetName("")
  }

  const handleImportClick = (setId: string) => {
    setImportingSetId(setId)
    setImportError(null)
    setImportSuccess(null)
    fileInputRef.current?.click()
  }

  const handleNewImportClick = () => {
    setImportError(null)
    setImportSuccess(null)
    newFileInputRef.current?.click()
  }

  // 既存セットへのインポート
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !importingSetId) return

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const components = parseJsonFile(json)

      if (components.length === 0) {
        setImportError(t.noComponentsFound)
        return
      }

      setComponentSets(prev =>
        prev.map(s =>
          s.id === importingSetId
            ? { ...s, components: [...new Set([...s.components, ...components])] }
            : s
        )
      )

      setImportError(null)
      setImportSuccess(`${components.length} ${t.componentsImported}`)
    } catch {
      setImportError(t.invalidJsonFormat)
    } finally {
      e.target.value = ""
      setImportingSetId(null)
    }
  }

  // 新規セット作成 + インポート
  const handleNewFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const components = parseJsonFile(json)

      if (components.length === 0) {
        setImportError(t.noComponentsFound)
        return
      }

      // ファイル名からセット名を生成（拡張子を除く）
      const setName = file.name.replace(/\.json$/i, "")

      const newSet: ComponentSet = {
        id: nanoid(),
        name: setName,
        components,
        enabled: true,
        isBuiltIn: false,
      }

      setComponentSets(prev => [...prev, newSet])
      setImportError(null)
      setImportSuccess(`"${setName}" ${t.setCreatedWith} ${components.length} ${t.components}`)
    } catch {
      setImportError(t.invalidJsonFormat)
    } finally {
      e.target.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="size-8">
          <Settings2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.componentSetSettings}</DialogTitle>
          <DialogDescription>
            {t.componentSetDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* JSONインポートボタン（新規セット作成） */}
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50"
            onClick={handleNewImportClick}
          >
            <FileJson className="size-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">{t.importJson}</p>
              <p className="text-xs text-muted-foreground">
                Storybook index.json / components.json
              </p>
            </div>
          </div>

          {/* 成功メッセージ */}
          {importSuccess && (
            <div className="rounded-md bg-green-500/10 p-2 text-sm text-green-600 dark:text-green-400">
              {importSuccess}
            </div>
          )}

          {/* エラーメッセージ */}
          {importError && (
            <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              {importError}
            </div>
          )}

          {/* 既存のセット一覧 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t.componentSets}</Label>
            {componentSets.map(set => (
              <div
                key={set.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={set.enabled}
                    onCheckedChange={(checked) => handleToggleSet(set.id, checked)}
                  />
                  <div>
                    <div className="font-medium">{set.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {set.components.length} {t.components}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!set.isBuiltIn && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleImportClick(set.id)}
                        title={t.addComponents}
                      >
                        <Upload className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSet(set.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 手動で新規セット追加 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t.createEmptySet}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="new-set-name" className="sr-only">
                  {t.newSetName}
                </Label>
                <Input
                  id="new-set-name"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder={t.newSetPlaceholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSet()
                    }
                  }}
                />
              </div>
              <Button onClick={handleAddSet} disabled={!newSetName.trim()}>
                <Plus className="mr-1 size-4" />
                {t.add}
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileImport}
        />
        <input
          ref={newFileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleNewFileImport}
        />
      </DialogContent>
    </Dialog>
  )
}
