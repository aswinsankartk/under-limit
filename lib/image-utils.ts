const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isSupportedImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type);
}
