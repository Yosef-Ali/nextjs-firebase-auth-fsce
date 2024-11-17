import { renderContent } from '@/util/renderContent';
import React from 'react';

interface RenderedContentProps {
  content: string;
}

const RenderedContent: React.FC<RenderedContentProps> = ({ content }) => {
  const renderedContent = renderContent(content);

  return <div className="prose" dangerouslySetInnerHTML={{ __html: renderedContent }} />;
};

export default RenderedContent;