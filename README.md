# Under Limit

**Fits the form on the first try.**

Under Limit is a browser-based image resizing and compression tool for websites and online forms that enforce image dimension and file-size requirements.

Choose an image, set the required dimensions and file-size range, select an output format, and resize it. You can preview the result, compare file sizes, and download the processed image.

**Live:** https://under-limit.vercel.app

## Features

- Upload images by browsing files or dragging and dropping them.
- Supports JPEG, PNG, and WebP.
- Set custom width and height in pixels.
- Specify minimum and maximum file sizes in KB.
- Choose the output format.
- Preview the original and resized images.
- Compare the original and processed file sizes.
- Download the resized image.
- Remove an image and start again.

Image processing happens in the browser using the Canvas API. Images are not uploaded to an application server for processing.

## Tech stack

- [Next.js](https://nextjs.org/) — application framework
- [React](https://react.dev/) — user interface
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Tailwind CSS](https://tailwindcss.com/) — styling
- Canvas API — image resizing and export
- [Vercel](https://vercel.com/) — deployment

## Getting started

### Prerequisites

- Node.js
- npm
- Git

### Installation

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd under-limit
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## How it works

1. Select an image or drop one into the upload area.
2. Enter the required width, height, and file-size range.
3. Choose JPEG, PNG, or WebP as the output format.
4. Select **Resize** to process the image.
5. Review the result and its file size.
6. Download the resized image.

JPEG and WebP exports use adjustable quality settings to try to fit the requested file-size range. PNG does not support the same quality adjustment through the browser's Canvas API, so a PNG may not meet the requested range at the selected dimensions.

## Privacy

Under Limit processes images locally in the browser. The image-processing workflow does not require uploading image files to a backend server.

## Development

Under Limit is an ongoing project. Automated testing and a GitHub Actions workflow are planned as part of the development process.

## Author

**Aswin Sankar TK**
GitHub: [@aswinsankartk](https://github.com/aswinsankartk)
