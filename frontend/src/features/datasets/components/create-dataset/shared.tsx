import { CloseIcon, InfoIcon } from "@/components/ui/icons";

export const FieldLabel = ({
  label,
  showInfoIcon = true,
}: {
  label: string;
  showInfoIcon?: boolean;
}) => (
  <label className="mb-2 inline-flex items-center gap-x-2 text-body-3 font-semibold text-dark">
    {label}
    {showInfoIcon ? <InfoIcon className="h-4 w-4 text-grey" /> : null}
  </label>
);

export const InputClassName =
  "w-full rounded border border-gray-border bg-white px-4 py-3 text-body-2base text-dark outline-none transition-colors focus:border-primary";

export const ModalShell = ({
  children,
  onClose,
  showClose = true,
  className = "",
  closeButtonClassName = "",
}: {
  children: React.ReactNode;
  onClose: () => void;
  showClose?: boolean;
  className?: string;
  closeButtonClassName?: string;
}) => (
  <div className={`relative p-5 ${className}`}>
    {showClose ? (
      <button
        type="button"
        className={`absolute right-1 top-1 rounded-full bg-light-gray p-2 text-grey hover:text-dark ${closeButtonClassName}`}
        onClick={onClose}
        aria-label="Close dialog"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    ) : null}
    {children}
  </div>
);

export const createSelectOptions = (options: string[]) =>
  options.map((option) => ({
    name: option,
    value: option,
  }));
