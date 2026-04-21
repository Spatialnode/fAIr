import { FormLabel } from "@/components/ui/form";
import { DeleteIcon } from "@/components/ui/icons";
import { UploadFileIcon } from "@/components/ui/icons/upload-file-icon";
import { UploadedFilePreviewIcon } from "@/components/ui/icons/uploaded-file-preview-icon";
import { useRef } from "react";

type ImageUploadFieldProps = {
  label: string;
  tooltipContent: string;
  fileName?: string;
  accept?: string;
  buttonLabel?: string;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
  onClear: () => void;
};

const triggerButtonClassName =
  "inline-flex h-10 w-fit bg-off-white items-center gap-2 rounded-md border border-gray-border p-3 text-body-2base text-dark disabled:cursor-not-allowed disabled:opacity-60";

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  tooltipContent,
  fileName = "",
  accept = "image/*",
  buttonLabel = "Select an image",
  disabled = false,
  onFileSelect,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
  };

  const handleClear = () => {
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <FormLabel label={label} withTooltip toolTipContent={tooltipContent} />
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={triggerButtonClassName}
        >
          <UploadFileIcon className="h-4 w-4 text-gray " />
          <span className="text-dark">{buttonLabel}</span>
        </button>

        {fileName ? (
          <>
            <div className="inline-flex min-w-0 items-center gap-2">
              <UploadedFilePreviewIcon className="size-6 text-grey" />
              <span className="truncate text-body-2base text-dark">
                {fileName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              aria-label={`Remove ${label}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#FDECEC] text-primary transition-colors hover:bg-[#F9DFDF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DeleteIcon className="size-5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};
