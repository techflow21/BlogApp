export const readingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateMockPageViews = (days = 7) => {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 500) + 100,
    });
  }
  return result;
};

export const statusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return 'Draft';
    case 1:
      return 'Published';
    case 2:
      return 'Archived';
    default:
      return 'Unknown';
  }
};

export const statusColor = (status: number): string => {
  switch (status) {
    case 0:
      return 'bg-yellow-100 text-yellow-800';
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
