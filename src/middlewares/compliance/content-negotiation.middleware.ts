import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as zlib from "zlib";

/**
 * Supported Content Types
 */
enum ContentType {
  JSON = "application/json",
  XML = "application/xml",
  CSV = "text/csv",
  HTML = "text/html",
  YAML = "application/yaml",
  TEXT = "text/plain",
}

/**
 * Supported Compression Types
 */
enum CompressionType {
  GZIP = "gzip",
  DEFLATE = "deflate",
  BROTLI = "br",
  IDENTITY = "identity",
}

/**
 * Content Negotiation Configuration
 */
interface ContentNegotiationConfig {
  supportedTypes: ContentType[];
  defaultType: ContentType;
  enableCompression: boolean;
  compressionThreshold: number;
  supportedEncodings: CompressionType[];
  maxCompressionLevel: number;
  enableCaching: boolean;
  cacheMaxAge: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ContentNegotiationConfig = {
  supportedTypes: [ContentType.JSON, ContentType.XML, ContentType.CSV],
  defaultType: ContentType.JSON,
  enableCompression: true,
  compressionThreshold: 1024, // 1KB
  supportedEncodings: [
    CompressionType.GZIP,
    CompressionType.DEFLATE,
    CompressionType.BROTLI,
  ],
  maxCompressionLevel: 6,
  enableCaching: true,
  cacheMaxAge: 300, // 5 minutes
};

/**
 * Content Negotiation Middleware
 *
 * Handles content type negotiation based on Accept headers and query parameters.
 * Supports JSON, XML, CSV formats with automatic compression and caching.
 *
 * @param config - Content negotiation configuration
 */
export const contentNegotiationMiddleware = (
  config: Partial<ContentNegotiationConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // Determine requested content type
      const requestedType = negotiateContentType(req, finalConfig);

      // Determine requested encoding
      const requestedEncoding = negotiateEncoding(req, finalConfig);

      // Set negotiated types on request
      req.negotiatedContent = {
        type: requestedType,
        encoding: requestedEncoding,
        config: finalConfig,
      };

      // Override res.json to handle content type conversion
      const originalJson = res.json;
      res.json = function (data: any) {
        return handleContentResponse(
          this,
          data,
          req.negotiatedContent!,
          originalJson
        );
      };

      // Set content type header
      res.setHeader("Content-Type", requestedType);

      // Set compression headers if applicable
      if (requestedEncoding !== CompressionType.IDENTITY) {
        res.setHeader("Content-Encoding", requestedEncoding);
        res.setHeader("Vary", "Accept-Encoding");
      }

      // Set caching headers if enabled
      if (finalConfig.enableCaching) {
        res.setHeader(
          "Cache-Control",
          `public, max-age=${finalConfig.cacheMaxAge}`
        );
        res.setHeader(
          "Vary",
          res.getHeader("Vary") ? `${res.getHeader("Vary")}, Accept` : "Accept"
        );
      }

      console.log(
        `[CONTENT_NEGOTIATION] ${requestedType} | ${requestedEncoding} | ${req.method} ${req.path}`
      );
      next();
    } catch (error) {
      console.error("[CONTENT_NEGOTIATION] Negotiation error:", error);
      next(error);
    }
  };
};

/**
 * Negotiate content type based on Accept header and query parameters
 */
function negotiateContentType(
  req: Request,
  config: ContentNegotiationConfig
): ContentType {
  // 1. Check query parameter override (?format=xml)
  const formatParam = req.query.format as string;
  if (formatParam) {
    const requestedType = mapFormatToContentType(formatParam);
    if (requestedType && config.supportedTypes.includes(requestedType)) {
      return requestedType;
    }
  }

  // 2. Parse Accept header
  const acceptHeader = req.headers.accept;
  if (acceptHeader) {
    const acceptedTypes = parseAcceptHeader(acceptHeader);

    for (const type of acceptedTypes) {
      const contentType = mapMimeToContentType(type.mime);
      if (contentType && config.supportedTypes.includes(contentType)) {
        return contentType;
      }
    }
  }

  // 3. Default to configured default type
  return config.defaultType;
}

/**
 * Negotiate encoding based on Accept-Encoding header
 */
function negotiateEncoding(
  req: Request,
  config: ContentNegotiationConfig
): CompressionType {
  if (!config.enableCompression) {
    return CompressionType.IDENTITY;
  }

  const acceptEncoding = req.headers["accept-encoding"];
  if (!acceptEncoding) {
    return CompressionType.IDENTITY;
  }

  // Parse and prioritize encoding options
  const encodings = parseAcceptEncodingHeader(acceptEncoding);

  for (const encoding of encodings) {
    if (
      config.supportedEncodings.includes(encoding.encoding as CompressionType)
    ) {
      return encoding.encoding as CompressionType;
    }
  }

  return CompressionType.IDENTITY;
}

