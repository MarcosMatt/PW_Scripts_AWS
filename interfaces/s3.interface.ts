// ----- interface para S3 -------
export interface S3UploadResult {
    key: string;
    bucket: string;
    contentType: string;
}

// ----- Type estricto para ContentType para S3 -----
export type S3ContentType =
    | 'text/html'
    | 'application/json'
    | 'text/plain'
    | 'image/png'
    | 'image/jpg'
    | 'application/pdf'