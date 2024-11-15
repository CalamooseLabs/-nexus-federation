type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type NumberPart = `${number}`;
type PreReleasePart = `-${string}`;
type BuildMetadataPart = `+${string}`;

type SemVer =
  | `${NumberPart}.${NumberPart}.${NumberPart}`
  | `${NumberPart}.${NumberPart}.${NumberPart}${PreReleasePart}`
  | `${NumberPart}.${NumberPart}.${NumberPart}${BuildMetadataPart}`
  | `${NumberPart}.${NumberPart}.${NumberPart}${PreReleasePart}${BuildMetadataPart}`;

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

type StandardHeaders =
  | "Accept"
  | "Accept-Charset"
  | "Accept-Encoding"
  | "Accept-Language"
  | "Authorization"
  | "Cache-Control"
  | "Connection"
  | "Content-Disposition"
  | "Content-Encoding"
  | "Content-Language"
  | "Content-Length"
  | "Content-Location"
  | "Content-Range"
  | "Content-Type"
  | "Cookie"
  | "Date"
  | "ETag"
  | "Expect"
  | "Expires"
  | "Forwarded"
  | "From"
  | "Host"
  | "If-Match"
  | "If-Modified-Since"
  | "If-None-Match"
  | "If-Range"
  | "If-Unmodified-Since"
  | "Last-Modified"
  | "Location"
  | "Origin"
  | "Pragma"
  | "Proxy-Authenticate"
  | "Range"
  | "Referer"
  | "Retry-After"
  | "Server"
  | "Set-Cookie"
  | "Strict-Transport-Security"
  | "TE"
  | "Trailer"
  | "Transfer-Encoding"
  | "Upgrade"
  | "User-Agent"
  | "Vary"
  | "Via"
  | "Warning"
  | "WWW-Authenticate"
  | "X-Content-Type-Options"
  | "X-DNS-Prefetch-Control"
  | "X-Forwarded-For"
  | "X-Forwarded-Host"
  | "X-Forwarded-Proto"
  | "X-Frame-Options"
  | "X-XSS-Protection";

type HeaderObject =
  & Partial<Record<StandardHeaders, string>>
  & Record<string, string>;

type UUID = `${string}-${string}-${string}-${string}-${string}`;
