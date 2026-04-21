import { Dialog } from "@/components/ui/dialog";
import Badge from "@/components/ui/badge/badge";
import { ChevronDownIcon, CloseIcon, FileIcon } from "@/components/ui/icons";
import { SHOELACE_SIZES } from "@/enums";
import { TDatasetDummyFileVersion } from "@/features/datasets/utils/dataset-flow-mocks";
import useScreenSize from "@/hooks/use-screen-size";
import { DialogProps } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { FolderIcon } from "@/components/ui/icons/folder-icon";

type DatasetFilesDialogProps = DialogProps & {
  fileVersions: TDatasetDummyFileVersion[];
};

export const DatasetFilesDialog: React.FC<DatasetFilesDialogProps> = ({
  isOpened,
  closeDialog,
  fileVersions,
}) => {
  const { isSmallViewport } = useScreenSize();
  const defaultOpenVersion = useMemo(
    () =>
      fileVersions.find((version) => version.isLatest)?.version ??
      fileVersions[0]?.version ??
      "",
    [fileVersions],
  );
  const [openVersion, setOpenVersion] = useState(defaultOpenVersion);

  useEffect(() => {
    if (!isOpened) return;
    setOpenVersion(defaultOpenVersion);
  }, [defaultOpenVersion, isOpened]);

  return (
    <Dialog
      isOpened={isOpened}
      closeDialog={closeDialog}
      noHeader
      noPadding
      size={isSmallViewport ? SHOELACE_SIZES.EXTRA_LARGE : SHOELACE_SIZES.SMALL}
    >
      <div
        className="relative p-10 flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
       <div className="justify-end w-full flex items-end">
         <button
          type="button"
          onClick={closeDialog}
          className="p-1 rounded-full bg-off-white"
          aria-label="Close dataset files modal"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
       </div>

        <div className="max-h-[92vh] ">
          <div className="space-y-6">
            <div className="space-y-2 pr-12">
              <h2 className="text-body-text-2 font-semibold text-dark">
                Dataset File
              </h2>
              <p className="max-w-[280px] text-sm text-dark">
                Dataset file contains imagery, AOI, and labels...
              </p>
            </div>

            <div className="space-y-1">
              {fileVersions.map((version) => {
                const isExpanded = openVersion === version.version;

                return (
                  <div key={version.version}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenVersion((currentVersion) =>
                          currentVersion === version.version
                            ? ""
                            : version.version,
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left  "
                    >
                      <ChevronDownIcon
                        className={`h-3 w-3 text-dark transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                      />
                      <FolderIcon className="h-5 w-5 text-dark" />
                      <span className="text-body-2base font-medium text-dark">
                        Version {version.version}
                      </span>
                      {version.isLatest && (
                        <Badge
                          variant="default"
                          className=" !bg-off-white !px-3 !py-1 !text-[11px] !font-medium !text-dark"
                        >
                          Latest
                        </Badge>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="ml-[8px] border-l  pl-7">
                        <div className="space-y-4 py-2">
                          {version.files.map((file) => (
                            <div
                              key={`${version.version}-${file.name}`}
                              className="flex items-center gap-3"
                            >
                              <FileIcon className="h-4 w-4 shrink-0 text-dark" />
                              <span className="min-w-0 flex-1 truncate text-body-2base text-dark">
                                {file.name}
                              </span>
                              <span className="shrink-0 text-body-3 text-grey">
                                {file.size}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
