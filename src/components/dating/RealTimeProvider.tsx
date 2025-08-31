import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface RealTimeContextType {
  isConnected: boolean;
}

const RealTimeContext = createContext<RealTimeContextType>({ isConnected: false });

export const useRealTime = () => useContext(RealTimeContext);

interface RealTimeProviderProps {
  children: React.ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscriptions for user:', user.id);

    // Subscribe to new matches
    const matchesChannel = supabase
      .channel(`user-matches-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New match detected:', payload);
          toast({
            title: "🎉 Nouveau match !",
            description: "Vous avez un nouveau match ! Commencez à discuter !",
            duration: 5000
          });
        }
      )
      .subscribe((status) => {
        console.log('Matches subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to new likes received
    const likesChannel = supabase
      .channel(`user-likes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `swiped_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.is_like) {
            console.log('New like received:', payload);
            toast({
              title: "❤️ Nouveau like !",
              description: "Quelqu'un vous a liké ! Allez voir qui c'est.",
              duration: 3000
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Likes subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [user]);

  return (
    <RealTimeContext.Provider value={{ isConnected }}>
      {children}
    </RealTimeContext.Provider>
  );
};