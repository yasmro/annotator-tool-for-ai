import { useState, useCallback, type RefObject } from "react"
import type React from "react"

import { useEditorContext } from "@/contexts/editor-context"
import { useAnnotations } from "./use-annotations"

interface DragSelection {
  isDrawing: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export function useCanvas(containerRef: RefObject<HTMLDivElement | null>) {
  const { project, zoom, setZoom } = useEditorContext()
  const { addAnnotation, selectAnnotation, isPointOnAnnotation } = useAnnotations()

  const [dragSelection, setDragSelection] = useState<DragSelection>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  })

  // ホイールでズーム
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)))
      }
    },
    [setZoom],
  )

  // キャンバス上でマウスダウン
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()

      const x = (e.clientX - rect.left + container.scrollLeft) / zoom
      const y = (e.clientY - rect.top + container.scrollTop) / zoom

      const hitAnnotationId = isPointOnAnnotation(x, y)

      if (hitAnnotationId) {
        selectAnnotation(hitAnnotationId)
      } else {
        setDragSelection({
          isDrawing: true,
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
        })
      }
    },
    [zoom, isPointOnAnnotation, selectAnnotation, containerRef],
  )

  // キャンバス上でマウス移動
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dragSelection.isDrawing || !containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()

      const x = Math.max(0, Math.min((e.clientX - rect.left + container.scrollLeft) / zoom, project.imageNaturalWidth))
      const y = Math.max(0, Math.min((e.clientY - rect.top + container.scrollTop) / zoom, project.imageNaturalHeight))

      setDragSelection((prev) => ({
        ...prev,
        currentX: x,
        currentY: y,
      }))
    },
    [dragSelection.isDrawing, zoom, project.imageNaturalWidth, project.imageNaturalHeight, containerRef],
  )

  // キャンバス上でマウスアップ
  const handleCanvasMouseUp = useCallback(() => {
    if (!dragSelection.isDrawing) return

    const minX = Math.min(dragSelection.startX, dragSelection.currentX)
    const minY = Math.min(dragSelection.startY, dragSelection.currentY)
    const maxX = Math.max(dragSelection.startX, dragSelection.currentX)
    const maxY = Math.max(dragSelection.startY, dragSelection.currentY)

    const width = maxX - minX
    const height = maxY - minY

    if (width > 10 && height > 10) {
      const normalizedX = minX / project.imageNaturalWidth
      const normalizedY = minY / project.imageNaturalHeight
      const normalizedW = width / project.imageNaturalWidth
      const normalizedH = height / project.imageNaturalHeight

      addAnnotation(normalizedX, normalizedY, normalizedW, normalizedH)
    }

    setDragSelection({
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    })
  }, [dragSelection, project.imageNaturalWidth, project.imageNaturalHeight, addAnnotation])

  return {
    dragSelection,
    handleWheel,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  }
}
