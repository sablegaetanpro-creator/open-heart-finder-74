import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import OnboardingHero from '@/components/dating/OnboardingHero';
import SimplifiedSwipeInterface from '@/components/dating/SimplifiedSwipeInterface';
import SimplifiedMessagesView from '@/components/dating/SimplifiedMessagesView';
import ProfileView from '@/components/dating/ProfileView';
// Offline components removed for simplification
import SettingsPage from '@/components/dating/SettingsPage';
import ProfileEditPage from '@/pages/ProfileEditPage';
import BottomNavigation from '@/components/layout/BottomNavigation';
import InterstitialAd from '@/components/monetization/InterstitialAd';
import HappnLikesProfileView from '@/components/dating/HappnLikesProfileView';
import BackButtonHandler from '@/components/dating/BackButtonHandler';

const Index = () => {
  const { user, loading } = useAuth();
  // Offline functionality removed for simplification
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [currentView, setCurrentView] = useState<'discover' | 'messages' | 'profile' | 'settings' | 'given-likes-profile'>('discover');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);

  // Gérer la navigation par hash URL et routes
  const [currentRoute, setCurrentRoute] = useState('');
  
  useEffect(() => {
    const path = window.location.pathname + window.location.hash;
    setCurrentRoute(path);
    
    const hash = window.location.hash.slice(1); // Enlever le #
    if (hash === 'settings') {
      setActiveTab('settings');
    } else if (hash && !path.includes('/profile-edit')) {
      setActiveTab(hash);
    }
  }, []);

  // Écouter les changements de hash et route
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname + window.location.hash;
      setCurrentRoute(path);
      
      const hash = window.location.hash.slice(1);
      if (hash === 'settings') {
        setActiveTab('settings');
      } else if (hash && !path.includes('/profile-edit')) {
        setActiveTab(hash);
      }
    };

    const handleNavigateToMessages = () => {
      setActiveTab('messages');
      setCurrentView('messages');
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('navigate-to-messages', handleNavigateToMessages);
    
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('navigate-to-messages', handleNavigateToMessages);
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
    return <Navigate to="/auth" replace />;
  }

  const handleGetStarted = () => {
    setIsOnboarding(false);
  };

  const handleStartChat = (matchId: string, otherUser?: any) => {
    setActiveTab('messages');
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
            <SimplifiedSwipeInterface onAdView={() => setShowInterstitialAd(true)} />
          </div>
        );
      case 'messages':
        return <SimplifiedMessagesView onStartChat={handleStartChat} />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsPage onNavigateBack={() => setActiveTab('profile')} />;
      default:
        return (
          <div className="flex-1">
            <SimplifiedSwipeInterface onAdView={() => setShowInterstitialAd(true)} />
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
            setActiveTab(tab);
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
