import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
  maxLength?: number;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  searchTerm,
  className = '',
  highlightClassName = 'bg-yellow-200 text-yellow-900 px-1 rounded',
  maxLength,
}) => {
  if (!searchTerm.trim() || !text) {
    const displayText = maxLength && text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
    return <span className={className}>{displayText}</span>;
  }

  // Create regex for case-insensitive search
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  // Split text into parts and find matches
  const _parts = text.split(regex);
  
  // Generate snippet around the first match if maxLength is specified
  let snippetText = text;
  let snippetStart = 0;
  
  if (maxLength && text.length > maxLength) {
    const firstMatchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    
    if (firstMatchIndex !== -1) {
      // Center the snippet around the first match
      const contextLength = Math.floor((maxLength - searchTerm.length) / 2);
      snippetStart = Math.max(0, firstMatchIndex - contextLength);
      const snippetEnd = Math.min(text.length, snippetStart + maxLength);
      
      // Adjust start if we hit the end
      if (snippetEnd === text.length && snippetEnd - snippetStart < maxLength) {
        snippetStart = Math.max(0, snippetEnd - maxLength);
      }
      
      snippetText = text.substring(snippetStart, snippetEnd);
      
      // Add ellipsis
      if (snippetStart > 0) snippetText = `...${  snippetText}`;
      if (snippetStart + maxLength < text.length) snippetText = `${snippetText  }...`;
    } else {
      // No match found, just truncate from start
      snippetText = `${text.substring(0, maxLength)  }...`;
    }
  }

  // Re-split the snippet
  const snippetParts = snippetText.split(regex);

  return (
    <span className={className}>
      {snippetParts.map((part, index) => {
        const isHighlight = regex.test(part) && part.trim() !== '';
        return isHighlight ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

interface SearchSnippetProps {
  content: string;
  searchTerm: string;
  maxLength?: number;
  className?: string;
}

export const SearchSnippet: React.FC<SearchSnippetProps> = ({
  content,
  searchTerm,
  maxLength = 150,
  className = 'text-muted-foreground',
}) => {
  return (
    <SearchHighlight
      text={content}
      searchTerm={searchTerm}
      maxLength={maxLength}
      className={className}
      highlightClassName="bg-primary/20 text-primary px-1 rounded"
    />
  );
};

