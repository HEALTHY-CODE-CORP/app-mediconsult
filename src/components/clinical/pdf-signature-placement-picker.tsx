"use client"

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist"
import { ChevronLeft, ChevronRight, Loader2, Move, RotateCcw, ScanLine } from "lucide-react"
import { Rnd } from "react-rnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface SignaturePlacementState {
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
}

interface PdfSignaturePlacementPickerProps {
  pdfUrl: string
  documentLabel?: string
  value: SignaturePlacementState
  onChange: (next: SignaturePlacementState) => void
  disabled?: boolean
}

type ViewportMetrics = {
  widthPx: number
  heightPx: number
  widthPt: number
  heightPt: number
}

type RectPx = {
  x: number
  y: number
  width: number
  height: number
}

const PREVIEW_TARGET_WIDTH = 760
const MIN_RECT_WIDTH_PX = 120
const MIN_RECT_HEIGHT_PX = 56

export function PdfSignaturePlacementPicker({
  pdfUrl,
  documentLabel = "documento",
  value,
  onChange,
  disabled = false,
}: PdfSignaturePlacementPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const initialPageRef = useRef(value.pageNumber > 0 ? value.pageNumber : 1)
  const [pdfModule, setPdfModule] = useState<typeof import("pdfjs-dist") | null>(null)
  const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(value.pageNumber > 0 ? value.pageNumber : 1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<ViewportMetrics | null>(null)
  const [rectPx, setRectPx] = useState<RectPx | null>(null)

  const canGoPrev = currentPage > 1
  const canGoNext = pageCount > 0 && currentPage < pageCount

  const pageLabel = useMemo(() => {
    if (pageCount <= 0) return "0 / 0"
    return `${currentPage} / ${pageCount}`
  }, [currentPage, pageCount])

  useEffect(() => {
    let isCancelled = false

    async function loadPdfJs() {
      try {
        const pdfJs = await import("pdfjs-dist")
        if (
          typeof pdfJs.GlobalWorkerOptions.workerSrc !== "string" ||
          pdfJs.GlobalWorkerOptions.workerSrc.length === 0
        ) {
          try {
            pdfJs.GlobalWorkerOptions.workerSrc = new URL(
              "pdfjs-dist/build/pdf.worker.min.mjs",
              import.meta.url
            ).toString()
          } catch {
            pdfJs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfJs.version}/build/pdf.worker.min.mjs`
          }
        }
        if (!isCancelled) setPdfModule(pdfJs)
      } catch {
        if (!isCancelled) setError("No se pudo inicializar el visor PDF.")
      }
    }

    void loadPdfJs()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    const activePdfModule = pdfModule
    if (!activePdfModule) return

    let isCancelled = false
    setIsLoading(true)
    setError(null)

    async function loadDocument() {
      try {
        const response = await fetch(
          pdfUrl,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/pdf",
            },
          }
        )
        if (!response.ok) {
          throw new Error("PDF request failed")
        }
        const bytes = await response.arrayBuffer()
        const loadingTask = activePdfModule!.getDocument({ data: bytes })
        const doc = await loadingTask.promise
        if (isCancelled) {
          await doc.destroy()
          return
        }
        setDocumentProxy(doc)
        setPageCount(doc.numPages)
        const safePage = clamp(Math.round(initialPageRef.current || 1), 1, doc.numPages)
        setCurrentPage(safePage)
      } catch {
        if (!isCancelled) {
          setError(`No se pudo cargar la previsualización del ${documentLabel}.`)
          setDocumentProxy(null)
          setPageCount(0)
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadDocument()

    return () => {
      isCancelled = true
    }
  }, [documentLabel, pdfModule, pdfUrl])

  useEffect(() => {
    const activeDocument = documentProxy
    if (!activeDocument || !canvasRef.current) return

    let isCancelled = false
    let renderTask: RenderTask | null = null

    async function renderPage() {
      try {
        setIsLoading(true)
        const page = await activeDocument!.getPage(currentPage)
        if (isCancelled || !canvasRef.current) return

        const viewportPt = page.getViewport({ scale: 1 })
        const scale = clamp(PREVIEW_TARGET_WIDTH / viewportPt.width, 0.55, 1.8)
        const viewportPx = page.getViewport({ scale })
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) throw new Error("Canvas context unavailable")

        canvas.width = Math.floor(viewportPx.width)
        canvas.height = Math.floor(viewportPx.height)
        canvas.style.width = `${viewportPx.width}px`
        canvas.style.height = `${viewportPx.height}px`

        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport: viewportPx,
        })
        await renderTask.promise
        if (isCancelled) return

        setMetrics({
          widthPx: viewportPx.width,
          heightPx: viewportPx.height,
          widthPt: viewportPt.width,
          heightPt: viewportPt.height,
        })
      } catch {
        if (!isCancelled) {
          setError(`No se pudo renderizar la página del ${documentLabel} para ubicar la firma.`)
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void renderPage()

    return () => {
      isCancelled = true
      if (renderTask) renderTask.cancel()
    }
  }, [currentPage, documentLabel, documentProxy])

  useEffect(() => {
    if (!metrics) return

    const nextRect = placementToRectPx(value, metrics)
    setRectPx(nextRect)
  }, [metrics, value])

  useEffect(() => {
    if (value.pageNumber !== currentPage && value.pageNumber > 0) {
      setCurrentPage(value.pageNumber)
    }
  }, [currentPage, value.pageNumber])

  useEffect(() => {
    return () => {
      if (documentProxy) void documentProxy.destroy()
    }
  }, [documentProxy])

  function applyRect(nextRect: RectPx) {
    if (!metrics) return
    const normalized = normalizeRect(nextRect, metrics.widthPx, metrics.heightPx)
    setRectPx(normalized)
    onChange(rectPxToPlacement(normalized, metrics, currentPage))
  }

  function goToPage(page: number) {
    if (pageCount <= 0) return
    const nextPage = clamp(Math.round(page), 1, pageCount)
    setCurrentPage(nextPage)
    onChange({
      ...value,
      pageNumber: nextPage,
    })
  }

  function handleCanvasClick(event: MouseEvent<HTMLDivElement>) {
    if (disabled || !rectPx || !metrics) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left - rectPx.width / 2
    const y = event.clientY - bounds.top - rectPx.height / 2
    applyRect({
      ...rectPx,
      x,
      y,
    })
  }

  function handleReset() {
    if (!metrics) return
    const placement = createDefaultPlacement(metrics, currentPage)
    onChange(placement)
    setRectPx(placementToRectPx(placement, metrics))
  }

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Label className="text-sm">Ubicación visual de firma</Label>
          <p className="text-xs text-muted-foreground">
            Selecciona página y arrastra el recuadro donde debe verse la firma digital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={!canGoPrev || disabled || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            className="h-8 w-16 text-center"
            type="number"
            min={1}
            max={Math.max(pageCount, 1)}
            value={pageCount > 0 ? currentPage : ""}
            onChange={(event) => {
              const nextPage = Number(event.target.value)
              if (!Number.isNaN(nextPage)) goToPage(nextPage)
            }}
            disabled={pageCount <= 0 || disabled || isLoading}
          />
          <span className="text-xs text-muted-foreground">{pageLabel}</span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!canGoNext || disabled || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!metrics || disabled || isLoading}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Recentrar
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-muted/20 p-2">
        {error ? (
          <p className="p-4 text-sm text-destructive">{error}</p>
        ) : (
          <div className="max-h-[520px] overflow-auto">
            <div
              className={cn(
                "relative w-fit rounded-md border border-dashed border-border bg-background",
                disabled && "pointer-events-none opacity-75"
              )}
              onClick={handleCanvasClick}
            >
              <canvas ref={canvasRef} className="block" />
              {metrics && rectPx && (
                <Rnd
                  bounds="parent"
                  size={{ width: rectPx.width, height: rectPx.height }}
                  position={{ x: rectPx.x, y: rectPx.y }}
                  minWidth={MIN_RECT_WIDTH_PX}
                  minHeight={MIN_RECT_HEIGHT_PX}
                  disableDragging={disabled}
                  onDrag={(_event, data) => {
                    setRectPx((prev) => (prev ? { ...prev, x: data.x, y: data.y } : prev))
                  }}
                  onDragStop={(_event, data) => {
                    applyRect({
                      x: data.x,
                      y: data.y,
                      width: rectPx.width,
                      height: rectPx.height,
                    })
                  }}
                  onResize={(_event, _direction, ref, _delta, position) => {
                    setRectPx({
                      x: position.x,
                      y: position.y,
                      width: Number(ref.style.width.replace("px", "")),
                      height: Number(ref.style.height.replace("px", "")),
                    })
                  }}
                  onResizeStop={(_event, _direction, ref, _delta, position) => {
                    applyRect({
                      x: position.x,
                      y: position.y,
                      width: Number(ref.style.width.replace("px", "")),
                      height: Number(ref.style.height.replace("px", "")),
                    })
                  }}
                  className="rounded border-2 border-primary/80 bg-primary/10 shadow-sm"
                >
                  <div className="flex h-full w-full items-center justify-center gap-1 bg-gradient-to-br from-primary/15 to-primary/5 text-xs font-medium text-primary">
                    <ScanLine className="h-3.5 w-3.5" />
                    Firma digital
                    <Move className="h-3.5 w-3.5 opacity-70" />
                  </div>
                </Rnd>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {metrics && (
        <p className="text-xs text-muted-foreground">
          Coordenadas PDF: x={round(value.x)}, y={round(value.y)}, ancho={round(value.width)}, alto={round(value.height)} (página {currentPage})
        </p>
      )}
    </div>
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function createDefaultPlacement(metrics: ViewportMetrics, pageNumber: number): SignaturePlacementState {
  const width = clamp(Math.min(220, metrics.widthPt * 0.42), 130, metrics.widthPt - 36)
  const height = clamp(Math.min(90, metrics.heightPt * 0.18), 56, metrics.heightPt - 36)
  const margin = 24
  const x = clamp(metrics.widthPt - width - margin, 8, metrics.widthPt - width)
  const y = margin

  return {
    pageNumber,
    x: round(x),
    y: round(y),
    width: round(width),
    height: round(height),
  }
}

function placementToRectPx(
  placement: SignaturePlacementState,
  metrics: ViewportMetrics
): RectPx {
  const safeWidth = clamp(
    (placement.width / metrics.widthPt) * metrics.widthPx,
    MIN_RECT_WIDTH_PX,
    metrics.widthPx
  )
  const safeHeight = clamp(
    (placement.height / metrics.heightPt) * metrics.heightPx,
    MIN_RECT_HEIGHT_PX,
    metrics.heightPx
  )

  const x = (placement.x / metrics.widthPt) * metrics.widthPx
  const y = metrics.heightPx - ((placement.y + placement.height) / metrics.heightPt) * metrics.heightPx

  return normalizeRect(
    {
      x,
      y,
      width: safeWidth,
      height: safeHeight,
    },
    metrics.widthPx,
    metrics.heightPx
  )
}

function rectPxToPlacement(
  rectPx: RectPx,
  metrics: ViewportMetrics,
  pageNumber: number
): SignaturePlacementState {
  const x = (rectPx.x / metrics.widthPx) * metrics.widthPt
  const width = (rectPx.width / metrics.widthPx) * metrics.widthPt
  const y = ((metrics.heightPx - rectPx.y - rectPx.height) / metrics.heightPx) * metrics.heightPt
  const height = (rectPx.height / metrics.heightPx) * metrics.heightPt

  return {
    pageNumber,
    x: round(x),
    y: round(y),
    width: round(width),
    height: round(height),
  }
}

function normalizeRect(rect: RectPx, maxWidth: number, maxHeight: number): RectPx {
  const width = clamp(rect.width, MIN_RECT_WIDTH_PX, maxWidth)
  const height = clamp(rect.height, MIN_RECT_HEIGHT_PX, maxHeight)
  const x = clamp(rect.x, 0, maxWidth - width)
  const y = clamp(rect.y, 0, maxHeight - height)
  return { x, y, width, height }
}
