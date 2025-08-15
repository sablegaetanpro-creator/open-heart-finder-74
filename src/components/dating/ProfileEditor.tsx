import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ open, onOpenChange }) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    age: '',
    email: '',
    phone_number: '',
    bio: '',
    profession: '',
    education: '',
    height: '',
    weight: '',
    smoker: false,
    has_pets: false,
    pets_description: '',
    gender: '',
    looking_for: '',
    relationship_type: '',
    relationship_status: '',
    wants_kids: '',
    body_type: '',
    drinks: '',
    exercise_frequency: '',
    ethnicity: '',
    religion: '',
    politics: '',
    zodiac_sign: '',
    interests: [] as string[],
    languages: [] as string[],
    animals: '',
    children: '',
    instagram_handle: '',
    spotify_anthem: ''
  });

  useEffect(() => {
    if (profile && open) {
      // Combine profile photo and additional photos
      const allPhotos = [];
      if (profile.profile_photo_url) {
        allPhotos.push(profile.profile_photo_url);
      }
      if (profile.additional_photos) {
        allPhotos.push(...profile.additional_photos);
      }
      setPhotos(allPhotos);

      // Pre-fill form with existing data
      setFormData({
        first_name: profile.first_name || '',
        age: profile.age?.toString() || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
        bio: profile.bio || '',
        profession: profile.profession || '',
        education: profile.education || '',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        smoker: profile.smoker || false,
        has_pets: profile.has_pets || false,
        pets_description: profile.pets_description || '',
        gender: profile.gender || '',
        looking_for: profile.looking_for || '',
        relationship_type: profile.relationship_type || '',
        relationship_status: profile.relationship_status || '',
        wants_kids: profile.wants_kids || '',
        body_type: profile.body_type || '',
        drinks: profile.drinks || '',
        exercise_frequency: profile.exercise_frequency || '',
        ethnicity: profile.ethnicity || '',
        religion: profile.religion || '',
        politics: profile.politics || '',
        zodiac_sign: profile.zodiac_sign || '',
        interests: profile.interests || [],
        languages: profile.languages || [],
        animals: profile.animals || '',
        children: profile.children || '',
        instagram_handle: profile.instagram_handle || '',
        spotify_anthem: profile.spotify_anthem || ''
      });
    }
  }, [profile, open]);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Format non supporté",
          description: `Le fichier ${file.name} n'est pas supporté. Utilisez JPG, PNG ou WebP`,
          variant: "destructive"
        });
        return false;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: `Le fichier ${file.name} est trop grand (max 5MB)`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Check total photos limit (max 6)
    if (photos.length + validFiles.length > 6) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez avoir que 6 photos maximum",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${profile?.user_id}_${Date.now()}_${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Erreur d'upload: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      setPhotos(prev => [...prev, ...uploadedUrls]);
      
      toast({
        title: "Photos ajoutées !",
        description: `${uploadedUrls.length} photo(s) téléchargée(s) avec succès`
      });
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Erreur inconnue lors de l'upload",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const movePhotoUp = (index: number) => {
    if (index === 0) return;
    setPhotos(prev => {
      const newPhotos = [...prev];
      [newPhotos[index - 1], newPhotos[index]] = [newPhotos[index], newPhotos[index - 1]];
      return newPhotos;
    });
  };

  const movePhotoDown = (index: number) => {
    setPhotos(prev => {
      if (index === prev.length - 1) return prev;
      const newPhotos = [...prev];
      [newPhotos[index], newPhotos[index + 1]] = [newPhotos[index + 1], newPhotos[index]];
      return newPhotos;
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (photos.length === 0) {
      toast({
        title: "Aucune photo",
        description: "Vous devez avoir au moins une photo de profil",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // First photo is profile photo, rest are additional
      const [profilePhoto, ...additionalPhotos] = photos;

      // Prepare update data
      const updateData: any = {
        profile_photo_url: profilePhoto,
        additional_photos: additionalPhotos,
        first_name: formData.first_name,
        age: formData.age ? parseInt(formData.age) : null,
        email: formData.email,
        phone_number: formData.phone_number || null,
        bio: formData.bio || null,
        profession: formData.profession || null,
        education: formData.education || null,
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        smoker: formData.smoker,
        has_pets: formData.has_pets,
        pets_description: formData.pets_description || null,
        gender: formData.gender,
        looking_for: formData.looking_for,
        relationship_type: formData.relationship_type,
        relationship_status: formData.relationship_status || null,
        wants_kids: formData.wants_kids || null,
        body_type: formData.body_type || null,
        drinks: formData.drinks || null,
        exercise_frequency: formData.exercise_frequency || null,
        ethnicity: formData.ethnicity || null,
        religion: formData.religion || null,
        politics: formData.politics || null,
        zodiac_sign: formData.zodiac_sign || null,
        interests: formData.interests.length > 0 ? formData.interests : null,
        languages: formData.languages.length > 0 ? formData.languages : null,
        animals: formData.animals,
        children: formData.children,
        instagram_handle: formData.instagram_handle || null,
        spotify_anthem: formData.spotify_anthem || null
      };

      const { error } = await updateProfile(updateData);

      if (error) throw error;

      toast({
        title: "Profil mis à jour !",
        description: "Toutes vos informations ont été sauvegardées"
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Erreur inconnue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Modifier mon profil</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Âge *</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Téléphone</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
              />
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-2">
            <Label htmlFor="bio">À propos de moi</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Parlez-nous de vous..."
              rows={3}
            />
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Éducation</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
              />
            </div>
          </div>

          {/* Physical Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Taille (cm)</Label>
              <Input
                id="height"
                type="number"
                min="100"
                max="250"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="30"
                max="300"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
          </div>

          {/* Lifestyle Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smoker"
                checked={formData.smoker}
                onCheckedChange={(checked) => handleInputChange('smoker', checked)}
              />
              <Label htmlFor="smoker">Je fume</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_pets"
                checked={formData.has_pets}
                onCheckedChange={(checked) => handleInputChange('has_pets', checked)}
              />
              <Label htmlFor="has_pets">J'ai des animaux</Label>
            </div>
          </div>

          {/* Preferences Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genre *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homme">Homme</SelectItem>
                  <SelectItem value="femme">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recherche *</Label>
              <Select value={formData.looking_for} onValueChange={(value) => handleInputChange('looking_for', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homme">Homme</SelectItem>
                  <SelectItem value="femme">Femme</SelectItem>
                  <SelectItem value="les_deux">Les deux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Photos Grid */}
          <div>
            <Label className="text-base font-semibold">Mes photos ({photos.length}/6)</Label>
            <p className="text-sm text-muted-foreground mb-4">
              La première photo sera votre photo de profil principale. Utilisez les flèches pour réorganiser.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Photo controls */}
                  <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-6 h-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {index > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={() => movePhotoUp(index)}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                    )}
                    {index < photos.length - 1 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={() => movePhotoDown(index)}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2 text-xs">
                      Profil
                    </Badge>
                  )}
                </div>
              ))}
              
              {photos.length < 6 && (
                <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:border-muted-foreground/50 transition-colors">
                  <Label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center space-y-2 cursor-pointer"
                  >
                    <Plus className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ajouter</span>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Upload Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📝 Conseils</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Remplissez un maximum de champs pour un profil attractif</li>
              <li>• Ajoutez jusqu'à 6 photos maximum</li>
              <li>• La première photo sera votre photo de profil</li>
              <li>• Formats acceptés : JPG, PNG, WebP (max 5MB)</li>
              <li>• Votre email sera vérifié automatiquement si vous le modifiez</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading || photos.length === 0}
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditor;