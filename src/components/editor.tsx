import { useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { isLayoutType } from "@/components/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Plus,
  Download,
  X,
  List,
  PanelRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Languages,
} from "lucide-react";
import { CustomPromptDialog } from "@/components/custom-prompt-dialog";
import { EditorProvider, useEditorContext } from "@/contexts/editor-context";
import {
  LanguageProvider,
  useLanguage,
  LAYOUT_TYPES_I18N,
} from "@/contexts/language-context";
import { useAnnotations } from "@/hooks/use-annotations";
import { useImage } from "@/hooks/use-image";
import { useCanvas } from "@/hooks/use-canvas";
import { useExport } from "@/hooks/use-export";

const ANNOTATION_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#ec4899",
  "#f97316",
  "#06b6d4",
  "#6b7280",
];

function EditorContent() {
  const { language, setLanguage, t } = useLanguage();
  const layoutTypes = LAYOUT_TYPES_I18N[language];

  const {
    project,
    componentKinds,
    defaultComponentKind,
    setDefaultComponentKind,
    zoom,
    setZoom,
    showInspector,
    setShowInspector,
    showAnnotationList,
    setShowAnnotationList,
    setDragOffsets,
  } = useEditorContext();

  const {
    getAbsolutePosition,
    getAnnotationDepth,
    getHierarchicalAnnotations,
    addAnnotation,
    selectAnnotation,
    deleteAnnotation,
    duplicateAnnotation,
    updateAnnotationField,
    updateComponentKind,
    updateAnnotationPosition,
    updateAnnotationSize,
    setParent,
  } = useAnnotations();

  const selectedAnnotation = project.annotations.find(
    (a) => a.id === project.selectedId
  );

  const { handleImageUpload, handleImageDrop } = useImage();
  const { handleExport } = useExport();

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const {
    dragSelection,
    handleWheel,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  } = useCanvas(imageContainerRef);

  useEffect(() => {
    if (!imageContainerRef.current || !project.imageDataUrl) return;

    const updateSize = () => {
      if (imageContainerRef.current) {
        imageContainerRef.current.getBoundingClientRect();
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [project.imageDataUrl]);

  const handleAddRect = () => {
    if (!project.imageDataUrl) return;
    addAnnotation(0.1, 0.1, 0.2, 0.2);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ja" : "en");
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <h1 className="text-lg font-semibold">{t.appTitle}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleLanguage}>
            <Languages className="mr-1 h-4 w-4" />
            {language === "en" ? "English" : "日本語"}
          </Button>
          <CustomPromptDialog />
          <Button
            variant="default"
            onClick={handleExport}
            disabled={project.annotations.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {t.export}
          </Button>
        </div>
      </header>

      {/* Hidden file input */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex flex-1 flex-col">
          {/* Toolbar */}
          {project.imageDataUrl && (
            <div className="flex items-center gap-2 border-b bg-muted/30 p-2">
              <Button variant="outline" size="sm" onClick={handleAddRect}>
                <Plus className="mr-1 h-4 w-4" />
                {t.addRectangle}
              </Button>

              <div className="mx-2 h-6 w-px bg-border" />

              <span className="text-sm text-muted-foreground">{t.preset}:</span>
              <Combobox
                options={componentKinds}
                value={defaultComponentKind}
                onValueChange={setDefaultComponentKind}
                placeholder={t.component}
                searchPlaceholder={t.searchPlaceholder}
                emptyText={t.noComponentFound}
                className="w-40"
              />

              <div className="mx-2 h-6 w-px bg-border" />

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-sm">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => setZoom(1)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1" />

              <Button
                variant={showAnnotationList ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAnnotationList(!showAnnotationList)}
              >
                <List className="mr-1 h-4 w-4" />
                {t.annotations}
              </Button>
              <Button
                variant={showInspector ? "default" : "outline"}
                size="sm"
                onClick={() => setShowInspector(!showInspector)}
              >
                <PanelRight className="mr-1 h-4 w-4" />
                {t.inspector}
              </Button>
            </div>
          )}

          {/* Canvas */}
          <div
            className="flex-1 overflow-auto bg-muted/20"
            onWheel={handleWheel}
          >
            {!project.imageDataUrl ? (
              <div
                className="flex h-full cursor-pointer flex-col items-center justify-center gap-4 p-8"
                onClick={() => imageFileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
              >
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center transition-colors hover:border-muted-foreground/50">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="mb-2 text-lg font-medium">{t.uploadTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.uploadHint}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => imageFileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t.selectImage}
                </Button>
              </div>
            ) : (
              <div
                ref={imageContainerRef}
                className="relative inline-block min-h-full min-w-full"
                style={{
                  cursor: dragSelection.isDrawing ? "crosshair" : "default",
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                <img
                  src={project.imageDataUrl || "/placeholder.svg"}
                  alt="Uploaded"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                  draggable={false}
                />

                {/* Annotations */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: project.imageNaturalWidth,
                    height: project.imageNaturalHeight,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    pointerEvents: "none",
                  }}
                >
                  {project.annotations.map((annotation) => {
                    const absPos = getAbsolutePosition(annotation);
                    const depth = getAnnotationDepth(annotation);

                    return (
                      <Rnd
                        key={annotation.id}
                        size={{
                          width: absPos.w * project.imageNaturalWidth,
                          height: absPos.h * project.imageNaturalHeight,
                        }}
                        position={{
                          x: absPos.x * project.imageNaturalWidth,
                          y: absPos.y * project.imageNaturalHeight,
                        }}
                        onDrag={(_e, d) => {
                          const originalAbsPos = annotation.parentId
                            ? getAbsolutePosition({ ...annotation })
                            : {
                                x: annotation.x,
                                y: annotation.y,
                                w: annotation.w,
                                h: annotation.h,
                              };

                          const newAbsX = d.x / project.imageNaturalWidth;
                          const newAbsY = d.y / project.imageNaturalHeight;

                          setDragOffsets((prev) => {
                            const next = new Map(prev);
                            next.set(annotation.id, {
                              x: newAbsX - originalAbsPos.x,
                              y: newAbsY - originalAbsPos.y,
                            });
                            return next;
                          });
                        }}
                        onDragStop={(_e, d) => {
                          setDragOffsets((prev) => {
                            const next = new Map(prev);
                            next.delete(annotation.id);
                            return next;
                          });

                          const newAbsX = d.x / project.imageNaturalWidth;
                          const newAbsY = d.y / project.imageNaturalHeight;
                          updateAnnotationPosition(
                            annotation.id,
                            newAbsX,
                            newAbsY
                          );
                        }}
                        onResizeStop={(
                          _e,
                          _direction,
                          ref,
                          _delta,
                          position
                        ) => {
                          const newAbsW =
                            Number.parseFloat(ref.style.width) /
                            project.imageNaturalWidth;
                          const newAbsH =
                            Number.parseFloat(ref.style.height) /
                            project.imageNaturalHeight;
                          const newAbsX =
                            position.x / project.imageNaturalWidth;
                          const newAbsY =
                            position.y / project.imageNaturalHeight;
                          updateAnnotationSize(
                            annotation.id,
                            newAbsX,
                            newAbsY,
                            newAbsW,
                            newAbsH
                          );
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          selectAnnotation(annotation.id);
                        }}
                        bounds="parent"
                        style={{
                          border: `${4 - depth}px solid ${annotation.color}`,
                          backgroundColor:
                            project.selectedId === annotation.id
                              ? `${annotation.color}33`
                              : `${annotation.color}11`,
                          pointerEvents: "auto",
                          cursor: "move",
                          zIndex: depth,
                        }}
                      >
                        <div className="absolute left-1 top-1 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
                          {annotation.componentKind}
                          {isLayoutType(annotation.layoutType) && (
                            <span className="ml-1 opacity-70">
                              ({annotation.layoutType})
                            </span>
                          )}
                        </div>
                      </Rnd>
                    );
                  })}

                  {/* Drag selection preview */}
                  {dragSelection.isDrawing && (
                    <div
                      style={{
                        position: "absolute",
                        left: Math.min(
                          dragSelection.startX,
                          dragSelection.currentX
                        ),
                        top: Math.min(
                          dragSelection.startY,
                          dragSelection.currentY
                        ),
                        width: Math.abs(
                          dragSelection.currentX - dragSelection.startX
                        ),
                        height: Math.abs(
                          dragSelection.currentY - dragSelection.startY
                        ),
                        border: "3px solid #3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Floating Annotation List */}
          {showAnnotationList && project.imageDataUrl && (
            <div className="absolute left-4 top-16 z-10 w-64 max-h-[calc(100vh-10rem)] overflow-auto rounded-lg border bg-background shadow-lg">
              <div className="flex items-center justify-between border-b p-3">
                <h3 className="font-medium">
                  {t.annotations} ({project.annotations.length})
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowAnnotationList(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-2">
                {getHierarchicalAnnotations().map(({ annotation, depth }) => (
                  <button
                    key={annotation.id}
                    type="button"
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                      project.selectedId === annotation.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => selectAnnotation(annotation.id)}
                  >
                    <span
                      className="mr-2 inline-block h-3 w-3 rounded-sm"
                      style={{ backgroundColor: annotation.color }}
                    />
                    {annotation.componentKind}
                    {isLayoutType(annotation.layoutType) && (
                      <span className="ml-1 text-xs opacity-70">
                        ({annotation.layoutType})
                      </span>
                    )}
                  </button>
                ))}
                {project.annotations.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t.noAnnotations}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Floating Inspector */}
          {showInspector && project.imageDataUrl && (
            <div className="fixed right-4 top-36 z-50 w-80 max-h-[calc(100vh-10rem)] overflow-y-auto">
              <Card className="border bg-background shadow-lg">
                {selectedAnnotation ? (
                  <div className="space-y-4 p-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        ID
                      </Label>
                      <p className="font-mono text-sm">
                        {selectedAnnotation.id}
                      </p>
                    </div>

                    <div>
                      <Label className="mb-1 block">{t.layoutType}</Label>
                      <Select
                        value={selectedAnnotation.layoutType || "none"}
                        onValueChange={(value) =>
                          updateAnnotationField(
                            selectedAnnotation.id,
                            "layoutType",
                            value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {layoutTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1 block">{t.componentType}</Label>
                      {isLayoutType(selectedAnnotation.layoutType) ? (
                        <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                          {t.layoutContainer}
                        </div>
                      ) : (
                        <Combobox
                          options={componentKinds}
                          value={selectedAnnotation.componentKind}
                          onValueChange={(value) =>
                            updateComponentKind(selectedAnnotation.id, value)
                          }
                          placeholder={t.selectComponent}
                          searchPlaceholder={t.searchPlaceholder}
                          emptyText={t.noComponentFound}
                        />
                      )}
                    </div>

                    <div>
                      <Label className="mb-1 block">{t.motionInfo}</Label>
                      <Textarea
                        value={selectedAnnotation.motionInfo}
                        onChange={(e) =>
                          updateAnnotationField(
                            selectedAnnotation.id,
                            "motionInfo",
                            e.target.value
                          )
                        }
                        placeholder={t.motionPlaceholder}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {t.xPosition}
                        </Label>
                        <p className="text-sm">
                          {(selectedAnnotation.x * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {t.yPosition}
                        </Label>
                        <p className="text-sm">
                          {(selectedAnnotation.y * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {t.width}
                        </Label>
                        <p className="text-sm">
                          {(selectedAnnotation.w * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {t.height}
                        </Label>
                        <p className="text-sm">
                          {(selectedAnnotation.h * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">{t.parentElement}</Label>
                      <Select
                        value={selectedAnnotation.parentId || "none"}
                        onValueChange={(value) =>
                          setParent(
                            selectedAnnotation.id,
                            value === "none" ? null : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.none} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t.none}</SelectItem>
                          {project.annotations
                            .filter(
                              (a) =>
                                a.id !== selectedAnnotation.id &&
                                isLayoutType(a.layoutType)
                            )
                            .map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                <div className="flex flex-col py-1">
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {a.id}
                                  </span>
                                  <span className="text-sm">
                                    {a.layoutType}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block">{t.borderColor}</Label>
                      <div className="flex flex-wrap gap-2">
                        {ANNOTATION_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`h-6 w-6 rounded border-2 ${
                              selectedAnnotation.color === color
                                ? "border-foreground"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              updateAnnotationField(
                                selectedAnnotation.id,
                                "color",
                                color
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Flex and Grid Property UI */}
                    {selectedAnnotation.layoutType === "flex" && (
                      <div className="space-y-3 rounded-md border p-3">
                        <div className="text-sm font-semibold">
                          {t.flexboxProperties}
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            {t.direction}
                          </label>
                          <Select
                            value={
                              selectedAnnotation.flexLayout?.direction || "row"
                            }
                            onValueChange={(value) => {
                              const newFlexLayout = {
                                direction: value as "row" | "column",
                                justify:
                                  selectedAnnotation.flexLayout?.justify ||
                                  "start",
                                align:
                                  selectedAnnotation.flexLayout?.align ||
                                  "start",
                                gap: selectedAnnotation.flexLayout?.gap || 0,
                              };
                              updateAnnotationField(
                                selectedAnnotation.id,
                                "flexLayout",
                                newFlexLayout
                              );
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="row">
                                {t.horizontal}
                              </SelectItem>
                              <SelectItem value="column">
                                {t.vertical}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            {t.justifyContent}
                          </label>
                          <Select
                            value={
                              selectedAnnotation.flexLayout?.justify || "start"
                            }
                            onValueChange={(value) => {
                              const newFlexLayout = {
                                direction:
                                  selectedAnnotation.flexLayout?.direction ||
                                  "row",
                                justify: value as
                                  | "start"
                                  | "center"
                                  | "end"
                                  | "between"
                                  | "around",
                                align:
                                  selectedAnnotation.flexLayout?.align ||
                                  "start",
                                gap: selectedAnnotation.flexLayout?.gap || 0,
                              };
                              updateAnnotationField(
                                selectedAnnotation.id,
                                "flexLayout",
                                newFlexLayout
                              );
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="start">start</SelectItem>
                              <SelectItem value="center">center</SelectItem>
                              <SelectItem value="end">end</SelectItem>
                              <SelectItem value="between">
                                space-between
                              </SelectItem>
                              <SelectItem value="around">
                                space-around
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            {t.alignItems}
                          </label>
                          <Select
                            value={
                              selectedAnnotation.flexLayout?.align || "start"
                            }
                            onValueChange={(value) => {
                              const newFlexLayout = {
                                direction:
                                  selectedAnnotation.flexLayout?.direction ||
                                  "row",
                                justify:
                                  selectedAnnotation.flexLayout?.justify ||
                                  "start",
                                align: value as
                                  | "start"
                                  | "center"
                                  | "end"
                                  | "stretch",
                                gap: selectedAnnotation.flexLayout?.gap || 0,
                              };
                              updateAnnotationField(
                                selectedAnnotation.id,
                                "flexLayout",
                                newFlexLayout
                              );
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="start">start</SelectItem>
                              <SelectItem value="center">center</SelectItem>
                              <SelectItem value="end">end</SelectItem>
                              <SelectItem value="stretch">stretch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            {t.gap}
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={selectedAnnotation.flexLayout?.gap || 0}
                            onChange={(e) => {
                              const newFlexLayout = {
                                direction:
                                  selectedAnnotation.flexLayout?.direction ||
                                  "row",
                                justify:
                                  selectedAnnotation.flexLayout?.justify ||
                                  "start",
                                align:
                                  selectedAnnotation.flexLayout?.align ||
                                  "start",
                                gap: Number.parseInt(e.target.value) || 0,
                              };
                              updateAnnotationField(
                                selectedAnnotation.id,
                                "flexLayout",
                                newFlexLayout
                              );
                            }}
                            className="h-8"
                          />
                        </div>
                      </div>
                    )}

                    {selectedAnnotation.layoutType === "grid" && (
                      <div className="space-y-3 rounded-md border p-3">
                        <div className="text-sm font-semibold">
                          {t.gridProperties}
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            {t.columns}
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={selectedAnnotation.gridLayout?.columns || 1}
                            onChange={(e) => {
                              const newGridLayout = {
                                columns: Number.parseInt(e.target.value) || 1,
                                rows: selectedAnnotation.gridLayout?.rows || 1,
                                gap: selectedAnnotation.gridLayout?.gap || 0,
                              };
                              updateAnnotationField(
                                selectedAnnotation.id,
                                "gridLayout",
                                newGridLayout
                              );
                            }}
                            className="h-8"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            {t.rows}
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={selectedAnnotation.gridLayout?.rows || 1}
                            onChange={(e) => {
                              const newGridLayout = {
                                columns:
                                  selectedAnnotation.gridLayout?.columns || 1,
                                rows: Number.parseInt(e.target.value) || 1,
                                gap: selectedAnnotation.gridLayout?.gap || 0,
                              };
                              updateAnnotationField(
                                selectedAnnotation.id,
                                "gridLayout",
                                newGridLayout
                              );
                            }}
                            className="h-8"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground">
                            {t.gap}
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={selectedAnnotation.gridLayout?.gap || 0}
                            onChange={(e) => {
                              const newGridLayout = {
                                columns:
                                  selectedAnnotation.gridLayout?.columns || 1,
                                rows: selectedAnnotation.gridLayout?.rows || 1,
                                gap: Number.parseInt(e.target.value) || 0,
                              };
                              updateAnnotationField(
                                selectedAnnotation.id,
                                "gridLayout",
                                newGridLayout
                              );
                            }}
                            className="h-8"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() =>
                          duplicateAnnotation(selectedAnnotation.id)
                        }
                      >
                        <Copy className="mr-1 h-4 w-4" />
                        {t.duplicate}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => deleteAnnotation(selectedAnnotation.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        {t.delete}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {t.selectAnnotation}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Editor() {
  return (
    <LanguageProvider>
      <EditorProvider>
        <EditorContent />
      </EditorProvider>
    </LanguageProvider>
  );
}
