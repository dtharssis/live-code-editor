export interface FileEntry {
  path:    string;
  content: string;
}

export interface IZipPort {
  download(files: FileEntry[], zipName: string): Promise<void>;
}
