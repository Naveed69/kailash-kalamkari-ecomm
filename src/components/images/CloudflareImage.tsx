import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import type { CfVariant } from "@/lib/cloudflareImages"
import { PLACEHOLDER_SRC, resolveImageSrc } from "@/lib/cloudflareImages"

type CloudflareImageProps = {
  imageRef?: string | null
  variant: CfVariant
  alt: string
  className?: string
  loading?: "lazy" | "eager"
  decoding?: "async" | "sync"
  onClick?: React.MouseEventHandler<HTMLImageElement>
}

export const CloudflareImage = memo(function CloudflareImage({
  imageRef,
  variant,
  alt,
  className,
  loading = "lazy",
  decoding = "async",
  onClick,
}: CloudflareImageProps) {
  const resolvedSrc = useMemo(
    () => resolveImageSrc(imageRef, variant),
    [imageRef, variant],
  )

  const [src, setSrc] = useState(resolvedSrc)

  useEffect(() => {
    setSrc((prev) => (prev === resolvedSrc ? prev : resolvedSrc))
  }, [resolvedSrc])

  const handleError = useCallback(() => {
    setSrc((prev) => (prev === PLACEHOLDER_SRC ? prev : PLACEHOLDER_SRC))
  }, [])

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onClick={onClick}
      onError={handleError}
    />
  )
})

