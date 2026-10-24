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

  const [targetWidth, setTargetWidth] = useState<number | null>(null);
  const [targetHeight, setTargetHeight] = useState<number | null>(null);

  const dimensionsAreValid =
    targetWidth !== null &&
    Number.isInteger(targetWidth) &&
    targetWidth > 0 &&
    targetHeight !== null &&
    Number.isInteger(targetHeight) &&
    targetHeight > 0;

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

  const handleResize = () => {
    if (!dimensionsAreValid) {
      setError("Please enter valid positive whole-number dimensions.");
      return;
    }
    setError(null);
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
        setTargetWidth(bitmap.width);
        setTargetHeight(bitmap.height);
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
      <label htmlFor="targetWidth">Target Width:</label>
      <input
        type="number"
        id="targetWidth"
        value={targetWidth ?? ""}
        min={1}
        step={1}
        onChange={(e) =>
          setTargetWidth(e.target.value === "" ? null : Number(e.target.value))
        }
        placeholder="Target Width"
      />
      <label htmlFor="targetHeight">Target Height:</label>
      <input
        type="number"
        id="targetHeight"
        value={targetHeight ?? ""}
        min={1}
        step={1}
        onChange={(e) =>
          setTargetHeight(e.target.value === "" ? null : Number(e.target.value))
        }
        placeholder="Target Height"
      />
      <button onClick={handleResize}>Resize</button>
    </section>
  );
}
