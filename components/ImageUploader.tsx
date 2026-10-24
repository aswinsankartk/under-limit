"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      const msg =
        "Unsupported file type. Please select a JPEG, PNG, or WebP image.";
      setError(msg);
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setImage(file);
    setPreviewUrl(url);
    setDimensions(null);
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }
    urlRef.current = url;
  };

  useEffect(() => {
    let cancelled = false;
    if (!image) {
      return;
    }

    const readDimensions = async () => {
      let bitmap: ImageBitmap | null = null;
      try {
        bitmap = await createImageBitmap(image);
        if (cancelled) return;
        setDimensions({
          width: bitmap.width,
          height: bitmap.height,
        });
      } catch (error) {
        if (!cancelled) {
          setDimensions(null);
          console.error("Error reading image dimensions:", error);
          setError("We couldn't read this image. Please try another file.");
        }
      } finally {
        if (bitmap) {
          bitmap.close();
        }
      }
    };
    readDimensions();
    return () => {
      cancelled = true;
    };
  }, [image]);

  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);
  return (
    <section>
      <h2>Image workspace</h2>
      <p>Choose an image to get started.</p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-terracotta">
          {error}
        </p>
      )}
      {image && dimensions && (
        <p>
          {image.name} - {(image.size / 1024).toFixed(2)} KB
        </p>
      )}
      {error && previewUrl && dimensions && <p>Previous valid image</p>}
      {previewUrl && dimensions && (
        <Image
          src={previewUrl}
          alt="Selected image preview"
          className="mt-4 max-w-full rounded-xl object-contain"
          width={dimensions?.width}
          height={dimensions?.height}
        />
      )}
      {dimensions && (
        <p>
          Dimensions: {dimensions.width} × {dimensions.height} px
        </p>
      )}
    </section>
  );
}
