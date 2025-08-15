import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Users, MessageCircle, Shield } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

interface OnboardingHeroProps {
  onGetStarted: () => void;
}

const OnboardingHero: React.FC<OnboardingHeroProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center text-white">
        <div className="relative mb-8">
          <img 
            src={heroImage} 
            alt="LoveConnect Hero" 
            className="w-80 h-48 object-cover rounded-3xl shadow-love"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-float">
            LoveConnect
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-6">
            L'app de rencontres 100% gratuite
          </p>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            Rencontrez des personnes authentiques près de chez vous. 
            Pas d'abonnement, pas de limite, juste de vraies connexions.
          </p>
        </div>

        <Button 
          variant="hero" 
          onClick={onGetStarted}
          className="w-full max-w-xs mb-8"
        >
          <Heart className="w-5 h-5 mr-2" />
          Commencer l'aventure
        </Button>
      </div>

      {/* Features Section */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-6">
        <h2 className="text-white text-xl font-semibold text-center mb-6">
          Pourquoi choisir LoveConnect ?
        </h2>
        
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="text-center text-white">
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-sm">Likes illimités</h3>
            <p className="text-xs text-white/80">Aucune limite</p>
          </div>
          
          <div className="text-center text-white">
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-sm">Profils vérifiés</h3>
            <p className="text-xs text-white/80">Sécurité garantie</p>
          </div>
          
          <div className="text-center text-white">
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-sm">Chat privé</h3>
            <p className="text-xs text-white/80">Après match</p>
          </div>
          
          <div className="text-center text-white">
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-sm">100% gratuit</h3>
            <p className="text-xs text-white/80">Toujours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingHero;