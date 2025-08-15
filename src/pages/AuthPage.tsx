import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Upload, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AuthPage = () => {
  const { user, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    first_name: '',
    age: '',
    gender: '',
    looking_for: '',
    relationship_type: '',
    height: '',
    weight: '',
    smoker: false,
    animals: '',
    children: '',
    religion: '',
    politics: '',
    bio: '',
    profile_photo_url: '',
    // New fields
    phone_number: '',
    drinks: '',
    has_pets: false,
    pets_description: '',
    education: '',
    profession: '',
    interests: [] as string[],
    languages: [] as string[],
    zodiac_sign: '',
    body_type: '',
    ethnicity: '',
    relationship_status: '',
    wants_kids: '',
    exercise_frequency: '',
    instagram_handle: '',
    spotify_anthem: ''
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!signupData.profile_photo_url) {
      toast({
        title: "Photo requise",
        description: "Vous devez ajouter une photo de profil visible",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const profileData = {
      first_name: signupData.first_name,
      age: parseInt(signupData.age),
      gender: signupData.gender as 'homme' | 'femme',
      looking_for: signupData.looking_for as 'homme' | 'femme' | 'les_deux',
      relationship_type: signupData.relationship_type as any,
      height: signupData.height ? parseInt(signupData.height) : undefined,
      weight: signupData.weight ? parseInt(signupData.weight) : undefined,
      smoker: signupData.smoker,
      animals: signupData.animals as any,
      children: signupData.children as any,
      religion: signupData.religion || undefined,
      politics: signupData.politics || undefined,
      bio: signupData.bio || undefined,
      profile_photo_url: signupData.profile_photo_url,
      max_distance: 50,
      is_profile_complete: true
    };

    const { error } = await signUp(signupData.email, signupData.password, profileData);
    
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Inscription réussie !",
        description: "Vérifiez votre email pour confirmer votre compte"
      });
    }
    
    setIsLoading(false);
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${Date.now()}_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      setSignupData(prev => ({ ...prev, profile_photo_url: data.publicUrl }));
      
      toast({
        title: "Photo ajoutée !",
        description: "Votre photo de profil a été téléchargée"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la photo",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-love">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-love rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">HeartSync</CardTitle>
          <CardDescription>Trouvez votre âme sœur</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    toast({
                      title: "Mot de passe oublié",
                      description: "Un email de réinitialisation vous sera envoyé si votre adresse est valide"
                    });
                  }}
                >
                  Mot de passe oublié ?
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Photo de profil *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {signupData.profile_photo_url ? (
                      <img 
                        src={signupData.profile_photo_url} 
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
                      Visage entièrement visible requis
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe *</Label>
                    <Input
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom *</Label>
                    <Input
                      value={signupData.first_name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Âge *</Label>
                    <Input
                      type="number"
                      min="18"
                      max="100"
                      value={signupData.age}
                      onChange={(e) => setSignupData(prev => ({ ...prev, age: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Genre *</Label>
                    <Select value={signupData.gender} onValueChange={(value) => setSignupData(prev => ({ ...prev, gender: value }))}>
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
                    <Select value={signupData.looking_for} onValueChange={(value) => setSignupData(prev => ({ ...prev, looking_for: value }))}>
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
                  <Select value={signupData.relationship_type} onValueChange={(value) => setSignupData(prev => ({ ...prev, relationship_type: value }))}>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Taille (cm)</Label>
                    <Input
                      type="number"
                      min="100"
                      max="250"
                      value={signupData.height}
                      onChange={(e) => setSignupData(prev => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Poids (kg)</Label>
                    <Input
                      type="number"
                      min="30"
                      max="300"
                      value={signupData.weight}
                      onChange={(e) => setSignupData(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smoker"
                      checked={signupData.smoker}
                      onCheckedChange={(checked) => setSignupData(prev => ({ ...prev, smoker: checked as boolean }))}
                    />
                    <Label htmlFor="smoker">Je fume</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Animaux *</Label>
                    <Select value={signupData.animals} onValueChange={(value) => setSignupData(prev => ({ ...prev, animals: value }))}>
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

                  <div className="space-y-2">
                    <Label>Enfants *</Label>
                    <Select value={signupData.children} onValueChange={(value) => setSignupData(prev => ({ ...prev, children: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a_enfants">J'ai des enfants</SelectItem>
                        <SelectItem value="veut_enfants">Je veux des enfants</SelectItem>
                        <SelectItem value="ne_veut_pas_enfants">Je ne veux pas d'enfants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Inscription...' : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;