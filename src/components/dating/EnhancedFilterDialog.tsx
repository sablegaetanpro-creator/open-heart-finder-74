import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { PASSIONS } from '@/data/passions';

interface EnhancedFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFiltersApply: () => void;
}

interface FilterState {
  ageRange: [number, number];
  maxDistance: number;
  gender: string;
  relationshipType: string;
  height: [number, number];
  bodyType: string[];
  smoker: string;
  drinks: string;
  animals: string;
  children: string;
  religion: string[];
  politics: string[];
  education: string[];
  profession: string[];
  interests: string[];
  exerciseFrequency: string;
}

const EnhancedFilterDialog: React.FC<EnhancedFilterDialogProps> = ({
  open,
  onOpenChange,
  onFiltersApply
}) => {
  const { profile } = useAuth();
  
  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 65],
    maxDistance: 50,
    gender: 'tous',
    relationshipType: 'tous',
    height: [150, 200],
    bodyType: [],
    smoker: 'tous',
    drinks: 'tous',
    animals: 'tous',
    children: 'tous',
    religion: [],
    politics: [],
    education: [],
    profession: [],
    interests: [],
    exerciseFrequency: 'tous'
  });

  // Load saved filters
  useEffect(() => {
    const savedFilters = localStorage.getItem('dating_filters');
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  const handleApplyFilters = () => {
    localStorage.setItem('dating_filters', JSON.stringify(filters));
    onFiltersApply();
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      ageRange: [18, 65],
      maxDistance: 50,
      gender: 'tous',
      relationshipType: 'tous',
      height: [150, 200],
      bodyType: [],
      smoker: 'tous',
      drinks: 'tous',
      animals: 'tous',
      children: 'tous',
      religion: [],
      politics: [],
      education: [],
      profession: [],
      interests: [],
      exerciseFrequency: 'tous'
    };
    setFilters(defaultFilters);
    localStorage.removeItem('dating_filters');
  };

  // Check if a filter should be disabled based on profile completeness
  const isFilterDisabled = (filterField: string) => {
    if (!profile) return true;
    
    const fieldMap: Record<string, keyof typeof profile> = {
      height: 'height',
      bodyType: 'body_type',
      smoker: 'smoker',
      drinks: 'drinks',
      animals: 'animals',
      children: 'children',
      religion: 'religion',
      politics: 'politics',
      education: 'education',
      profession: 'profession',
      interests: 'interests',
      exerciseFrequency: 'exercise_frequency'
    };

    const profileField = fieldMap[filterField];
    return !profile[profileField];
  };

  const renderMultiSelect = (
    label: string,
    value: string[],
    options: string[],
    onChange: (value: string[]) => void,
    disabled = false
  ) => (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
        {options.map((option) => (
          <Badge
            key={option}
            variant={value.includes(option) ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${disabled ? 'cursor-not-allowed' : ''}`}
            onClick={() => {
              if (disabled) return;
              if (value.includes(option)) {
                onChange(value.filter(v => v !== option));
              } else {
                onChange([...value, option]);
              }
            }}
          >
            {option}
          </Badge>
        ))}
      </div>
      {disabled && (
        <p className="text-xs text-muted-foreground">
          Complétez votre profil pour utiliser ce filtre
        </p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtres de recherche</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Critères de base */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Critères de base</h3>
            
            <div className="space-y-2">
              <Label>Âge: {filters.ageRange[0]} - {filters.ageRange[1]} ans</Label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
                min={18}
                max={80}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Distance maximale: {filters.maxDistance} km</Label>
              <Slider
                value={[filters.maxDistance]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, maxDistance: value[0] }))}
                min={1}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Genre recherché</Label>
              <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="homme">Homme</SelectItem>
                  <SelectItem value="femme">Femme</SelectItem>
                  <SelectItem value="non_binaire">Non-binaire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type de relation</Label>
              <Select value={filters.relationshipType} onValueChange={(value) => setFilters(prev => ({ ...prev, relationshipType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="amitie">Amitié</SelectItem>
                  <SelectItem value="relation_casuelle">Relation casuelle</SelectItem>
                  <SelectItem value="relation_serieuse">Relation sérieuse</SelectItem>
                  <SelectItem value="mariage">Mariage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Apparence physique */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Apparence physique</h3>
            
            <div className={`space-y-2 ${isFilterDisabled('height') ? 'opacity-50' : ''}`}>
              <Label>Taille: {filters.height[0]} - {filters.height[1]} cm</Label>
              <Slider
                value={filters.height}
                onValueChange={(value) => setFilters(prev => ({ ...prev, height: value as [number, number] }))}
                min={140}
                max={220}
                step={1}
                className="w-full"
                disabled={isFilterDisabled('height')}
              />
              {isFilterDisabled('height') && (
                <p className="text-xs text-muted-foreground">
                  Complétez votre profil pour utiliser ce filtre
                </p>
              )}
            </div>

            {renderMultiSelect(
              "Type de corps",
              filters.bodyType,
              ["Mince", "Athlétique", "Moyen", "Quelques kilos en plus", "Corpulent"],
              (value) => setFilters(prev => ({ ...prev, bodyType: value })),
              isFilterDisabled('bodyType')
            )}
          </div>

          <Separator />

          {/* Style de vie */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Style de vie</h3>
            
            <div className={`space-y-2 ${isFilterDisabled('smoker') ? 'opacity-50' : ''}`}>
              <Label>Tabac</Label>
              <Select 
                value={filters.smoker} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, smoker: value }))}
                disabled={isFilterDisabled('smoker')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="true">Fumeur</SelectItem>
                  <SelectItem value="false">Non fumeur</SelectItem>
                </SelectContent>
              </Select>
              {isFilterDisabled('smoker') && (
                <p className="text-xs text-muted-foreground">
                  Complétez votre profil pour utiliser ce filtre
                </p>
              )}
            </div>

            <div className={`space-y-2 ${isFilterDisabled('drinks') ? 'opacity-50' : ''}`}>
              <Label>Alcool</Label>
              <Select 
                value={filters.drinks} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, drinks: value }))}
                disabled={isFilterDisabled('drinks')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="jamais">Jamais</SelectItem>
                  <SelectItem value="rarement">Rarement</SelectItem>
                  <SelectItem value="socialement">Socialement</SelectItem>
                  <SelectItem value="regulierement">Régulièrement</SelectItem>
                </SelectContent>
              </Select>
              {isFilterDisabled('drinks') && (
                <p className="text-xs text-muted-foreground">
                  Complétez votre profil pour utiliser ce filtre
                </p>
              )}
            </div>

            <div className={`space-y-2 ${isFilterDisabled('exerciseFrequency') ? 'opacity-50' : ''}`}>
              <Label>Fréquence d'exercice</Label>
              <Select 
                value={filters.exerciseFrequency} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, exerciseFrequency: value }))}
                disabled={isFilterDisabled('exerciseFrequency')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="jamais">Jamais</SelectItem>
                  <SelectItem value="rarement">Rarement</SelectItem>
                  <SelectItem value="parfois">Parfois</SelectItem>
                  <SelectItem value="souvent">Souvent</SelectItem>
                  <SelectItem value="quotidien">Quotidien</SelectItem>
                </SelectContent>
              </Select>
              {isFilterDisabled('exerciseFrequency') && (
                <p className="text-xs text-muted-foreground">
                  Complétez votre profil pour utiliser ce filtre
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Famille et animaux */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Famille et animaux</h3>
            
            <div className={`space-y-2 ${isFilterDisabled('animals') ? 'opacity-50' : ''}`}>
              <Label>Animaux</Label>
              <Select 
                value={filters.animals} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, animals: value }))}
                disabled={isFilterDisabled('animals')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="aime_animaux">Aime les animaux</SelectItem>
                  <SelectItem value="a_animaux">A des animaux</SelectItem>
                  <SelectItem value="allergique">Allergique</SelectItem>
                  <SelectItem value="pas_animaux">N'aime pas les animaux</SelectItem>
                </SelectContent>
              </Select>
              {isFilterDisabled('animals') && (
                <p className="text-xs text-muted-foreground">
                  Complétez votre profil pour utiliser ce filtre
                </p>
              )}
            </div>

            <div className={`space-y-2 ${isFilterDisabled('children') ? 'opacity-50' : ''}`}>
              <Label>Enfants</Label>
              <Select 
                value={filters.children} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, children: value }))}
                disabled={isFilterDisabled('children')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="veut_enfants">Veut des enfants</SelectItem>
                  <SelectItem value="a_enfants">A des enfants</SelectItem>
                  <SelectItem value="ne_veut_pas_enfants">Ne veut pas d'enfants</SelectItem>
                  <SelectItem value="indecis">Indécis</SelectItem>
                </SelectContent>
              </Select>
              {isFilterDisabled('children') && (
                <p className="text-xs text-muted-foreground">
                  Complétez votre profil pour utiliser ce filtre
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Valeurs et croyances */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Valeurs et croyances</h3>
            
            {renderMultiSelect(
              "Religion",
              filters.religion,
              ["Christianisme", "Islam", "Judaïsme", "Bouddhisme", "Hindouisme", "Athée", "Agnostique", "Spirituel", "Autre"],
              (value) => setFilters(prev => ({ ...prev, religion: value })),
              isFilterDisabled('religion')
            )}

            {renderMultiSelect(
              "Politique",
              filters.politics,
              ["Conservateur", "Modéré", "Libéral", "Progressiste", "Apolitique", "Autre"],
              (value) => setFilters(prev => ({ ...prev, politics: value })),
              isFilterDisabled('politics')
            )}
          </div>

          <Separator />

          {/* Éducation et carrière */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Éducation et carrière</h3>
            
            {renderMultiSelect(
              "Niveau d'éducation",
              filters.education,
              ["Lycée", "Université", "Master", "Doctorat", "École de commerce", "Formation professionnelle", "Autodidacte"],
              (value) => setFilters(prev => ({ ...prev, education: value })),
              isFilterDisabled('education')
            )}

            {renderMultiSelect(
              "Secteur professionnel",
              filters.profession,
              ["Technologie", "Santé", "Éducation", "Finance", "Art & Créatif", "Sport", "Restauration", "Commerce", "Entrepreneur", "Étudiant", "Autre"],
              (value) => setFilters(prev => ({ ...prev, profession: value })),
              isFilterDisabled('profession')
            )}
          </div>

          <Separator />

          {/* Centres d'intérêt */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Centres d'intérêt</h3>
            
            {renderMultiSelect(
              "Passions",
              filters.interests,
              PASSIONS.slice(0, 30),
              (value) => setFilters(prev => ({ ...prev, interests: value })),
              isFilterDisabled('interests')
            )}
          </div>

          <Separator />


          <div className="flex space-x-4 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Réinitialiser
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Appliquer les filtres
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedFilterDialog;