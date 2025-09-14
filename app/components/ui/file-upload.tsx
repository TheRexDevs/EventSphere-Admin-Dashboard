"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  /**
   * Accept file types (e.g., "image/*", ".jpg,.png")
   */
  accept?: string;
  /**
   * Allow multiple file selection
   */
  multiple?: boolean;
  /**
   * Maximum file size in MB
   */
  maxSize?: number;
  /**
   * Current selected files
   */
  files?: File[];
  /**
   * Callback when files are selected
   */
  onFilesChange: (files: File[]) => void;
  /**
   * Label for the upload area
   */
  label?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Whether the upload is disabled
   */
  disabled?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * FileUpload
 *
 * A reusable file upload component with drag-and-drop support, size/type validation,
 * and image previews (for files with image/* MIME types). Designed for both single
 * and multiple file selection flows.
 */
export function FileUpload({
  accept = "image/*",
  multiple = false,
  maxSize = 10,
  files = [],
  onFilesChange,
  label = "Upload files",
  helperText,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      // Check file type
      if (accept !== "*" && !file.type.match(accept.replace(/\*/g, ".*"))) {
        alert(`File "${file.name}" is not a supported format.`);
        return;
      }

      validFiles.push(file);
    });

    if (multiple) {
      onFilesChange([...files, ...validFiles]);
    } else {
      onFilesChange(validFiles.slice(0, 1));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Generate and manage preview URLs for image files
  React.useEffect(() => {
    const urls = files
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : disabled
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${disabled ? "bg-gray-100" : "bg-gray-50"}`}>
              <Upload className={`h-8 w-8 ${disabled ? "text-gray-400" : "text-gray-600"}`} />
            </div>
            
            <div>
              <p className={`text-lg font-medium ${disabled ? "text-gray-400" : "text-gray-900"}`}>
                {label}
              </p>
              <p className={`text-sm ${disabled ? "text-gray-300" : "text-gray-500"}`}>
                Drag and drop files here, or click to browse
              </p>
              {helperText && (
                <p className={`text-xs mt-1 ${disabled ? "text-gray-300" : "text-gray-400"}`}>
                  {helperText}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Selected Files - Image previews if available, otherwise list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Selected {multiple ? "Files" : "File"} ({files.length})
          </p>

          {/* Image previews */}
          {previewUrls.length > 0 && (
            <div className={`grid gap-3 ${multiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
              {files.map((file, index) => {
                const isImage = file.type.startsWith("image/");
                const url = isImage ? previewUrls[index] : undefined;
                return (
                  <div key={`${file.name}-${index}`} className="relative group border rounded-lg overflow-hidden bg-white">
                    {isImage && url ? (
                      <>
                        <img
                          src={url}
                          alt={file.name}
                          className={`w-full ${multiple ? "h-32" : "h-48"} object-cover`}
                          onClick={() => window.open(url, "_blank")}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button type="button" size="sm" variant="secondary" onClick={() => window.open(url, "_blank")}>
                            Preview
                          </Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => removeFile(index)}>
                            Remove
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Non-image files only */}
          {previewUrls.length === 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <ImageIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
