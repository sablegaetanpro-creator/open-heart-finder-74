import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InterestsSectionProps {
  interests?: string[];
}

const InterestsSection: React.FC<InterestsSectionProps> = ({ interests }) => {
  if (!interests || interests.length === 0) return null;

  return (
    <div className="w-full mb-4">
      <Card className="p-6 border-0 bg-gradient-to-br from-secondary/10 to-secondary/5">
        <h3 className="text-lg font-semibold mb-3 text-center">Centres d'intérêt</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {interests.slice(0, 12).map((interest, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {interest}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InterestsSection;