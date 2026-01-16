import { useCallback } from "react"
import { nanoid } from "nanoid"
import type { Annotation } from "@/components/types"
import { isLayoutType } from "@/components/types"
import { useEditorContext } from "@/contexts/editor-context"

export function useAnnotations() {
  const { project, setProject, defaultComponentKind, dragOffsets } = useEditorContext()

  // 注釈の絶対座標を取得（ドラッグオフセットを考慮）
  const getAbsolutePosition = useCallback(
    (annotation: Annotation): { x: number; y: number; w: number; h: number } => {
      if (!annotation.parentId) {
        const offset = dragOffsets.get(annotation.id)
        if (offset) {
          return {
            x: annotation.x + offset.x,
            y: annotation.y + offset.y,
            w: annotation.w,
            h: annotation.h,
          }
        }
        return { x: annotation.x, y: annotation.y, w: annotation.w, h: annotation.h }
      }

      const parent = project.annotations.find((a) => a.id === annotation.parentId)
      if (!parent) {
        return { x: annotation.x, y: annotation.y, w: annotation.w, h: annotation.h }
      }

      const getParentAbsPos = (p: Annotation): { x: number; y: number; w: number; h: number } => {
        if (!p.parentId) {
          const offset = dragOffsets.get(p.id)
          if (offset) {
            return { x: p.x + offset.x, y: p.y + offset.y, w: p.w, h: p.h }
          }
          return { x: p.x, y: p.y, w: p.w, h: p.h }
        }
        const grandParent = project.annotations.find((a) => a.id === p.parentId)
        if (!grandParent) {
          return { x: p.x, y: p.y, w: p.w, h: p.h }
        }
        const gpPos = getParentAbsPos(grandParent)
        return {
          x: gpPos.x + p.x,
          y: gpPos.y + p.y,
          w: p.w,
          h: p.h,
        }
      }

      const parentPos = getParentAbsPos(parent)
      return {
        x: parentPos.x + annotation.x,
        y: parentPos.y + annotation.y,
        w: annotation.w,
        h: annotation.h,
      }
    },
    [project.annotations, dragOffsets],
  )

  // 注釈の階層深度を取得
  const getAnnotationDepth = useCallback(
    (annotation: Annotation): number => {
      if (!annotation.parentId) return 0
      const parent = project.annotations.find((a) => a.id === annotation.parentId)
      if (!parent) return 0
      return 1 + getAnnotationDepth(parent)
    },
    [project.annotations],
  )

  // 階層構造でソートされた注釈を取得
  const getHierarchicalAnnotations = useCallback(() => {
    const result: { annotation: Annotation; depth: number }[] = []
    const rootAnnotations = project.annotations.filter((a) => !a.parentId)

    const addWithChildren = (annotation: Annotation, depth: number) => {
      result.push({ annotation, depth })
      const children = project.annotations.filter((a) => a.parentId === annotation.id)
      for (const child of children) {
        addWithChildren(child, depth + 1)
      }
    }

    for (const root of rootAnnotations) {
      addWithChildren(root, 0)
    }

    return result
  }, [project.annotations])

  // 矩形を追加
  const addAnnotation = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const newRect: Annotation = {
        id: nanoid(),
        x,
        y,
        w,
        h,
        componentKind: defaultComponentKind,
        motionInfo: "",
        color: "#3b82f6",
        parentId: null,
        children: [],
        layoutType: "none",
      }

      setProject((prev) => ({
        ...prev,
        annotations: [...prev.annotations, newRect],
        selectedId: newRect.id,
      }))

      return newRect
    },
    [defaultComponentKind, setProject],
  )

  // 矩形を選択
  const selectAnnotation = useCallback(
    (id: string | null) => {
      setProject((prev) => ({ ...prev, selectedId: id }))
    },
    [setProject],
  )

  // 矩形を削除（子要素も再帰的に削除）
  const deleteAnnotation = useCallback(
    (id: string) => {
      setProject((prev) => {
        const deleteRecursive = (annotationId: string, annotations: Annotation[]): Annotation[] => {
          const children = annotations.filter((a) => a.parentId === annotationId)
          let result = annotations.filter((a) => a.id !== annotationId)
          for (const child of children) {
            result = deleteRecursive(child.id, result)
          }
          return result
        }

        return {
          ...prev,
          annotations: deleteRecursive(id, prev.annotations),
          selectedId: prev.selectedId === id ? null : prev.selectedId,
        }
      })
    },
    [setProject],
  )

  // 矩形を複製（子要素も再帰的に複製）
  const duplicateAnnotation = useCallback(
    (id: string) => {
      const annotation = project.annotations.find((a) => a.id === id)
      if (!annotation) return

      const idMap = new Map<string, string>()
      const newAnnotations: Annotation[] = []

      const duplicateRecursive = (ann: Annotation, newParentId: string | null, offsetX: number, offsetY: number) => {
        const newId = nanoid()
        idMap.set(ann.id, newId)

        const duplicated: Annotation = {
          ...ann,
          id: newId,
          x: ann.x + offsetX,
          y: ann.y + offsetY,
          parentId: newParentId,
          children: [],
        }
        newAnnotations.push(duplicated)

        const children = project.annotations.filter((a) => a.parentId === ann.id)
        for (const child of children) {
          duplicateRecursive(child, newId, 0, 0)
        }
      }

      duplicateRecursive(annotation, annotation.parentId, 0.02, 0.02)

      // children の参照を更新
      for (const ann of newAnnotations) {
        const originalId = [...idMap.entries()].find(([_, v]) => v === ann.id)?.[0]
        if (originalId) {
          const originalChildren = project.annotations.filter((a) => a.parentId === originalId)
          ann.children = originalChildren.map((c) => idMap.get(c.id) || c.id)
        }
      }

      setProject((prev) => ({
        ...prev,
        annotations: [...prev.annotations, ...newAnnotations],
        selectedId: newAnnotations[0]?.id || prev.selectedId,
      }))
    },
    [project.annotations, setProject],
  )

  // 注釈のフィールドを更新
  const updateAnnotationField = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (id: string, field: keyof Annotation, value: any) => {
      setProject((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => {
          if (a.id !== id) return a

          // レイアウトタイプを設定した場合、コンポーネント種類を Box に強制
          if (field === "layoutType" && value !== "none") {
            return { ...a, [field]: value, componentKind: "Box" }
          }

          return { ...a, [field]: value }
        }),
      }))
    },
    [setProject],
  )

  // コンポーネント種類を更新
  const updateComponentKind = useCallback(
    (id: string, value: string) => {
      setProject((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => (a.id === id ? { ...a, componentKind: value } : a)),
      }))
    },
    [setProject],
  )

  // 注釈の座標を更新
  const updateAnnotationPosition = useCallback(
    (id: string, x: number, y: number) => {
      const annotation = project.annotations.find((a) => a.id === id)
      if (!annotation) return

      if (annotation.parentId) {
        const parent = project.annotations.find((a) => a.id === annotation.parentId)
        if (parent) {
          const parentPos = getAbsolutePosition(parent)
          const newRelX = x - parentPos.x
          const newRelY = y - parentPos.y
          setProject((prev) => ({
            ...prev,
            annotations: prev.annotations.map((a) => (a.id === id ? { ...a, x: newRelX, y: newRelY } : a)),
          }))
          return
        }
      }

      setProject((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => (a.id === id ? { ...a, x, y } : a)),
      }))
    },
    [project.annotations, getAbsolutePosition, setProject],
  )

  // 注釈のサイズと位置を更新
  const updateAnnotationSize = useCallback(
    (id: string, x: number, y: number, w: number, h: number) => {
      const annotation = project.annotations.find((a) => a.id === id)
      if (!annotation) return

      if (annotation.parentId) {
        const parent = project.annotations.find((a) => a.id === annotation.parentId)
        if (parent) {
          const parentPos = getAbsolutePosition(parent)
          const newRelX = x - parentPos.x
          const newRelY = y - parentPos.y
          setProject((prev) => ({
            ...prev,
            annotations: prev.annotations.map((a) => (a.id === id ? { ...a, x: newRelX, y: newRelY, w, h } : a)),
          }))
          return
        }
      }

      setProject((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => (a.id === id ? { ...a, x, y, w, h } : a)),
      }))
    },
    [project.annotations, getAbsolutePosition, setProject],
  )

  // 親要素を設定
  const setParent = useCallback(
    (childId: string, parentId: string | null) => {
      if (childId === parentId) return

      const child = project.annotations.find((a) => a.id === childId)
      const parent = parentId ? project.annotations.find((a) => a.id === parentId) : null

      if (!child) return

      // 親がレイアウト要素かチェック
      if (parent && !isLayoutType(parent.layoutType)) {
        alert("親要素はBox、Flex、Gridのいずれかである必要があります。")
        return
      }

      // 階層の深さチェック
      if (parent) {
        const parentDepth = getAnnotationDepth(parent)
        if (parentDepth >= 3) {
          alert("階層の深さは最大4階層までです。")
          return
        }
      }

      const currentAbsPos = getAbsolutePosition(child)

      let newX: number, newY: number, newW: number, newH: number

      if (parentId && parent) {
        const parentPos = getAbsolutePosition(parent)
        newX = currentAbsPos.x - parentPos.x
        newY = currentAbsPos.y - parentPos.y
        newW = currentAbsPos.w
        newH = currentAbsPos.h
      } else {
        newX = currentAbsPos.x
        newY = currentAbsPos.y
        newW = currentAbsPos.w
        newH = currentAbsPos.h
      }

      setProject((prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) => {
          if (a.id === childId) {
            return { ...a, parentId, x: newX, y: newY, w: newW, h: newH }
          }
          if (a.id === parentId) {
            return { ...a, children: [...(a.children || []), childId] }
          }
          if (a.id === child.parentId) {
            return { ...a, children: (a.children || []).filter((id) => id !== childId) }
          }
          return a
        }),
      }))
    },
    [project.annotations, getAnnotationDepth, getAbsolutePosition, setProject],
  )

  // 座標がどの注釈の上にあるかチェック
  const isPointOnAnnotation = useCallback(
    (x: number, y: number): string | null => {
      for (let i = project.annotations.length - 1; i >= 0; i--) {
        const a = project.annotations[i]
        const absPos = getAbsolutePosition(a)
        const ax = absPos.x * project.imageNaturalWidth
        const ay = absPos.y * project.imageNaturalHeight
        const aw = absPos.w * project.imageNaturalWidth
        const ah = absPos.h * project.imageNaturalHeight

        if (x >= ax && x <= ax + aw && y >= ay && y <= ay + ah) {
          return a.id
        }
      }
      return null
    },
    [project.annotations, project.imageNaturalWidth, project.imageNaturalHeight, getAbsolutePosition],
  )

  return {
    // ユーティリティ関数
    getAbsolutePosition,
    getAnnotationDepth,
    getHierarchicalAnnotations,
    isPointOnAnnotation,

    // CRUD操作
    addAnnotation,
    selectAnnotation,
    deleteAnnotation,
    duplicateAnnotation,

    // 更新操作
    updateAnnotationField,
    updateComponentKind,
    updateAnnotationPosition,
    updateAnnotationSize,
    setParent,
  }
}
