import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  GraduationCap,
  Dumbbell,
  Baby,
  PawPrint,
  Cigarette,
  Wine
} from 'lucide-react';

interface DetailsSectionProps {
  profile: any;
}

const DetailsSection: React.FC<DetailsSectionProps> = ({ profile }) => {
  const hasDetails = profile.height || profile.education || profile.exercise_frequency || 
                    profile.children || profile.animals || profile.smoker || profile.drinks;

  if (!hasDetails) return null;

  const getChildrenIcon = (children: string) => {
    switch (children) {
      case 'veut_enfants':
      case 'a_enfants':
        return <Baby className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAnimalsIcon = (animals: string) => {
    switch (animals) {
      case 'aime_animaux':
      case 'a_animaux':
        return <PawPrint className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mb-4">
      <Card className="p-6 border-0 bg-gradient-to-br from-accent/10 to-accent/5">
        <h3 className="text-lg font-semibold mb-3 text-center">Détails</h3>
        <div className="grid grid-cols-1 gap-3 text-sm">
          {profile.height && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Taille</span>
              <span>{profile.height} cm</span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Éducation</span>
              <span className="text-right">{profile.education}</span>
            </div>
          )}
          {profile.exercise_frequency && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sport</span>
              <span className="text-right">{profile.exercise_frequency}</span>
            </div>
          )}
          {profile.children && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Enfants</span>
              <span className="text-right">{profile.children}</span>
            </div>
          )}
          {profile.animals && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Animaux</span>
              <span className="text-right">{profile.animals}</span>
            </div>
          )}
          {profile.smoker && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tabac</span>
              <span className="text-right">Fumeur</span>
            </div>
          )}
          {profile.drinks && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Alcool</span>
              <span className="text-right">{profile.drinks}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DetailsSection;