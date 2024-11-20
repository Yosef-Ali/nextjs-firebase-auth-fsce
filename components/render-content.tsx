import React from 'react';
import ReactMarkdown from 'react-markdown';

interface RenderedContentProps {
  content: string;
}

const RenderedContent: React.FC<RenderedContentProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default RenderedContent;
