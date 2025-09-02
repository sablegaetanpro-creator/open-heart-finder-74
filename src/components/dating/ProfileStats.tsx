import React from 'react';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import ActivityCard from './ActivityCard';

interface ProfileStatsProps {
  givenLikesCount: number;
  receivedLikesCount: number;
  matchesCount: number;
  loadingGivenLikes: boolean;
  loadingReceivedLikes: boolean;
  loadingMatches: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  givenLikesCount,
  receivedLikesCount,
  matchesCount,
  loadingGivenLikes,
  loadingReceivedLikes,
  loadingMatches
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Given Likes */}
      <ActivityCard
        title="Likes donnés"
        count={givenLikesCount}
        icon={<Heart className="w-5 h-5" />}
        color="text-primary"
        loading={loadingGivenLikes}
      >
        {givenLikesCount > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: Math.min(8, givenLikesCount) }).map((_, index) => (
              <div 
                key={index}
                className="aspect-square rounded-lg overflow-hidden bg-muted"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun like envoyé pour le moment
          </p>
        )}
      </ActivityCard>

      {/* Received Likes */}
      <ActivityCard
        title="Likes reçus"
        count={receivedLikesCount}
        icon={<Eye className="w-5 h-5" />}
        color="text-accent"
        loading={loadingReceivedLikes}
      >
        {receivedLikesCount > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: Math.min(8, receivedLikesCount) }).map((_, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-muted"
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun like reçu pour le moment
          </p>
        )}
      </ActivityCard>

      {/* Matches */}
      <ActivityCard
        title="Matches"
        count={matchesCount}
        icon={<MessageCircle className="w-5 h-5" />}
        color="text-success"
        loading={loadingMatches}
      >
        {matchesCount > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: Math.min(8, matchesCount) }).map((_, index) => (
              <div 
                key={index}
                className="aspect-square rounded-lg overflow-hidden bg-muted relative"
              >
                <div className="absolute bottom-1 right-1 bg-success rounded-full p-1">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun match pour le moment
          </p>
        )}
      </ActivityCard>
    </div>
  );
};

export default ProfileStats;