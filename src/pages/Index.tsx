import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { offlineDataManager } from '@/lib/offlineDataManager';
import SingleProfileSwipeInterface from '@/components/dating/SingleProfileSwipeInterface';
import EnhancedMessagesView from '@/components/dating/EnhancedMessagesView';
import ProfileView from '@/components/dating/ProfileView';
import BottomNavigation from '@/components/layout/BottomNavigation';
import InterstitialAd from '@/components/monetization/InterstitialAd';
import BackButtonHandler from '@/components/dating/BackButtonHandler';
import { useOffline } from '@/hooks/useOffline';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import ProfileEditPage from './ProfileEditPage';
import NotFound from './NotFound';
import OnboardingHero from '@/components/dating/OnboardingHero';
import OfflineModeIndicator from '@/components/dating/OfflineModeIndicator';
import SettingsPage from '@/components/dating/SettingsPage';
import HappnLikesProfileView from '@/components/dating/HappnLikesProfileView';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const { isOnline } = useOffline();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'messages' | 'profile'>('discover');
  const [currentView, setCurrentView] = useState<'discover' | 'messages' | 'profile' | 'settings' | 'given-likes-profile'>('discover');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');

  // Écouter les changements de hash et route
  useEffect(() => {
    const path = window.location.pathname + window.location.hash;
    setCurrentRoute(path);
    
    const hash = window.location.hash.slice(1); // Enlever le #
    if (hash === 'settings') {
      setActiveTab('profile');
    } else if (hash && !path.includes('/profile-edit')) {
      setActiveTab(hash as any);
    }
  }, []);

  // Écouter les changements de hash et route
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname + window.location.hash;
      setCurrentRoute(path);
      
      const hash = window.location.hash.slice(1);
      if (hash === 'settings') {
        setActiveTab('profile');
      } else if (hash && !path.includes('/profile-edit')) {
        setActiveTab(hash as any);
      }
    };

    const handleNavigateToMessages = (event: CustomEvent) => {
      console.log('🔄 [Index] handleNavigateToMessages triggered with event:', event.detail);
      setActiveTab('messages');
      setCurrentView('messages');
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('navigate-to-messages', handleNavigateToMessages as EventListener);
    
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('navigate-to-messages', handleNavigateToMessages as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleGetStarted = () => {
    setIsOnboarding(false);
  };

  const handleStartChat = (matchId: string) => {
    console.log('🔄 [Index] handleStartChat called with matchId:', matchId);
    setActiveTab('messages');
    setCurrentView('messages');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('navigate-to-messages', { detail: { matchId } }));
  };

  if (isOnboarding) {
    return <OnboardingHero onGetStarted={handleGetStarted} />;
  }

  const renderActiveView = () => {
    // Handle profile navigation first
    if (currentView === 'given-likes-profile') {
      return selectedProfile ? (
        <HappnLikesProfileView
          profile={selectedProfile}
          onBack={() => setCurrentView('profile')}
          onRemoveLike={async (profileId) => {
            // Retour à l'onglet découvrir directement
            setActiveTab('discover');
            setCurrentView('discover');
            
            // Forcer le rechargement des composants sans reload de page
            setTimeout(() => {
              window.location.hash = '#discover';
              // Trigger a custom event to refresh data
              window.dispatchEvent(new CustomEvent('refresh-data'));
            }, 500);
          }}
        />
      ) : null;
    }

    switch (activeTab) {
      case 'discover':
        return (
          <div className="flex-1">
            <SingleProfileSwipeInterface onAdView={() => setShowInterstitialAd(true)} />
          </div>
        );
      case 'messages':
        console.log('💬 [Index] Rendering EnhancedMessagesView with handleStartChat');
        return <EnhancedMessagesView onStartChat={handleStartChat} />;
      case 'profile':
        return (
          <>
            <ProfileView />
          </>
        );
      default:
        return (
          <div className="flex-1">
            <SingleProfileSwipeInterface onAdView={() => setShowInterstitialAd(true)} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 overflow-hidden">
        {renderActiveView()}
      </main>
      
      {!currentRoute.includes('/profile-edit') && activeTab !== 'settings' && currentView !== 'given-likes-profile' && (
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab as any);
            setCurrentView(tab as any);
          }} 
        />
      )}

      {/* Back Button Handler for mobile */}
      <BackButtonHandler 
        currentView={currentView}
        onBackPress={() => {
          if (currentView === 'given-likes-profile') {
            setCurrentView('profile');
          } else {
            setCurrentView('discover');
            setActiveTab('discover');
          }
        }}
      />

      {/* Interstitial Ad */}
      <InterstitialAd
        isOpen={showInterstitialAd}
        onClose={() => setShowInterstitialAd(false)}
        type="video"
        duration={5}
      />
    </div>
  );
};

export default Index;
