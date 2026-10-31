import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ImageUploader from "../components/ImageUploader";

describe("ImageUploader", () => {
  it("renders the upload workspace", () => {
    render(<ImageUploader />);

    expect(screen.getByText("Image Workspace")).toBeInTheDocument();
    expect(
      screen.getByText("Drag and drop or upload your image"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ready for upload")).toBeInTheDocument();
  });
  it("shows an error for an unsupported file type", () => {
    render(<ImageUploader />);

    const file = new File(["not an image"], "document.pdf", {
      type: "application/pdf",
    });
    const input = screen
      .getByLabelText(/drag and drop or upload your image/i)
      .parentElement?.querySelector('input[type="file"]');

    expect(input).not.toBeNull();

    fireEvent.change(input!, {
      target: { files: [file] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      /unsupported file type/i,
    );
  });
});
