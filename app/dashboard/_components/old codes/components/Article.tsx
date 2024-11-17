import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ArticleProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  authorAvatar: string;
  authorName: string;
  date: string;
  category: string;
  description: string;
  readMoreLink: string;
}

const Article: React.FC<ArticleProps> = ({
  imageSrc,
  imageAlt,
  title,
  authorAvatar,
  authorName,
  date,
  category,
  description,
  readMoreLink,
}) => {
  return (
    <div className="bg-white rounded border overflow-hidden mb-6 w-full">
      <img className="w-full h-72 object-cover" src={imageSrc} alt={imageAlt} />
      <div className="p-6">
        <div className="flex items-center mb-4 space-x-4">
          <Avatar className="w-10 h-10 rounded-full">
            <AvatarImage src={authorAvatar} alt="Author Avatar" />
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-gray-700">
            By {authorName}, {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-500 block whitespace-normal break-words">{category}</p>
        </div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
        <a href={readMoreLink} className="text-gray-900 hover:underline mt-4 block">
          Read More...
        </a>
      </div>
    </div>
  );
};

export default Article;