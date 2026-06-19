import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import type { CfVariant } from "@/lib/cloudflareImages"
import { PLACEHOLDER_SRC, resolveImageSrc } from "@/lib/cloudflareImages"

const warned = new Set<string>()
const warnOnce = (key: string, message: string, meta?: unknown) => {
  if (!import.meta.env.DEV) return
  if (warned.has(key)) return
  warned.add(key)
  console.warn(message, meta)
}

const isImageDebugEnabled = () => {
  if (import.meta.env.DEV) return true
  if (typeof window === "undefined") return false

  try {
    const params = new URLSearchParams(window.location.search)
    return (
      params.get("productDebug") === "1" ||
      params.get("imageDebug") === "1" ||
      window.localStorage.getItem("productDebug") === "1" ||
      window.localStorage.getItem("imageDebug") === "1"
    )
  } catch {
    return false
  }
}

const logImageDebug = (
  level: "info" | "warn" | "error",
  event: string,
  meta: Record<string, unknown>,
) => {
  if (!isImageDebugEnabled()) return
  console[level](`[CloudflareImage] ${event}`, meta)
}

type CloudflareImageProps = {
  src?: string | null
  imageRef?: string | null
  variant: CfVariant
  alt: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  loading?: "lazy" | "eager"
  decoding?: "async" | "sync"
  onClick?: React.MouseEventHandler<HTMLImageElement>
  onLoad?: React.ReactEventHandler<HTMLImageElement>
  onError?: React.ReactEventHandler<HTMLImageElement>
  hidden?: boolean
  unmountOnHide?: boolean
  context?: "zoom" | "default"
  debugName?: string
}

export const CloudflareImage = memo(function CloudflareImage({
  src: srcProp,
  imageRef,
  variant,
  alt,
  className,
  style,
  width,
  height,
  loading = "lazy",
  decoding = "async",
  onClick,
  onLoad,
  onError,
  hidden,
  unmountOnHide = false,
  context = "default",
  debugName,
}: CloudflareImageProps) {
  if (variant === "full" && context !== "zoom") {
    warnOnce(
      `full_variant_outside_zoom:${alt}`,
      "[CloudflareImage] variant=\"full\" used outside zoom context. This can waste bandwidth in production.",
      { alt },
    )
  }

  const effectiveRef = srcProp ?? imageRef
  const resolvedSrc = useMemo(
    () => resolveImageSrc(effectiveRef, variant),
    [effectiveRef, variant],
  )

  const [src, setSrc] = useState(resolvedSrc)

  useEffect(() => {
    setSrc((prev) => (prev === resolvedSrc ? prev : resolvedSrc))
  }, [resolvedSrc])

  useEffect(() => {
    if (!debugName) return
    logImageDebug("info", "resolved", {
      debugName,
      alt,
      variant,
      context,
      imageRef: effectiveRef ?? null,
      resolvedSrc,
      isPlaceholder: resolvedSrc === PLACEHOLDER_SRC,
      requestedWidth: width ?? null,
      requestedHeight: height ?? null,
      loading,
    })
  }, [alt, context, debugName, effectiveRef, height, loading, resolvedSrc, variant, width])

  const handleLoad = useCallback<React.ReactEventHandler<HTMLImageElement>>(
    (event) => {
      if (debugName) {
        const img = event.currentTarget
        logImageDebug("info", "loaded", {
          debugName,
          alt,
          variant,
          context,
          imageRef: effectiveRef ?? null,
          renderedSrc: img.currentSrc || img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.clientWidth,
          displayHeight: img.clientHeight,
          complete: img.complete,
          hidden: img.hidden,
        })
      }
      onLoad?.(event)
    },
    [alt, context, debugName, effectiveRef, onLoad, variant],
  )

  const handleError = useCallback<React.ReactEventHandler<HTMLImageElement>>((event) => {
    if (debugName) {
      const img = event.currentTarget
      logImageDebug("error", "failed", {
        debugName,
        alt,
        variant,
        context,
        imageRef: effectiveRef ?? null,
        failedSrc: img.currentSrc || img.src,
        fallback: PLACEHOLDER_SRC,
      })
    }
    setSrc((prev) => (prev === PLACEHOLDER_SRC ? prev : PLACEHOLDER_SRC))
    onError?.(event)
  }, [alt, context, debugName, effectiveRef, onError, variant])

  const mergedStyle = useMemo(() => {
    const next: React.CSSProperties = { ...(style ?? {}) }
    if (
      width &&
      height &&
      typeof next.aspectRatio === "undefined" &&
      next.width !== "auto" &&
      next.height !== "auto"
    ) {
      next.aspectRatio = `${width} / ${height}`
    }
    return next
  }, [style, width, height])

  if (unmountOnHide && hidden) return null

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={mergedStyle}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      onClick={onClick}
      onLoad={handleLoad}
      onError={handleError}
      hidden={hidden}
    />
  )
})
