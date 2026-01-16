import type { Annotation, FlexLayout, GridLayout } from "@/components/types"

export function generatePrompt(annotations: Annotation[], imageName: string): string {
  // ルート要素（親を持たない）を取得
  const rootAnnotations = annotations.filter((a) => !a.parentId)

  const renderAnnotation = (annotation: Annotation, depth: number, index: number): string => {
    const indent = "  ".repeat(depth)
    const parentInfo = annotation.parentId ? `\n${indent}- **親要素ID**: ${annotation.parentId}` : ""
    const childrenInfo =
      annotation.children.length > 0 ? `\n${indent}- **子要素数**: ${annotation.children.length}` : ""

    // レイアウト情報の詳細
    let layoutInfo = ""
    if (annotation.layoutType === "box") {
      layoutInfo = `\n${indent}- **レイアウト**: Box（コンテナ要素、子要素を配置可能）`
    } else if (annotation.layoutType === "flex" && annotation.flexLayout) {
      const flex = annotation.flexLayout as FlexLayout
      layoutInfo = `\n${indent}- **レイアウト**: Flexbox
${indent}  - 方向: ${flex.direction === "row" ? "横並び (row)" : "縦並び (column)"}
${indent}  - 主軸の配置: ${flex.justify}
${indent}  - 交差軸の配置: ${flex.align}
${indent}  - 間隔 (gap): ${flex.gap}px`
    } else if (annotation.layoutType === "grid" && annotation.gridLayout) {
      const grid = annotation.gridLayout as GridLayout
      layoutInfo = `\n${indent}- **レイアウト**: Grid
${indent}  - カラム数: ${grid.columns}
${indent}  - 行数: ${grid.rows}
${indent}  - 間隔 (gap): ${grid.gap}px`
    }

    let result = `${indent}### ${depth === 0 ? "ルート" : "子"}要素 ${index + 1} (ID: ${annotation.id})
${indent}- **コンポーネント種類**: ${annotation.componentKind}${layoutInfo}
${indent}- **位置**:
${indent}  - X: ${(annotation.x * 100).toFixed(1)}% (左からの距離)
${indent}  - Y: ${(annotation.y * 100).toFixed(1)}% (上からの距離)
${indent}  - 幅: ${(annotation.w * 100).toFixed(1)}%
${indent}  - 高さ: ${(annotation.h * 100).toFixed(1)}%
${indent}- **モーション・動作情報**: ${annotation.motionInfo || "指定なし"}${parentInfo}${childrenInfo}
`

    // 子要素を再帰的に追加
    if (annotation.children.length > 0) {
      result += `\n${indent}#### 子要素:\n`
      annotation.children.forEach((childId, childIndex) => {
        const child = annotations.find((a) => a.id === childId)
        if (child) {
          result += "\n" + renderAnnotation(child, depth + 1, childIndex)
        }
      })
    }

    return result
  }

  const annotationsList = rootAnnotations.map((annotation, index) => renderAnnotation(annotation, 0, index)).join("\n")

  return `# UI実装リクエスト

## 参照画像
ファイル名: ${imageName}

## 注釈リスト（階層構造）

以下の注釈は、画像内のUI要素の位置と階層構造を示しています。座標は画像の幅・高さに対する割合（0〜1）で表されます。
親子関係は、実際のDOM構造やレイアウトコンテナの入れ子を表現しています。

${annotationsList}

## 実装要件

1. **コンポーネントの階層**: 上記の注釈の階層構造に基づいて、適切なコンポーネント構造を作成してください。
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
   - ユーティリティ関数は \`lib/\` フォルダに配置してください

## 注意事項

- 注釈の座標は相対的な位置を示していますが、階層構造が最優先です
- 親子関係は実際のDOM構造を反映してください
- レイアウトコンテナ（Box/Flex/Grid）のみが子要素を持つことができます
- Flexbox/Gridの設定は注釈に記載された詳細設定に従ってください
- モーション情報が指定されている場合は、それに基づいてインタラクティブな動作を実装してください
- 各コンポーネントは再利用可能な形で実装してください
`
}
