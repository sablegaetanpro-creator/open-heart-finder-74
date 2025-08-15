import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { FilterOptions } from '@/types/database';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFiltersApply: () => void;
}

const FilterDialog: React.FC<FilterDialogProps> = ({ open, onOpenChange, onFiltersApply }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    minAge: 18,
    maxAge: 50,
    maxDistance: 50
  });

  const handleApplyFilters = () => {
    // Store filters in localStorage or state management
    localStorage.setItem('datingFilters', JSON.stringify(filters));
    onFiltersApply();
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilters({
      minAge: 18,
      maxAge: 50,
      maxDistance: 50
    });
    localStorage.removeItem('datingFilters');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filtres de recherche</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Age Range */}
          <div className="space-y-3">
            <Label>Tranche d'âge</Label>
            <div className="px-3">
              <Slider
                value={[filters.minAge || 18, filters.maxAge || 50]}
                onValueChange={([min, max]) => 
                  setFilters(prev => ({ ...prev, minAge: min, maxAge: max }))
                }
                min={18}
                max={80}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{filters.minAge} ans</span>
                <span>{filters.maxAge} ans</span>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <Label>Distance maximale</Label>
            <div className="px-3">
              <Slider
                value={[filters.maxDistance || 50]}
                onValueChange={([distance]) => 
                  setFilters(prev => ({ ...prev, maxDistance: distance }))
                }
                min={1}
                max={200}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground mt-1">
                {filters.maxDistance} km
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Genre recherché</Label>
            <Select 
              value={filters.gender || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="homme">Homme</SelectItem>
                <SelectItem value="femme">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Type */}
          <div className="space-y-2">
            <Label>Type de relation</Label>
            <Select 
              value={filters.relationshipType || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, relationshipType: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="amitie">Amitié</SelectItem>
                <SelectItem value="plan_un_soir">Plan d'un soir</SelectItem>
                <SelectItem value="couple_court_terme">Couple court terme</SelectItem>
                <SelectItem value="couple_long_terme">Couple long terme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Smoking */}
          <div className="flex items-center justify-between">
            <Label>Fumeurs seulement</Label>
            <Switch
              checked={filters.smoker || false}
              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, smoker: checked }))}
            />
          </div>

          {/* Animals */}
          <div className="space-y-2">
            <Label>Animaux</Label>
            <Select 
              value={filters.animals || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, animals: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="aime_animaux">Aime les animaux</SelectItem>
                <SelectItem value="veut_animaux">Veut des animaux</SelectItem>
                <SelectItem value="ne_veut_pas_animaux">Pas d'animaux</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Children */}
          <div className="space-y-2">
            <Label>Enfants</Label>
            <Select 
              value={filters.children || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, children: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="a_enfants">A des enfants</SelectItem>
                <SelectItem value="veut_enfants">Veut des enfants</SelectItem>
                <SelectItem value="ne_veut_pas_enfants">Pas d'enfants</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Religion & Politics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Religion</Label>
              <Input
                value={filters.religion || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, religion: e.target.value }))}
                placeholder="Optionnel"
              />
            </div>
            <div className="space-y-2">
              <Label>Politique</Label>
              <Input
                value={filters.politics || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, politics: e.target.value }))}
                placeholder="Optionnel"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button onClick={handleApplyFilters}>
            Appliquer les filtres
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;