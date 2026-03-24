"use client";

import {
  Cancel01Icon,
  Image02Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];
const MAX_SOURCE_SIZE = 5 * 1024 * 1024; // 5MB — compressed before upload
const MAX_OPTIMIZED_SIZE = 0.5 * 1024 * 1024; // 512KB
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

// Skip compression if already within limit. This avoids format re-encoding issues
// (eg. AVIF → canvas → PNG blowup since browsers lack native AVIF encoding)
const compressFile = (f: File) =>
  f.size <= MAX_OPTIMIZED_SIZE
    ? Promise.resolve(f)
    : imageCompression(f, COMPRESSION_OPTIONS);

interface ImagePickerProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
  disabled?: boolean;
}

export const ImagePicker = ({
  value,
  onChange,
  maxFiles = 3,
  error,
  disabled = false,
}: ImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const addFiles = async (incoming: FileList | File[]) => {
    const filtered = Array.from(incoming).filter(
      (f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SOURCE_SIZE,
    );
    if (filtered.length === 0) return;

    setCompressing(true);
    try {
      const compressed = await Promise.all(filtered.map(compressFile));
      const combined = [...value, ...compressed].slice(0, maxFiles);
      onChange(combined);
    } finally {
      setCompressing(false);
    }
  };

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
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
    if (disabled || compressing) return;
    if (e.dataTransfer.files?.length) {
      void addFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      void addFiles(e.target.files);
      // reset so the same file can be re-selected
      e.target.value = "";
    }
  };

  const canAddMore = value.length < maxFiles;

  return (
    <div className="flex flex-col gap-3">
      {/* drop zone (shown when no images selected or when can add more) */}
      {canAddMore && (
        <div
          // oxlint-disable-next-line jsx_a11y/prefer-tag-over-role
          role="button"
          tabIndex={0}
          aria-disabled={disabled || compressing}
          onClick={() => !compressing && inputRef.current?.click()}
          onKeyUp={() => !compressing && inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors",
            dragActive
              ? "border-ring bg-accent/50"
              : "border-input hover:border-ring hover:bg-accent/30",
            error && "border-destructive",
            (disabled || compressing) && "pointer-events-none opacity-50",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon
              icon={Image02Icon}
              className="size-5 text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {compressing ? "Optimizing..." : "Drop your images here"}
            </span>
            <span className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, AVIF or GIF (up to 5MB, auto-optimized)
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || compressing}
            tabIndex={-1}
          >
            <HugeiconsIcon icon={Upload04Icon} className="mr-1.5 size-3.5" />
            {compressing ? "Optimizing..." : "Select images"}
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || compressing}
      />

      {/* Image previews */}
      {value.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">
              Uploaded files ({value.length}/{maxFiles})
            </span>
            {canAddMore && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <HugeiconsIcon
                  icon={Upload04Icon}
                  className="mr-1.5 size-3.5"
                />
                Add more
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {value.map((file, index) => (
              <ImagePreview
                key={`${file.name}-${file.lastModified}`}
                file={file}
                onRemove={() => removeFile(index)}
                disabled={disabled}
              />
            ))}
          </div>

          {value.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start text-muted-foreground"
              disabled={disabled}
              onClick={() => onChange([])}
            >
              Remove all files
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

const ImagePreview = ({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled: boolean;
}) => {
  const [src] = useState(() => URL.createObjectURL(file));

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
      <Image
        src={src}
        alt={file.name}
        fill
        className="object-cover"
        unoptimized
        onLoad={() => {
          // Revoke on load to prevent leaks while keeping the preview visible
          URL.revokeObjectURL(src);
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 disabled:pointer-events-none"
        aria-label={`Remove ${file.name}`}
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2} />
      </button>
    </div>
  );
};

// Variant for update dialog — shows existing URL-based images alongside new File-based images
interface ExistingImage {
  url: string;
  key: string;
}

interface UpdateImagePickerProps {
  existingImages: ExistingImage[];
  newFiles: File[];
  onExistingRemove: (key: string) => void;
  onNewFilesChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
  disabled?: boolean;
}

export function UpdateImagePicker({
  existingImages,
  newFiles,
  onExistingRemove,
  onNewFilesChange,
  maxFiles = 3,
  error,
  disabled = false,
}: UpdateImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const totalCount = existingImages.length + newFiles.length;
  const canAddMore = totalCount < maxFiles;

  const addFiles = async (incoming: FileList | File[]) => {
    const filtered = Array.from(incoming).filter(
      (f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SOURCE_SIZE,
    );
    const slotsLeft = maxFiles - existingImages.length - newFiles.length;
    const toCompress = filtered.slice(0, Math.max(0, slotsLeft));
    if (toCompress.length === 0) return;

    setCompressing(true);
    try {
      const compressed = await Promise.all(toCompress.map(compressFile));
      onNewFilesChange([...newFiles, ...compressed]);
    } finally {
      setCompressing(false);
    }
  };

  const removeNewFile = (index: number) => {
    onNewFilesChange(newFiles.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
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
    if (disabled || compressing) return;
    if (e.dataTransfer.files?.length) {
      void addFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      void addFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {canAddMore && (
        <div
          // oxlint-disable-next-line jsx_a11y/prefer-tag-over-role
          role="button"
          tabIndex={0}
          aria-disabled={disabled || compressing}
          onClick={() => !compressing && inputRef.current?.click()}
          onKeyUp={() => !compressing && inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors",
            dragActive
              ? "border-ring bg-accent/50"
              : "border-input hover:border-ring hover:bg-accent/30",
            error && "border-destructive",
            (disabled || compressing) && "pointer-events-none opacity-50",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon
              icon={Image02Icon}
              className="size-5 text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {compressing ? "Optimizing..." : "Drop your images here"}
            </span>
            <span className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, AVIF or GIF (up to 5MB, auto-optimized)
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || compressing}
            tabIndex={-1}
          >
            <HugeiconsIcon icon={Upload04Icon} className="mr-1.5 size-3.5" />
            {compressing ? "Optimizing..." : "Select images"}
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || compressing}
      />

      {/* Image previews */}
      {totalCount > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">
              Images ({totalCount}/{maxFiles})
            </span>
            {canAddMore && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <HugeiconsIcon
                  icon={Upload04Icon}
                  className="mr-1.5 size-3.5"
                />
                Add more
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {existingImages.map((img) => (
              <div
                key={img.key}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onExistingRemove(img.key)}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 disabled:pointer-events-none"
                  aria-label="Remove image"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    className="size-3"
                    strokeWidth={2}
                  />
                </button>
              </div>
            ))}

            {newFiles.map((file, index) => (
              <ImagePreview
                key={`${file.name}-${file.lastModified}`}
                file={file}
                onRemove={() => removeNewFile(index)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
