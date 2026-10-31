import { describe, expect, it } from "vitest";
import { isSupportedImageType } from "../lib/image-utils";

describe("isSupportedImageType", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (type) => {
    expect(isSupportedImageType(type)).toBe(true);
  });

  it.each(["image/gif", "applicatioon/pdf", "text/plain", ""])(
    "reject %s",
    (type) => {
      expect(isSupportedImageType(type)).toBe(false);
    },
  );
});
