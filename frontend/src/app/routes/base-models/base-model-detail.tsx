import { Head } from "@/components/seo";
import { BackButton, ButtonWithIcon } from "@/components/ui/button";
import { ChevronDownIcon, InfoIcon, MapIcon } from "@/components/ui/icons";
import { DownloadIconNew } from "@/components/ui/icons/download-icon";
import { ToolTip } from "@/components/ui/tooltip";
import { Link } from "@/components/ui/link";
import { APPLICATION_ROUTES } from "@/constants";
import { ButtonVariant } from "@/enums";

// import AccuracyDisplay from "@/features/models/components/accuracy-display";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBaseModel } from "@/features/base-models/hooks/use-base-models";
import MarkdownViewer from "@/components/shared/markdown-render";
import { BaseModelDetailSkeleton, BaseModelKeywords, ModelExtentMap } from "@/features/base-models/components";
import { formatDate } from "@/utils";

type TInfoRowConfig = {
  label: string;
  value: string;
  tooltip?: string;
};

type TMetadataItemProps = {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
};

/**
 * Collapsible section component for the right sidebar.
 */
const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="border-b border-gray-border pb-4 mb-4 last:border-b-0">
      <button
        className="flex items-center justify-between w-full text-left cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold text-body-1 text-dark">{title}</h3>
        <ChevronDownIcon
          className={`w-5 h-5 text-dark transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

const MetadataItem = ({ label, value, tooltip }: TMetadataItemProps) => (
  <div className="flex items-center gap-x-1">
    <span className="text-grey">{label}: </span>
    <span className="text-dark capitalize">{value}</span>
    {tooltip && (
      <ToolTip content={tooltip}>
        <InfoIcon className="w-3.5 h-3.5 text-grey cursor-help" />
      </ToolTip>
    )}
  </div>
);

/**
 * Info row for displaying a label/value pair with an optional info tooltip.
 */
const InfoRow = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) => (
  <div className="flex flex-col gap-y-1 py-2 ">
    <div className="flex items-center gap-x-1">
      <span className="text-grey text-body-3">{label}</span>
      {tooltip && (
        <ToolTip content={tooltip}>
          <InfoIcon className="w-3.5 h-3.5 text-grey cursor-help" />
        </ToolTip>
      )}
    </div>
    <p className="text-dark text-body-3 break-words">{value}</p>
  </div>
);


export const BaseModelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: model, isLoading, isError } = useBaseModel(id);

  if (isLoading) {
    return <BaseModelDetailSkeleton />;
  }

  if (isError || !model) {
    return <div className="py-20 text-center">Failed to load model</div>;
  }

  const architectureRows: TInfoRowConfig[] = model
    ? [
      { label: "Base Model", value: model.architecture.baseModel },
      { label: "Architecture", value: model.architecture.architecture },
      { label: "Framework", value: model.architecture.framework },
      { label: "Framework Version", value: model.architecture.frameworkVersion },
      { label: "Pretrained", value: model.architecture.pretrained },
      { label: "Pretrained Source", value: model.architecture.pretrainedSource },
      { label: "Accelerator", value: model.architecture.accelerator },
      { label: "Accelerator Count", value: model.architecture.acceleratorCount },
      { label: "CPU Request", value: model.architecture.cpuRequest },
      { label: "Memory Limit", value: model.architecture.memoryLimit },
      { label: "Tile Size px", value: model.architecture.tileSizePx },
      {
        label: "Processing",
        value: model.architecture.processing,
        tooltip: "Pre-processing steps applied",
      },
      {
        label: "Resize",
        value: model.architecture.resize,
        tooltip: "How images are resized before inference",
      },
      {
        label: "Scaling",
        value: model.architecture.scaling,
        tooltip: "Pixel value normalization method",
      },
      {
        label: "Description",
        value: model.architecture.outputDescription,
        tooltip: "Description of the model output",
      },
    ]
    : [];

  const mlmRows: TInfoRowConfig[] = model
    ? [
      { label: "Tasks", value: model.mlmTasks.join(", ") },
      // Input
      ...(model.mlmInput[0]
        ? [
          { label: "Input Name", value: model.mlmInput[0].name },
          {
            label: "Input Bands",
            value: model.mlmInput[0].bands.map((b: { name: string }) => b.name).join(", "),
          },
          { label: "Input Shape", value: model.mlmInput[0].input.shape.join(" × ") },
          { label: "Input Data Type", value: model.mlmInput[0].input.data_type },
          { label: "Input Dim Order", value: model.mlmInput[0].input.dim_order.join(", ") },
          ...(model.mlmInput[0].pre_processing_function
            ? [{ label: "Pre-processing", value: model.mlmInput[0].pre_processing_function.expression }]
            : []),
        ]
        : []),
      // Output
      ...(model.mlmOutput[0]
        ? [
          { label: "Output Name", value: model.mlmOutput[0].name },
          {
            label: "Output Bands",
            value:
              model.mlmOutput[0].bands.length > 0
                ? model.mlmOutput[0].bands.map((b: { name: string }) => b.name).join(", ")
                : "n/a",
          },
          { label: "Output Tasks", value: model.mlmOutput[0].tasks.join(", ") },
          { label: "Output Shape", value: model.mlmOutput[0].result.shape.join(" × ") },
          { label: "Output Data Type", value: model.mlmOutput[0].result.data_type },
          { label: "Output Dim Order", value: model.mlmOutput[0].result.dim_order.join(", ") },
          ...(model.mlmOutput[0]["classification:classes"]?.length
            ? [
              {
                label: "Classes",
                value: model.mlmOutput[0]["classification:classes"]
                  .map((c: { name: string; value: number }) => `${c.name} (${c.value})`)
                  .join(", "),
              },
            ]
            : []),
          ...(model.mlmOutput[0].post_processing_function
            ? [{ label: "Post-processing", value: model.mlmOutput[0].post_processing_function.expression }]
            : []),
        ]
        : []),
    ].filter((row) => row.value != null && row.value !== "")
    : [];

  const dataInfoRows: TInfoRowConfig[] = model
    ? [
      {
        label: "Sensor",
        value: model.dataInfo.sensor,
        tooltip: "Type of sensor used to capture imagery",
      },
      {
        label: "CRS",
        value: model.dataInfo.crs,
        tooltip: "Coordinate Reference System",
      },
      {
        label: "Spatial Extent",
        value: model.dataInfo.spatialExtent,
        tooltip: "Geographic coverage of training data",
      },
      {
        label: "Temporal Extent",
        value: model.dataInfo.temporalExtent,
        tooltip: "Time period of training data",
      },
    ]
    : [];



  const generalInfoRows: TInfoRowConfig[] = model
    ? [
      { label: "Created", value: formatDate(model.generatedOn) },
      { label: "License", value: model.modelWeightsLicense },
      { label: "Updated", value: formatDate(model.lastModified) },
      { label: "Data Version", value: model.version },
      { label: "Time of Data", value: formatDate(model.dataDatetime) },
    ].filter((row) => row.value != null && row.value !== "")
    : [];

  if (!model) {
    return null;
  }

  return (
    <>
      <Head title={`${model.fullTitle}`} />
      <BackButton className="mt-6" />

      <div className="my-8 flex flex-col gap-y-8">
        {/* Title + Start Mapping */}
        <div className="flex border-b pb-8 flex-col md:flex-row items-start md:items-center justify-between gap-y-4">
          <div className="flex flex-col gap-y-1">
            <h1 className="font-semibold text-title-1 md:text-title-2 text-dark">
              {model.fullTitle}
            </h1>
            <p className="text-grey text-body-3">Model ID: {model.dataId}</p>
          </div>
          <div className="self-start md:self-auto">
            <ButtonWithIcon
              onClick={() =>
                navigate(`${APPLICATION_ROUTES.START_MAPPING_BASE}${model.id}`)
              }
              prefixIcon={MapIcon}
              variant={ButtonVariant.PRIMARY}
              label="Start Mapping"
            />
          </div>
        </div>

        {/* Metadata + Map Extent — metadata on left, map on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-3">
            <MetadataItem label="Created by" value={model.createdBy} />
            <MetadataItem label="Generated on" value={model.generatedOn} />
            <MetadataItem label="Last Modified" value={model.lastModified} />
            <MetadataItem label="Version" value={model.version} />
            <MetadataItem
              label="Model Weights License"
              value={model.modelWeightsLicense}
            />
            <MetadataItem
              label="Dataset License"
              value={model.datasetLicense}
            />
            <div className="flex gap-4 items-center sm:col-span-2">
              <span className="text-grey text-body-3">Task:</span>
              <BaseModelKeywords keywords={model.keywords ?? []} visibleLimit={5} />
            </div>
            <MetadataItem
              label="Data ID"
              value={model.dataId}
              tooltip="Unique dataset identifier"
            />
          </div>

          {/* Right: map extent — justified to the end */}
          {model.bbox ? (
            <ModelExtentMap bbox={model.bbox} />
          ) : null}
        </div>

        {/* Download Metadata Link */}
        {model.readmeUrl && (
          <div>
            <Link
              href={model.readmeUrl}
              title="Download Metadata"
              blank
              download
              nativeAnchor
              disableLinkStyle
              className="inline-flex items-center text-primary! gap-x-1  text-body-3 hover:opacity-75 transition-opacity underline"
            >
              <span>Download Metadata</span>
              <DownloadIconNew className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Main Content: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] overflow-hidden gap-x-12 gap-y-10">
          {/* Left Column - Overview */}
          <MarkdownViewer content={model.markdownContent} />

          {/* Right Column - Architecture Info */}
          <div className="bg-frosted-blue border rounded-lg border-gray-border p-6 h-fit sticky top-8">
            <CollapsibleSection title="Architecture Info" defaultOpen={true}>
              <div className="flex flex-col">
                {architectureRows.map((row) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    tooltip={row.tooltip}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="General Information" defaultOpen={false}>
              <div className="flex flex-col">
                {generalInfoRows.map((row) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    tooltip={row.tooltip}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Model Information" defaultOpen={false}>
              <div className="flex flex-col">
                {mlmRows.map((row) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    tooltip={row.tooltip}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Data Info" defaultOpen={false}>
              <div className="flex flex-col">
                {dataInfoRows.map((row) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    tooltip={row.tooltip}
                  />
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </>
  );
};
