"use client";
import { useState, useEffect } from "react";

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  useEffect(() => {
    let previewUrl: string | null = null;
    if (image) {
      previewUrl = URL.createObjectURL(image);
      setPreviewUrl(previewUrl);
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [image]);
  return (
    <section>
      <h2>Image workspace</h2>
      <p>Choose an image to get started.</p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
      />
      {image && (
        <p>
          {image.name} - {(image.size / 1024).toFixed(2)} KB
        </p>
      )}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected image preview"
          className="mt-4 max-w-full rounded-xl object-contain"
        />
      )}
    </section>
  );
}
