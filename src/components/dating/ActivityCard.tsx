import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, MessageCircle } from 'lucide-react';

interface ActivityCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  children?: React.ReactNode;
  loading?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  count,
  icon,
  color,
  children,
  loading = false
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={color}>{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Badge variant="secondary">
          {loading ? '...' : count}
        </Badge>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        children || (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune activité pour le moment
          </p>
        )
      )}
    </Card>
  );
};

export default ActivityCard;