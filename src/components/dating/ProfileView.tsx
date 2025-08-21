import React from 'react';
import SimplifiedProfileView from './SimplifiedProfileView';

interface ProfileViewProps {
  onNavigateToSettings?: () => void;
  onViewGivenLikesProfile?: (profile: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToSettings, onViewGivenLikesProfile }) => {
  // Utiliser la version simplifiée
  return <SimplifiedProfileView onNavigateToSettings={onNavigateToSettings} />;
};

export default ProfileView;