import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Bell, 
  Shield, 
  Heart, 
  LogOut, 
  Pause, 
  Trash2,
  Filter,
  Eye,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme/ThemeProvider';
import EnhancedFilterDialog from './EnhancedFilterDialog';

interface SettingsPageProps {
  onNavigateBack?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateBack }) => {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: {
      newMatches: true,
      messages: true,
      likes: true,
      marketing: false
    },
    privacy: {
      showAge: true,
      showDistance: true,
      incognito: false,
      onlyVerified: false
    },
    discovery: {
      showMe: true,
      maxDistance: 50,
      ageRange: [22, 35] as [number, number]
    },
    appearance: {
      darkMode: theme === 'dark',
      language: 'fr'
    }
  });

  // Charger les réglages depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dating-app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setIsPaused(localStorage.getItem('account-paused') === 'true');
      } catch (error) {
        console.error('Erreur lors du chargement des réglages:', error);
      }
    }
  }, []);

  // Sauvegarder les réglages dans localStorage
  useEffect(() => {
    localStorage.setItem('dating-app-settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const handlePauseAccount = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    localStorage.setItem('account-paused', newPausedState.toString());
    
    toast({
      title: newPausedState ? "Compte mis en pause" : "Compte réactivé",
      description: newPausedState 
        ? "Votre profil ne sera plus visible" 
        : "Votre profil est de nouveau visible",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Suppression programmée",
      description: "Votre compte sera supprimé dans 30 jours",
      variant: "destructive",
    });
  };

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="bg-gradient-hero p-6 text-white flex items-center">
        {onNavigateBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateBack}
            className="mr-3 text-white hover:bg-white/20"
          >
            ←
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">Réglages</h1>
          <p className="text-white/80">Personnalisez votre expérience</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filtres de découverte */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres de découverte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                console.log('Ouvrir les filtres depuis les réglages...');
                setShowFilterDialog(true);
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Modifier les filtres
            </Button>
            
            <div className="space-y-2">
              <Label>Distance maximale: {settings.discovery.maxDistance} km</Label>
              <Slider
                value={[settings.discovery.maxDistance]}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  discovery: { ...prev.discovery, maxDistance: value[0] }
                }))}
                min={1}
                max={200}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tranche d'âge: {settings.discovery.ageRange[0]} - {settings.discovery.ageRange[1]} ans</Label>
              <Slider
                value={settings.discovery.ageRange}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  discovery: { ...prev.discovery, ageRange: value as [number, number] }
                }))}
                min={18}
                max={80}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Nouveaux matches</Label>
              <Switch
                checked={settings.notifications.newMatches}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, newMatches: checked }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Messages</Label>
              <Switch
                checked={settings.notifications.messages}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, messages: checked }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Likes reçus</Label>
              <Switch
                checked={settings.notifications.likes}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, likes: checked }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Communications marketing</Label>
              <Switch
                checked={settings.notifications.marketing}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, marketing: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Confidentialité */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Afficher mon âge</Label>
              <Switch
                checked={settings.privacy.showAge}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, showAge: checked }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Afficher ma distance</Label>
              <Switch
                checked={settings.privacy.showDistance}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, showDistance: checked }
                }))}
              />
            </div>
            
          </CardContent>
        </Card>

        {/* Découverte */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Découverte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Me montrer dans la découverte</Label>
                <p className="text-sm text-muted-foreground">
                  Votre profil apparaîtra aux autres utilisateurs
                </p>
              </div>
              <Switch
                checked={settings.discovery.showMe}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  discovery: { ...prev.discovery, showMe: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              {settings.appearance.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mode sombre</Label>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => {
                  const newTheme = checked ? 'dark' : 'light';
                  setTheme(newTheme);
                  setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, darkMode: checked }
                  }));
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Langue</Label>
              <Select 
                value={settings.appearance.language} 
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, language: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Actions du compte */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle>Gestion du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant={isPaused ? "default" : "outline"}
              className={`w-full justify-start ${isPaused ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
              onClick={handlePauseAccount}
            >
              <Pause className="w-4 h-4 mr-2" />
              {isPaused ? "Réactiver mon compte" : "Mettre en pause mon compte"}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement votre compte et toutes vos données.
                    Vous disposez de 30 jours pour annuler cette action.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Informations légales */}
        <div className="text-center space-y-2 text-sm text-muted-foreground">
          <p>Version 1.0.0</p>
          <div className="flex justify-center space-x-4">
            <Button variant="link" className="p-0 h-auto text-xs">
              Conditions d'utilisation
            </Button>
            <Button variant="link" className="p-0 h-auto text-xs">
              Politique de confidentialité
            </Button>
            <Button variant="link" className="p-0 h-auto text-xs">
              Support
            </Button>
          </div>
        </div>
      </div>

      <EnhancedFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onFiltersApply={() => {
          toast({
            title: "Filtres appliqués",
            description: "Vos préférences ont été mises à jour",
          });
        }}
      />
    </div>
  );
};

export default SettingsPage;