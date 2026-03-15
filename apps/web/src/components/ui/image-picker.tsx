"use client";

import { Cancel01Icon, Image02Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_FILE_SIZE = 1024 * 1024;

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

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newFiles = Array.from(incoming).filter(
        (f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE,
      );

      const combined = [...value, ...newFiles].slice(0, maxFiles);
      onChange(combined);
    },
    [value, onChange, maxFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      if (e.dataTransfer.files?.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles, disabled],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
        // Reset so the same file can be re-selected
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const canAddMore = value.length < maxFiles;

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone (shown when no images selected, or when can add more) */}
      {canAddMore && (
        <div
          // oxlint-disable-next-line jsx_a11y/prefer-tag-over-role
          role="button"
          tabIndex={0}
          aria-disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onKeyUp={() => inputRef.current?.click()}
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
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon icon={Image02Icon} className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Drop your images here</span>
            <span className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, AVIF or GIF (max. 1MB)
            </span>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={disabled} tabIndex={-1}>
            <HugeiconsIcon icon={Upload04Icon} className="mr-1.5 size-3.5" />
            Select images
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
        disabled={disabled}
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
                <HugeiconsIcon icon={Upload04Icon} className="mr-1.5 size-3.5" />
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
      <img
        src={src}
        alt={file.name}
        className="size-full object-cover"
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

  const totalCount = existingImages.length + newFiles.length;
  const canAddMore = totalCount < maxFiles;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const filtered = Array.from(incoming).filter(
        (f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE,
      );
      const slotsLeft = maxFiles - existingImages.length - newFiles.length;
      const toAdd = filtered.slice(0, Math.max(0, slotsLeft));
      onNewFilesChange([...newFiles, ...toAdd]);
    },
    [existingImages.length, newFiles, onNewFilesChange, maxFiles],
  );

  const removeNewFile = useCallback(
    (index: number) => {
      onNewFilesChange(newFiles.filter((_, i) => i !== index));
    },
    [newFiles, onNewFilesChange],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      if (e.dataTransfer.files?.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles, disabled],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  return (
    <div className="flex flex-col gap-3">
      {canAddMore && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
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
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon icon={Image02Icon} className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Drop your images here</span>
            <span className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, AVIF or GIF (max. 1MB)
            </span>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={disabled} tabIndex={-1}>
            <HugeiconsIcon icon={Upload04Icon} className="mr-1.5 size-3.5" />
            Select images
          </Button>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {totalCount > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
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
                <HugeiconsIcon icon={Upload04Icon} className="mr-1.5 size-3.5" />
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
                <img src={img.url} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onExistingRemove(img.key)}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white transition-opacity hover:bg-black/90 disabled:pointer-events-none"
                  aria-label="Remove image"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2} />
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
