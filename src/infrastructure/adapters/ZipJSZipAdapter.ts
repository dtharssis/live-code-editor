import JSZip from 'jszip';
import { IZipPort, FileEntry } from '../../domain/ports/output/IZipPort';

/**
 * Infrastructure adapter: implements IZipPort using JSZip.
 * Generates a zip blob and triggers a browser download.
 */
export class ZipJSZipAdapter implements IZipPort {
  async download(files: FileEntry[], zipName: string): Promise<void> {
    const zip = new JSZip();

    for (const { path, content } of files) {
      zip.file(path, content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
}
