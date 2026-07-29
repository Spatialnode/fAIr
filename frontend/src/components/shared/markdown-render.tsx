import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownViewerProps = {
  content?: string;
  className?: string;
};

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  className = "",
}) => {
  if (!content?.trim()) {
    return (
      <div className={`flex flex-col gap-y-2 py-6 ${className}`}>
        {/* <p className="text-grey text-body-2base font-medium">
          No documentation available for this model yet.
        </p>
        <p className="text-grey text-body-3">
          Documentation will appear here once a README is published for this
          model in the fAIr-models repository.
        </p> */}
      </div>
    );
  }

  return (
    <div className={`model-detail-prose max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
