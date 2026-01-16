import { useCallback } from "react"
import type React from "react"

import { useEditorContext } from "@/contexts/editor-context"

export function useImage() {
  const { setProject } = useEditorContext()

  // 画像をアップロード
  const uploadImage = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        const img = new Image()
        img.onload = () => {
          setProject((prev) => ({
            ...prev,
            imageDataUrl: dataUrl,
            imageNaturalWidth: img.naturalWidth,
            imageNaturalHeight: img.naturalHeight,
            annotations: [],
            selectedId: null,
          }))
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    },
    [setProject],
  )

  // ファイル入力イベントハンドラ
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      uploadImage(file)
      if (e.target) {
        e.target.value = ""
      }
    },
    [uploadImage],
  )

  // ドラッグ&ドロップイベントハンドラ
  const handleImageDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (!file || !file.type.startsWith("image/")) return
      uploadImage(file)
    },
    [uploadImage],
  )

  return {
    uploadImage,
    handleImageUpload,
    handleImageDrop,
  }
}