/**
 * Parse Accept header into prioritized list
 */
function parseAcceptHeader(
  acceptHeader: string
): Array<{ mime: string; quality: number }> {
  return acceptHeader
    .split(",")
    .map((type) => {
      const [mime, ...params] = type.trim().split(";");
      let quality = 1.0;

      // Parse quality parameter
      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key === "q" && value) {
          quality = parseFloat(value);
        }
      }

      return { mime: mime.trim(), quality };
    })
    .sort((a, b) => b.quality - a.quality);
}

/**
 * Parse Accept-Encoding header
 */
function parseAcceptEncodingHeader(
  acceptEncoding: string
): Array<{ encoding: string; quality: number }> {
  return acceptEncoding
    .split(",")
    .map((encoding) => {
      const [enc, ...params] = encoding.trim().split(";");
      let quality = 1.0;

      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key === "q" && value) {
          quality = parseFloat(value);
        }
      }

      return { encoding: enc.trim(), quality };
    })
    .sort((a, b) => b.quality - a.quality);
}

/**
 * Map format parameter to content type
 */
function mapFormatToContentType(format: string): ContentType | null {
  const formatMap: Record<string, ContentType> = {
    json: ContentType.JSON,
    xml: ContentType.XML,
    csv: ContentType.CSV,
    html: ContentType.HTML,
    yaml: ContentType.YAML,
    yml: ContentType.YAML,
    text: ContentType.TEXT,
    txt: ContentType.TEXT,
  };

  return formatMap[format.toLowerCase()] || null;
}

/**
 * Map MIME type to content type enum
 */
function mapMimeToContentType(mime: string): ContentType | null {
  const mimeMap: Record<string, ContentType> = {
    "application/json": ContentType.JSON,
    "application/xml": ContentType.XML,
    "text/xml": ContentType.XML,
    "text/csv": ContentType.CSV,
    "application/csv": ContentType.CSV,
    "text/html": ContentType.HTML,
    "application/yaml": ContentType.YAML,
    "text/yaml": ContentType.YAML,
    "text/plain": ContentType.TEXT,
    "*/*": ContentType.JSON, // Default for wildcard
  };

  return mimeMap[mime.toLowerCase()] || null;
}

/**
 * Handle content response with type conversion and compression
 */
function handleContentResponse(
  res: Response,
  data: any,
  negotiatedContent: any,
  originalJson: Function
): Response {
  try {
    // Convert data to requested format
    const convertedData = convertDataToFormat(data, negotiatedContent.type);

    // Check if compression is needed
    const shouldCompress =
      negotiatedContent.encoding !== CompressionType.IDENTITY &&
      convertedData.length >= negotiatedContent.config.compressionThreshold;

    if (shouldCompress) {
      // Compress and send
      compressAndSend(res, convertedData, negotiatedContent.encoding);
    } else {
      // Send uncompressed
      if (negotiatedContent.type === ContentType.JSON) {
        return originalJson.call(
          res,
          typeof convertedData === "string"
            ? JSON.parse(convertedData)
            : convertedData
        );
      } else {
        res.send(convertedData);
      }
    }

    return res;
  } catch (error) {
    console.error("[CONTENT_NEGOTIATION] Response conversion error:", error);
    // Fallback to original JSON
    return originalJson.call(res, data);
  }
}

/**
 * Convert data to requested format
 */
function convertDataToFormat(data: any, contentType: ContentType): string {
  switch (contentType) {
    case ContentType.JSON:
      return JSON.stringify(data, null, 2);

    case ContentType.XML:
      return convertToXML(data);

    case ContentType.CSV:
      return convertToCSV(data);

    case ContentType.YAML:
      return convertToYAML(data);

    case ContentType.HTML:
      return convertToHTML(data);

    case ContentType.TEXT:
      return typeof data === "string" ? data : JSON.stringify(data, null, 2);

    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Convert data to XML format
 */
function convertToXML(data: any, rootElement = "response"): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

  function objectToXML(obj: any, tagName = "item"): string {
    if (obj === null || obj === undefined) {
      return `<${tagName} />`;
    }

    if (typeof obj !== "object") {
      return `<${tagName}>${escapeXML(obj.toString())}</${tagName}>`;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => objectToXML(item, tagName)).join("");
    }

    let xml = `<${tagName}>`;
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
      xml += objectToXML(value, sanitizedKey);
    }
    xml += `</${tagName}>`;

    return xml;
  }

  function escapeXML(str: string): string {
    return str
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  return xmlHeader + "\n" + objectToXML(data, rootElement);
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any): string {
  if (!Array.isArray(data)) {
    // Single object - convert to single row
    data = [data];
  }

  if (data.length === 0) {
    return "";
  }

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach((item: any) => {
    if (typeof item === "object" && item !== null) {
      Object.keys(item).forEach((key) => allKeys.add(key));
    }
  });

  const headers = Array.from(allKeys);

  // Create CSV header
  let csv = headers.map(escapeCSV).join(",") + "\n";

  // Add data rows
  data.forEach((item: any) => {
    const row = headers.map((header) => {
      const value = item?.[header] ?? "";
      return escapeCSV(value);
    });
    csv += row.join(",") + "\n";
  });

  return csv;

  function escapeCSV(value: any): string {
    const str = value?.toString() || "";
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }
}

