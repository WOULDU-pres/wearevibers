/**
 * Hook for generating search result ranking score
 * SearchHighlight 컴포넌트에서 사용되는 검색 결과 순위 계산 로직
 */
export const useSearchRanking = () => {
  const calculateScore = (item: Record<string, unknown>, searchTerm: string, type: 'project' | 'tip' | 'user') => {
    if (!searchTerm.trim()) return 0;

    const term = searchTerm.toLowerCase();
    let score = 0;

    // Title/Name exact match bonus
    const title = (item.title || item.username || item.full_name || '').toString().toLowerCase();
    if (title === term) score += 100;
    else if (title.startsWith(term)) score += 50;
    else if (title.includes(term)) score += 25;

    // Content match
    const content = (item.description || item.content || item.bio || '').toString().toLowerCase();
    const matches = (content.match(new RegExp(term, 'g')) || []).length;
    score += matches * 10;

    // Popularity bonus
    if (type === 'project' || type === 'tip') {
      score += ((item.vibe_count as number) || 0) * 0.1;
      score += ((item.view_count as number) || 0) * 0.05;
    } else if (type === 'user') {
      score += ((item.follower_count as number) || 0) * 0.2;
      score += ((item.project_count as number) || 0) * 0.5;
    }

    // Recency bonus (newer content gets slight boost)
    const daysSinceCreated = (Date.now() - new Date(item.created_at as string).getTime()) / (1000 * 60 * 60 * 24);
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
      .sort((a, b) => (b._searchScore as number) - (a._searchScore as number))
      .map(({ _searchScore, ...item }) => item);
  };

  return { calculateScore, rankResults };
};