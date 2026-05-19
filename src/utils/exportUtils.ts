import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export function exportPNG(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `${filename}.png`);
    }
  }, 'image/png');
}

export async function exportZIP(frames: HTMLCanvasElement[], filename: string): Promise<void> {
  const zip = new JSZip();

  const promises = frames.map((frame, i) => {
    return new Promise<void>((resolve) => {
      frame.toBlob((blob) => {
        if (blob) {
          zip.file(`frame-${String(i + 1).padStart(3, '0')}.png`, blob);
        }
        resolve();
      }, 'image/png');
    });
  });

  await Promise.all(promises);
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${filename}.zip`);
}
