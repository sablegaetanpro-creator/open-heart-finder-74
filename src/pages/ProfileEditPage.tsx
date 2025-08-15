import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Camera, Phone, Wine, PawPrint, GraduationCap, Briefcase, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PASSIONS } from '@/data/passions';

const ProfileEditPage = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Données de profil - Step 1 (Required)
  const [requiredData, setRequiredData] = useState({
    email: '',
    phone_number: '',
    first_name: '',
    age: '',
    gender: '',
    looking_for: '',
    relationship_type: '',
    height: '',
    profile_photo_url: ''
  });

  // Données de profil - Step 2 (Optional)
  const [optionalData, setOptionalData] = useState({
    weight: '',
    smoker: false,
    drinks: '',
    animals: '',
    has_pets: false,
    pets_description: '',
    children: '',
    wants_kids: '',
    body_type: '',
    exercise_frequency: '',
    education: '',
    profession: '',
    religion: '',
    politics: '',
    ethnicity: '',
    relationship_status: '',
    zodiac_sign: '',
    languages: [] as string[],
    interests: [] as string[],
    bio: '',
    instagram_handle: '',
    spotify_anthem: ''
  });

  // Charger les données du profil existant
  useEffect(() => {
    if (profile) {
      setRequiredData({
        email: profile.email || '',
        phone_number: profile.phone_number || '',
        first_name: profile.first_name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        looking_for: profile.looking_for || '',
        relationship_type: profile.relationship_type || '',
        height: profile.height?.toString() || '',
        profile_photo_url: profile.profile_photo_url || ''
      });

      setOptionalData({
        weight: profile.weight?.toString() || '',
        smoker: profile.smoker || false,
        drinks: profile.drinks || '',
        animals: profile.animals || '',
        has_pets: profile.has_pets || false,
        pets_description: profile.pets_description || '',
        children: profile.children || '',
        wants_kids: profile.wants_kids || '',
        body_type: profile.body_type || '',
        exercise_frequency: profile.exercise_frequency || '',
        education: profile.education || '',
        profession: profile.profession || '',
        religion: profile.religion || '',
        politics: profile.politics || '',
        ethnicity: profile.ethnicity || '',
        relationship_status: profile.relationship_status || '',
        zodiac_sign: profile.zodiac_sign || '',
        languages: profile.languages || [],
        interests: profile.interests || [],
        bio: profile.bio || '',
        instagram_handle: profile.instagram_handle || '',
        spotify_anthem: profile.spotify_anthem || ''
      });
    }
  }, [profile]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez utiliser un fichier JPG, PNG ou WebP",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximum est de 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}_${Date.now()}_${fileName}`;

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

      setRequiredData(prev => ({ ...prev, profile_photo_url: data.publicUrl }));
      
      toast({
        title: "Photo mise à jour !",
        description: "Votre photo de profil a été téléchargée"
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

  const validateStep1 = () => {
    const required = ['email', 'phone_number', 'first_name', 'age', 'gender', 'looking_for', 'relationship_type', 'height'];
    
    for (const field of required) {
      if (!requiredData[field as keyof typeof requiredData]) {
        toast({
          title: "Champs requis manquants",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return false;
      }
    }

    if (!requiredData.profile_photo_url) {
      toast({
        title: "Photo requise",
        description: "Vous devez ajouter une photo de profil visible",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleStepNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const profileData = {
      // Required fields
      first_name: requiredData.first_name,
      age: parseInt(requiredData.age),
      gender: requiredData.gender as 'homme' | 'femme',
      looking_for: requiredData.looking_for as 'homme' | 'femme' | 'les_deux',
      relationship_type: requiredData.relationship_type,
      height: parseInt(requiredData.height),
      profile_photo_url: requiredData.profile_photo_url,
      phone_number: requiredData.phone_number,
      
      // Optional fields
      weight: optionalData.weight ? parseInt(optionalData.weight) : undefined,
      smoker: optionalData.smoker,
      drinks: optionalData.drinks as any || undefined,
      animals: optionalData.animals || 'aime_animaux',
      has_pets: optionalData.has_pets,
      pets_description: optionalData.pets_description || undefined,
      children: optionalData.children || 'ne_veut_pas_enfants',
      wants_kids: optionalData.wants_kids as any || undefined,
      body_type: optionalData.body_type as any || undefined,
      exercise_frequency: optionalData.exercise_frequency as any || undefined,
      education: optionalData.education || undefined,
      profession: optionalData.profession || undefined,
      religion: optionalData.religion || undefined,
      politics: optionalData.politics || undefined,
      ethnicity: optionalData.ethnicity || undefined,
      relationship_status: optionalData.relationship_status as any || 'celibataire',
      zodiac_sign: optionalData.zodiac_sign || undefined,
      languages: optionalData.languages.length > 0 ? optionalData.languages : undefined,
      interests: optionalData.interests.length > 0 ? optionalData.interests : undefined,
      bio: optionalData.bio || undefined,
      instagram_handle: optionalData.instagram_handle || undefined,
      spotify_anthem: optionalData.spotify_anthem || undefined,
      
      is_profile_complete: true
    };

    const { error } = await updateProfile(profileData);
    
    if (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Profil sauvegardé !",
        description: "Votre profil a été mis à jour avec succès"
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-love">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="mx-auto w-16 h-16 bg-gradient-love rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="w-8"></div>
          </div>
          <CardTitle className="text-2xl font-bold">Modifier mon profil</CardTitle>
          <CardDescription>Mettez à jour vos informations</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className="flex-1 h-1 bg-muted">
                <div className={`h-full bg-primary transition-all ${currentStep >= 2 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold">
                {currentStep === 1 ? 'Informations essentielles' : 'Complétez votre profil'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 ? 'Étape 1/2 - Champs obligatoires' : 'Étape 2/2 - Optionnel mais recommandé'}
              </p>
            </div>

            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Photo de profil *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {requiredData.profile_photo_url ? (
                      <img 
                        src={requiredData.profile_photo_url} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full mx-auto object-cover mb-2"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center mb-2">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Visage entièrement visible requis (JPG, PNG, WebP - Max 5MB)
                    </p>
                  </div>
                </div>

                {/* Basic Contact Info */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-1">
                      <span>Email *</span>
                    </Label>
                    <Input
                      type="email"
                      value={requiredData.email}
                      onChange={(e) => setRequiredData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>Numéro de téléphone *</span>
                    </Label>
                    <Input
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={requiredData.phone_number}
                      onChange={(e) => setRequiredData(prev => ({ ...prev, phone_number: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom *</Label>
                    <Input
                      value={requiredData.first_name}
                      onChange={(e) => setRequiredData(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Âge *</Label>
                    <Input
                      type="number"
                      min="18"
                      max="100"
                      value={requiredData.age}
                      onChange={(e) => setRequiredData(prev => ({ ...prev, age: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Genre *</Label>
                    <Select value={requiredData.gender} onValueChange={(value) => setRequiredData(prev => ({ ...prev, gender: value }))}>
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
                    <Select value={requiredData.looking_for} onValueChange={(value) => setRequiredData(prev => ({ ...prev, looking_for: value }))}>
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

                <div className="space-y-2">
                  <Label>Type de relation *</Label>
                  <Select value={requiredData.relationship_type} onValueChange={(value) => setRequiredData(prev => ({ ...prev, relationship_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amitie">Amitié</SelectItem>
                      <SelectItem value="plan_un_soir">Plan d'un soir</SelectItem>
                      <SelectItem value="couple_court_terme">Couple court terme</SelectItem>
                      <SelectItem value="couple_long_terme">Couple long terme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Taille (cm) *</Label>
                  <Input
                    type="number"
                    min="100"
                    max="250"
                    value={requiredData.height}
                    onChange={(e) => setRequiredData(prev => ({ ...prev, height: e.target.value }))}
                    required
                  />
                </div>

                <Button onClick={handleStepNext} className="w-full" disabled={isLoading}>
                  Suivant
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleSave} className="space-y-4">
                {/* Physical attributes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Poids (kg)</Label>
                    <Input
                      type="number"
                      min="30"
                      max="300"
                      value={optionalData.weight}
                      onChange={(e) => setOptionalData(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Corpulence</Label>
                    <Select value={optionalData.body_type} onValueChange={(value) => setOptionalData(prev => ({ ...prev, body_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mince">Mince</SelectItem>
                        <SelectItem value="athletique">Athlétique</SelectItem>
                        <SelectItem value="moyenne">Moyenne</SelectItem>
                        <SelectItem value="quelques_kilos_en_plus">Quelques kilos en plus</SelectItem>
                        <SelectItem value="grande_et_belle">Grande et belle</SelectItem>
                        <SelectItem value="costaud">Costaud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lifestyle */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smoker"
                      checked={optionalData.smoker}
                      onCheckedChange={(checked) => setOptionalData(prev => ({ ...prev, smoker: checked as boolean }))}
                    />
                    <Label htmlFor="smoker">Je fume</Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-1">
                      <Wine className="w-4 h-4" />
                      <span>Consommation d'alcool</span>
                    </Label>
                    <Select value={optionalData.drinks} onValueChange={(value) => setOptionalData(prev => ({ ...prev, drinks: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jamais">Jamais</SelectItem>
                        <SelectItem value="rarement">Rarement</SelectItem>
                        <SelectItem value="socialement">Socialement</SelectItem>
                        <SelectItem value="regulierement">Régulièrement</SelectItem>
                        <SelectItem value="souvent">Souvent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Exercice physique</Label>
                    <Select value={optionalData.exercise_frequency} onValueChange={(value) => setOptionalData(prev => ({ ...prev, exercise_frequency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jamais">Jamais</SelectItem>
                        <SelectItem value="rarement">Rarement</SelectItem>
                        <SelectItem value="parfois">Parfois</SelectItem>
                        <SelectItem value="souvent">Souvent</SelectItem>
                        <SelectItem value="tous_les_jours">Tous les jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pets */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_pets"
                      checked={optionalData.has_pets}
                      onCheckedChange={(checked) => setOptionalData(prev => ({ ...prev, has_pets: checked as boolean }))}
                    />
                    <Label htmlFor="has_pets" className="flex items-center space-x-1">
                      <PawPrint className="w-4 h-4" />
                      <span>J'ai des animaux</span>
                    </Label>
                  </div>

                  {optionalData.has_pets && (
                    <div className="space-y-2">
                      <Label>Mes animaux</Label>
                      <Input
                        placeholder="Ex: Chien golden retriever, Chat persan..."
                        value={optionalData.pets_description}
                        onChange={(e) => setOptionalData(prev => ({ ...prev, pets_description: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Rapport aux animaux</Label>
                    <Select value={optionalData.animals} onValueChange={(value) => setOptionalData(prev => ({ ...prev, animals: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aime_animaux">J'aime les animaux</SelectItem>
                        <SelectItem value="veut_animaux">Je veux des animaux</SelectItem>
                        <SelectItem value="ne_veut_pas_animaux">Je ne veux pas d'animaux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Family */}
                 <div className="space-y-2">
                   <Label>Enfants</Label>
                   <Select value={optionalData.children} onValueChange={(value) => setOptionalData(prev => ({ ...prev, children: value }))}>
                     <SelectTrigger>
                       <SelectValue placeholder="Choisir" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="a_enfants">J'ai des enfants</SelectItem>
                       <SelectItem value="veut_enfants">Je veux des enfants</SelectItem>
                       <SelectItem value="ne_veut_pas_enfants">Je ne veux pas d'enfants</SelectItem>
                       <SelectItem value="ouvert_aux_enfants">Ouvert(e) à l'idée</SelectItem>
                       <SelectItem value="indecis">Indécis(e)</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                {/* Education & Work */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>Éducation</span>
                    </Label>
                    <Input
                      placeholder="Ex: Master en Marketing"
                      value={optionalData.education}
                      onChange={(e) => setOptionalData(prev => ({ ...prev, education: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>Profession</span>
                    </Label>
                    <Input
                      placeholder="Ex: Développeur web"
                      value={optionalData.profession}
                      onChange={(e) => setOptionalData(prev => ({ ...prev, profession: e.target.value }))}
                    />
                  </div>
                </div>

                 {/* Passions */}
                <div className="space-y-2">
                  <Label>Mes passions</Label>
                  <div className="flex flex-wrap gap-2">
                    {PASSIONS.slice(0, 20).map((passion) => (
                      <Button
                        key={passion}
                        type="button"
                        variant={optionalData.interests.includes(passion) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newInterests = optionalData.interests.includes(passion)
                            ? optionalData.interests.filter(i => i !== passion)
                            : [...optionalData.interests, passion];
                          setOptionalData(prev => ({ ...prev, interests: newInterests }));
                        }}
                      >
                        {passion}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Langues */}
                <div className="space-y-2">
                  <Label>Langues parlées</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Français', 'Anglais', 'Espagnol', 'Italien', 'Allemand', 'Portugais', 'Arabe', 'Chinois'].map((language) => (
                      <Button
                        key={language}
                        type="button"
                        variant={optionalData.languages.includes(language) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newLanguages = optionalData.languages.includes(language)
                            ? optionalData.languages.filter(l => l !== language)
                            : [...optionalData.languages, language];
                          setOptionalData(prev => ({ ...prev, languages: newLanguages }));
                        }}
                      >
                        {language}
                      </Button>
                    ))}
                  </div>
                </div>

                 {/* Bio */}
                <div className="space-y-2">
                  <Label>À propos de moi</Label>
                  <Textarea
                    placeholder="Parlez-nous de vous, vos passions, ce qui vous rend unique..."
                    value={optionalData.bio}
                    onChange={(e) => setOptionalData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditPage;