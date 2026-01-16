import { useCallback } from "react"
import { useEditorContext } from "@/contexts/editor-context"
import { generatePrompt } from "@/lib/prompt"
import { downloadText, downloadJson } from "@/lib/download"

export function useExport() {
  const { project } = useEditorContext()

  const handleExport = useCallback(() => {
    const prompt = generatePrompt(project.annotations, "image.png")
    downloadText(prompt, "prompt.md")
    downloadJson(project.annotations, "annotations.json")
  }, [project.annotations])

  return {
    handleExport,
  }
}