/**
 * Convert data to YAML format
 */
function convertToYAML(data: any, indent = 0): string {
  const spaces = "  ".repeat(indent);

  if (data === null || data === undefined) {
    return "null";
  }

  if (typeof data === "string") {
    return `"${data.replace(/"/g, '\\"')}"`;
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return data.toString();
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return "[]";
    return (
      "\n" +
      data
        .map((item) => `${spaces}- ${convertToYAML(item, indent + 1)}`)
        .join("\n")
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length === 0) return "{}";
    return (
      "\n" +
      entries
        .map(
          ([key, value]) =>
            `${spaces}${key}: ${convertToYAML(value, indent + 1)}`
        )
        .join("\n")
    );
  }

  return data.toString();
}

/**
 * Convert data to HTML format
 */
function convertToHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>API Response</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .json { background: #f4f4f4; padding: 15px; border-radius: 5px; }
        pre { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>API Response</h1>
    <div class="json">
        <pre>${JSON.stringify(data, null, 2)}</pre>
    </div>
    <p><em>Generated at: ${new Date().toISOString()}</em></p>
</body>
</html>`;
}

/**
 * Compress and send response
 */
function compressAndSend(
  res: Response,
  data: string,
  encoding: CompressionType
): void {
  const buffer = Buffer.from(data, "utf8");

  switch (encoding) {
    case CompressionType.GZIP:
      zlib.gzip(buffer, (err, compressed) => {
        if (err) {
          console.error("[CONTENT_NEGOTIATION] GZIP compression error:", err);
          res.send(data);
        } else {
          res.send(compressed);
        }
      });
      break;

    case CompressionType.DEFLATE:
      zlib.deflate(buffer, (err, compressed) => {
        if (err) {
          console.error(
            "[CONTENT_NEGOTIATION] Deflate compression error:",
            err
          );
          res.send(data);
        } else {
          res.send(compressed);
        }
      });
      break;

    case CompressionType.BROTLI:
      zlib.brotliCompress(buffer, (err, compressed) => {
        if (err) {
          console.error("[CONTENT_NEGOTIATION] Brotli compression error:", err);
          res.send(data);
        } else {
          res.send(compressed);
        }
      });
      break;

    default:
      res.send(data);
  }
}

// =============================================================================
// PRE-CONFIGURED CONTENT NEGOTIATION MIDDLEWARES
// =============================================================================

/**
 * Basic content negotiation (JSON, XML, CSV)
 */
export const basicContentNegotiation = contentNegotiationMiddleware({
  supportedTypes: [ContentType.JSON, ContentType.XML, ContentType.CSV],
  enableCompression: true,
});

/**
 * Full content negotiation (all formats)
 */
export const fullContentNegotiation = contentNegotiationMiddleware({
  supportedTypes: [
    ContentType.JSON,
    ContentType.XML,
    ContentType.CSV,
    ContentType.YAML,
    ContentType.HTML,
  ],
  enableCompression: true,
  enableCaching: true,
});

/**
 * API-only content negotiation (JSON, XML)
 */
export const apiContentNegotiation = contentNegotiationMiddleware({
  supportedTypes: [ContentType.JSON, ContentType.XML],
  enableCompression: true,
  compressionThreshold: 500,
});

/**
 * Export content negotiation (CSV, YAML, JSON)
 */
export const exportContentNegotiation = contentNegotiationMiddleware({
  supportedTypes: [ContentType.CSV, ContentType.YAML, ContentType.JSON],
  enableCompression: true,
  enableCaching: false,
});

// Extend AuthenticatedRequest interface
declare global {
  namespace Express {
    interface Request {
      negotiatedContent?: {
        type: ContentType;
        encoding: CompressionType;
        config: ContentNegotiationConfig;
      };
    }
  }
}

export { ContentType, CompressionType };
export default contentNegotiationMiddleware;
