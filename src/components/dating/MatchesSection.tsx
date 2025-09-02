import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MatchesSectionProps {
  matches: any[];
  onMatchClick: (match: any) => void;
}

const MatchesSection: React.FC<MatchesSectionProps> = ({ matches, onMatchClick }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Vos matches</h2>
      {matches.map((match) => (
        <MatchCard 
          key={match.id} 
          match={match} 
          onMatchClick={() => onMatchClick(match)} 
        />
      ))}
    </div>
  );
};

export default MatchesSection;