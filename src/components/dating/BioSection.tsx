import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BioSectionProps {
  bio?: string;
}

const BioSection: React.FC<BioSectionProps> = ({ bio }) => {
  if (!bio) return null;

  return (
    <div className="w-full mb-4">
      <Card className="p-6 border-0 bg-gradient-to-br from-primary/10 to-primary/5">
        <h3 className="text-lg font-semibold mb-3 text-center">À propos</h3>
        <p className="text-sm text-foreground/80 leading-relaxed text-center">
          {bio}
        </p>
      </Card>
    </div>
  );
};

export default BioSection;