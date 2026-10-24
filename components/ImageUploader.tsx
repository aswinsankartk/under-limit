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

  const [minimumFileSize, setMinimumFileSize] = useState<number | null>(null);
  const [maximumFileSize, setMaximumFileSize] = useState<number | null>(null);

  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const resizedUrlRef = useRef<string | null>(null);
  const [resizedPreviewUrl, setResizedPreviewUrl] = useState<string | null>(
    null,
  );

  const [outputFormat, setOutputFormat] = useState<
    "image/jpeg" | "image/png" | "image/webp"
  >("image/jpeg");

  const dimensionsAreValid =
    targetWidth !== null &&
    Number.isInteger(targetWidth) &&
    targetWidth > 0 &&
    targetHeight !== null &&
    Number.isInteger(targetHeight) &&
    targetHeight > 0;

  const fileSizeRangeIsValid =
    minimumFileSize !== null &&
    maximumFileSize !== null &&
    minimumFileSize >= 0 &&
    maximumFileSize >= 0 &&
    maximumFileSize > minimumFileSize &&
    Number.isFinite(maximumFileSize) &&
    Number.isFinite(minimumFileSize);

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
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    if (resizedUrlRef.current) {
      URL.revokeObjectURL(resizedUrlRef.current);
      resizedUrlRef.current = null;
    }

    setResizedBlob(null);
    setResizedPreviewUrl(null);

    const url = URL.createObjectURL(file);
    setImage(file);
    setPreviewUrl(url);
    setDimensions(null);
    setError(null);
  };

  const handleResize = async () => {
    if (!image) {
      setError("Please select an image before resizing.");
      return;
    }
    if (!dimensionsAreValid) {
      setError("Please enter valid positive whole-number dimensions.");
      return;
    }
    if (!fileSizeRangeIsValid) {
      setError("Please enter valid file size range.");
      return;
    }
    setResizedBlob(null);
    setResizedPreviewUrl(null);
    if (resizedUrlRef.current) {
      URL.revokeObjectURL(resizedUrlRef.current);
      resizedUrlRef.current = null;
    }
    setError(null);
    let bitmap: ImageBitmap | null = null;

    try {
      bitmap = await createImageBitmap(image);
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        setError("Failed to get canvas context.");
        return;
      }
      context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      let low = 0.05;
      let high = 1.0;
      let quality = 0.9;
      let bestResult: Blob | null = null;
      if (outputFormat === "image/png") {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (result) => {
              if (!result) {
                reject(new Error("Failed to export image."));
                return;
              }
              resolve(result);
            },
            outputFormat,
            quality,
          );
        });
        const blobSizeKB = blob.size / 1024;
        if (blobSizeKB >= minimumFileSize && blobSizeKB <= maximumFileSize) {
          bestResult = blob;
        } else {
          setError(
            "PNG cannot meet the requested range at the current dimensions. Please try reducing the dimensions or choosing another format.",
          );
          return;
        }
      } else {
        for (let attempt = 0; attempt < 10; attempt++) {
          quality = (low + high) / 2;
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (result) => {
                if (!result) {
                  reject(new Error("Failed to export image."));
                  return;
                }
                resolve(result);
              },
              outputFormat,
              quality,
            );
          });
          const blobSizeKB = blob.size / 1024;
          if (blobSizeKB > maximumFileSize) {
            high = quality;
          } else if (blobSizeKB < minimumFileSize) {
            low = quality;
          } else {
            bestResult = blob;
            low = quality;
          }
        }
      }

      if (!bestResult) {
        setError(
          "We couldn't fit this image within the requested file-size range at these dimensions. Try different dimensions or choosing another format.",
        );
        return;
      }
      setResizedBlob(bestResult);
      if (resizedUrlRef.current) {
        URL.revokeObjectURL(resizedUrlRef.current);
        resizedUrlRef.current = null;
      }
      const url = URL.createObjectURL(bestResult);
      resizedUrlRef.current = url;
      setResizedPreviewUrl(url);
    } catch (error) {
      console.error("Error resizing image", error);
      setError("We couldn't resize this image. Please try again.");
    } finally {
      if (bitmap) {
        bitmap.close();
      }
    }
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
      if (resizedUrlRef.current) {
        URL.revokeObjectURL(resizedUrlRef.current);
      }
    };
  }, []);

  const outputExtension =
    outputFormat === "image/jpeg"
      ? "jpg"
      : outputFormat === "image/png"
        ? "png"
        : "webp";
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
      <label htmlFor="minimumFileSize">Minimum File Size (KB):</label>
      <input
        type="number"
        id="minimumFileSize"
        value={minimumFileSize ?? ""}
        min={0}
        step={1}
        onChange={(e) =>
          setMinimumFileSize(
            e.target.value === "" ? null : Number(e.target.value),
          )
        }
        placeholder="Minimum File Size"
      />
      <label htmlFor="maximumFileSize">Maximum File Size (KB):</label>
      <input
        type="number"
        id="maximumFileSize"
        value={maximumFileSize ?? ""}
        min={0}
        step={1}
        onChange={(e) =>
          setMaximumFileSize(
            e.target.value === "" ? null : Number(e.target.value),
          )
        }
        placeholder="Maximum File Size"
      />
      <label htmlFor="outputFormat">Output Format:</label>
      <select
        id="outputFormat"
        value={outputFormat}
        onChange={(e) =>
          setOutputFormat(
            e.target.value as "image/jpeg" | "image/png" | "image/webp",
          )
        }
      >
        <option value="image/jpeg">JPEG</option>
        <option value="image/png">PNG</option>
        <option value="image/webp">WebP</option>
      </select>
      <button onClick={handleResize}>Resize</button>
      {resizedPreviewUrl && (
        <div>
          <Image
            src={resizedPreviewUrl}
            alt="Resized image preview"
            width={targetWidth!}
            height={targetHeight!}
            unoptimized
            className="mt-4 max-w-full rounded-xl object-contain"
          />
          <p>
            {targetWidth} × {targetHeight} px
          </p>
          {resizedBlob && resizedPreviewUrl && (
            <p>{(resizedBlob.size / 1024).toFixed(2)} KB</p>
          )}
          <a
            href={resizedPreviewUrl}
            download={`under-limit-image.${outputExtension}`}
          >
            Download Resized Image
          </a>
        </div>
      )}
    </section>
  );
}
