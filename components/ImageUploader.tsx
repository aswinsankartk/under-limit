"use client";

import { isSupportedImageType } from "../lib/image-utils";

import { LuImage } from "react-icons/lu";
import { IoResize } from "react-icons/io5";

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

  const [isDragging, setIsDragging] = useState(false);

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
    const file = event.target.files?.[0];
    if (file) {
      handleSelectedFile(file);
    }
  };

  const handleRemoveImage = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setImage(null);
    setPreviewUrl(null);
    setDimensions(null);
    setTargetWidth(null);
    setTargetHeight(null);

    if (resizedUrlRef.current) {
      URL.revokeObjectURL(resizedUrlRef.current);
      resizedUrlRef.current = null;
    }

    setResizedBlob(null);
    setResizedPreviewUrl(null);
    setError(null);
  };

  const handleSelectedFile = (file: File) => {
    if (!isSupportedImageType(file.type)) {
      setError(
        "Unsupported file type. Please select a JPEG, PNG, or WebP image.",
      );
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
    urlRef.current = url;

    setImage(file);
    setPreviewUrl(url);
    setDimensions(null);
    setError(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      handleSelectedFile(file);
    }
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

  const originalSizeKB = image ? image.size / 1024 : null;
  const resizedSizeKB = resizedBlob ? resizedBlob.size / 1024 : null;

  const sizeSavedKB =
    originalSizeKB !== null && resizedSizeKB !== null
      ? originalSizeKB - resizedSizeKB
      : null;

  const reductionPercentage =
    originalSizeKB !== null && originalSizeKB > 0 && sizeSavedKB !== null
      ? (sizeSavedKB / originalSizeKB) * 100
      : null;

  return (
    <section className="space-y-6 transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Image Workspace</h2>

          <span className="rounded-full bg-[#D4EBCB] px-3 py-1 text-xs font-medium text-[#2F2724]">
            {image ? "Image selected" : "Ready for upload"}
          </span>
        </div>

        <label
          htmlFor="image-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
            isDragging
              ? "border-[#B5523C] bg-[#D9A895]/30"
              : "border-[#D9A895] bg-white/20 hover:bg-white/40"
          }`}
        >
          <span className="text-sm font-medium">
            Drag and drop or upload your image
          </span>

          <span className="text-xs text-[#765C40]">JPG, PNG or WebP</span>

          <span className="rounded-full bg-[#E7D8CF] px-3 py-2 text-sm">
            Browse files
          </span>
        </label>

        <input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
          className="sr-only"
        />

        {image && (
          <div className="flex justify-center">
            <div className="flex max-w-full items-center gap-2 rounded-full bg-[#E7D8CF] px-3 py-2 text-sm">
              <span className="truncate">{image.name}</span>
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="Remove selected image"
                className="shrink-0 rounded-full p-1 transition-colors hover:bg-[#D9A895]"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-terracotta">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label htmlFor="targetWidth">Target Width (px) </label>
          <input
            type="number"
            id="targetWidth"
            value={targetWidth ?? ""}
            min={1}
            step={1}
            onChange={(e) =>
              setTargetWidth(
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            placeholder="Target Width"
            className="w-full rounded-lg border border-charcoal-brown/15 bg-white px-3 py-2"
          />
          <label htmlFor="targetHeight">Target Height (px) </label>
          <input
            type="number"
            id="targetHeight"
            value={targetHeight ?? ""}
            min={1}
            step={1}
            onChange={(e) =>
              setTargetHeight(
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            placeholder="Target Height"
            className="w-full rounded-lg border border-charcoal-brown/15 bg-white px-3 py-2"
          />
          <label htmlFor="minimumFileSize">Minimum File Size (KB)</label>
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
            className="w-full rounded-lg border border-charcoal-brown/15 bg-white px-3 py-2"
          />
          <label htmlFor="maximumFileSize">Maximum File Size (KB)</label>
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
            className="w-full rounded-lg border border-charcoal-brown/15 bg-white px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="outputFormat" className="block text-sm font-medium">
            Output Format:
          </label>
          <select
            id="outputFormat"
            value={outputFormat}
            onChange={(e) =>
              setOutputFormat(
                e.target.value as "image/jpeg" | "image/png" | "image/webp",
              )
            }
            className="w-full appearance-none rounded-xl border border-[#D9A895] bg-[#FBF4EF] px-4 py-3 font-sans text-[#2F2724] outline-none transition focus:border-[#B5523C] focus:ring-2 focus:ring-[#B5523C]/20"
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>

        <button
          onClick={handleResize}
          className="w-full rounded-lg bg-terracotta px-5 py-3 font-semibold text-white transition-colors hover:bg-charcoal-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Resize
        </button>
      </div>
      <div>
        {/* Combined grid */}
        {image && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Original image card */}
            <div className="min-w-0 rounded-2xl border border-charcoal-brown/10 bg-white/60 p-4 sm:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Original image
              </h3>
              {previewUrl && dimensions && (
                <Image
                  src={previewUrl}
                  alt="Selected image preview"
                  className="mt-4 max-w-full rounded-xl object-contain"
                  width={dimensions?.width}
                  height={dimensions?.height}
                />
              )}
              {image && dimensions && (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="flex gap-2 items-center">
                    <LuImage />
                    {dimensions.width} × {dimensions.height} px
                  </p>
                  <p className="flex gap-2 items-center">
                    <IoResize />
                    {(image.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
              {!previewUrl && (
                <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-charcoal-brown/15 p-6 text-center">
                  <p className="font-medium">
                    Your original image will appear here
                  </p>
                  <p className="text-sm text-charcoal-brown/60">
                    Choose a JPG, PNG or WebP image to get started.
                  </p>
                </div>
              )}
            </div>
            {/* Resized image card */}
            <div className="min-w-0 rounded-2xl border border-charcoal-brown/10 bg-white/60 p-4 sm:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Resized image
              </h3>
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
                  <div className="className=mt-2 flex flex-col gap-2">
                    <div></div>
                    <p className="flex gap-2 items-center">
                      <LuImage />
                      {targetWidth} × {targetHeight} px
                    </p>
                    {resizedBlob && resizedPreviewUrl && (
                      <p className="flex gap-2 items-center">
                        <IoResize />
                        {(resizedBlob.size / 1024).toFixed(2)} KB
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!resizedPreviewUrl && (
                <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-charcoal-brown/15 p-6 text-center">
                  <p className="font-medium">
                    Your resized image will appear here
                  </p>
                  <p className="text-sm text-charcoal-brown/60">
                    Choose your settings and select Resize image to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {resizedPreviewUrl && (
          <a
            href={resizedPreviewUrl}
            download={`under-limit-image.${outputExtension}`}
            className="flex justify-center rounded-lg bg-terracotta px-5 py-3 font-semibold text-white transition-colors hover:bg-charcoal-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta mt-3 lg:text-sm "
          >
            Download Resized Image
          </a>
        )}
      </div>

      {resizedBlob && (
        <div className="mt-6 rounded-2xl border border-charcoal-brown/10 bg-white/60 p-5 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Size comparison
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <p>Original: {originalSizeKB?.toFixed(2)} KB</p>
            <p>Resized: {resizedSizeKB?.toFixed(2)} KB</p>
          </div>
          {originalSizeKB !== null &&
            resizedSizeKB !== null &&
            originalSizeKB > resizedSizeKB && (
              <div>
                <p>{reductionPercentage?.toFixed(0)}% smaller</p>
                <p>{sizeSavedKB?.toFixed(2)} KB saved</p>
              </div>
            )}
          {originalSizeKB !== null &&
            resizedSizeKB !== null &&
            originalSizeKB < resizedSizeKB && (
              <div>
                <p>
                  The resized image is{" "}
                  {(resizedSizeKB - originalSizeKB).toFixed(2)} KB larger than
                  the original.
                </p>
              </div>
            )}
          {originalSizeKB !== null &&
            resizedSizeKB !== null &&
            originalSizeKB === resizedSizeKB && (
              <p>The file size remained unchanged.</p>
            )}
        </div>
      )}
    </section>
  );
}
