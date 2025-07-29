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
  const parts = text.split(regex);
  
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
      if (snippetStart > 0) snippetText = '...' + snippetText;
      if (snippetStart + maxLength < text.length) snippetText = snippetText + '...';
    } else {
      // No match found, just truncate from start
      snippetText = text.substring(0, maxLength) + '...';
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

// Hook for generating search result ranking score
export const useSearchRanking = () => {
  const calculateScore = (item: Record<string, unknown>, searchTerm: string, type: 'project' | 'tip' | 'user') => {
    if (!searchTerm.trim()) return 0;

    const term = searchTerm.toLowerCase();
    let score = 0;

    // Title/Name exact match bonus
    const title = (item.title || item.username || item.full_name || '').toLowerCase();
    if (title === term) score += 100;
    else if (title.startsWith(term)) score += 50;
    else if (title.includes(term)) score += 25;

    // Content match
    const content = (item.description || item.content || item.bio || '').toLowerCase();
    const matches = (content.match(new RegExp(term, 'g')) || []).length;
    score += matches * 10;

    // Popularity bonus
    if (type === 'project' || type === 'tip') {
      score += (item.vibe_count || 0) * 0.1;
      score += (item.view_count || 0) * 0.05;
    } else if (type === 'user') {
      score += (item.follower_count || 0) * 0.2;
      score += (item.project_count || 0) * 0.5;
    }

    // Recency bonus (newer content gets slight boost)
    const daysSinceCreated = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 30) score += 5;
    else if (daysSinceCreated < 90) score += 2;

    return score;
  };

  const rankResults = <T extends Record<string, unknown>>(results: T[], searchTerm: string, type: 'project' | 'tip' | 'user'): T[] => {
    return results
      .map(item => ({
        ...item,
        _searchScore: calculateScore(item, searchTerm, type)
      }))
      .sort((a, b) => b._searchScore - a._searchScore)
      .map(({ _searchScore, ...item }) => item);
  };

  return { calculateScore, rankResults };
};