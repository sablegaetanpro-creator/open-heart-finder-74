import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Heart, 
  Zap, 
  Eye, 
  MessageCircle, 
  Shield,
  Check,
  CreditCard,
  Smartphone,
  Wallet
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  feature?: 'premium' | 'super_likes' | 'boost' | 'reveal_likes';
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  feature = 'premium'
}) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    premium: {
      monthly: { price: 9.99, duration: '1 mois' },
      quarterly: { price: 24.99, duration: '3 mois', savings: '17%' },
      yearly: { price: 79.99, duration: '12 mois', savings: '33%' }
    },
    super_likes: {
      pack_5: { price: 4.99, duration: '5 Super Likes' },
      pack_15: { price: 12.99, duration: '15 Super Likes', savings: '13%' },
      pack_30: { price: 19.99, duration: '30 Super Likes', savings: '33%' }
    },
    boost: {
      single: { price: 3.99, duration: '1 Boost (30 min)' },
      pack_5: { price: 16.99, duration: '5 Boosts', savings: '15%' },
      pack_10: { price: 29.99, duration: '10 Boosts', savings: '25%' }
    },
    reveal_likes: {
      single: { price: 2.99, duration: 'Voir qui vous aime' }
    }
  } as const;

  type PlanKey = keyof typeof plans;
  type PlanValueKeys<T extends PlanKey> = keyof typeof plans[T];

  const features = {
    premium: [
      'Likes illimités',
      'Voir qui vous aime',
      'Super Likes quotidiens',
      'Boosts gratuits',
      'Pas de publicité',
      'Mode invisible',
      'Retour en arrière',
      'Support prioritaire'
    ],
    super_likes: [
      'Soyez remarqué(e)',
      'Plus de chances de match',
      'Notification prioritaire'
    ],
    boost: [
      'Top profil pendant 30 min',
      '10x plus de vues',
      'Plus de matches'
    ],
    reveal_likes: [
      'Voir qui vous a liké',
      'Économisez du temps',
      'Matches instantanés'
    ]
  };

  const handlePayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // Create payment intent via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          feature,
          plan: selectedPlan,
          payment_method: paymentMethod,
          amount: plans[feature][selectedPlan]?.price || 0
        }
      });

      if (error) throw error;

      if (data?.payment_url) {
        // Redirect to payment provider
        window.open(data.payment_url, '_blank');
      } else {
        // Simulate successful payment for demo
        await simulatePayment();
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de traiter le paiement",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePayment = async () => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Enregistrer l'achat dans la base
    try {
      const price = (plans as any)[feature][selectedPlan]?.price || 0;
      const { error } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user?.id,
          feature,
          plan: selectedPlan,
          amount: price,
          status: 'completed',
          payment_method: paymentMethod
        });

      if (error) throw error;

      toast({
        title: "Paiement réussi !",
        description: `Votre ${feature} a été activé avec succès`
      });

      if (onSuccess) onSuccess();
      onClose();

    } catch (error) {
      console.error('Error recording purchase:', error);
    }
  };

  const getFeatureIcon = () => {
    switch (feature) {
      case 'premium': return <Crown className="w-6 h-6" />;
      case 'super_likes': return <Zap className="w-6 h-6" />;
      case 'boost': return <Heart className="w-6 h-6" />;
      case 'reveal_likes': return <Eye className="w-6 h-6" />;
      default: return <Crown className="w-6 h-6" />;
    }
  };

  const getFeatureTitle = () => {
    switch (feature) {
      case 'premium': return 'Premium';
      case 'super_likes': return 'Super Likes';
      case 'boost': return 'Boost';
      case 'reveal_likes': return 'Voir qui vous aime';
      default: return 'Premium';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFeatureIcon()}
            {getFeatureTitle()}
          </DialogTitle>
          <DialogDescription className="sr-only">Paiement sécurisé pour activer des fonctionnalités premium</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Benefits */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10">
            <div className="space-y-2">
              {features[feature].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Plan Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Choisir un plan</h3>
            <div className="space-y-2">
              {Object.entries(plans[feature]).map(([key, plan]) => (
                <Card
                  key={key}
                  className={`p-3 cursor-pointer border-2 transition-all ${
                    selectedPlan === key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="font-medium">{plan.duration}</div>
                    <div className="text-2xl font-bold text-primary">
                      {plan.price}€
                    </div>
                  </div>
                  {'savings' in plan && plan.savings && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      -{plan.savings}
                    </Badge>
                  )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="font-medium">Mode de paiement</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'card', icon: CreditCard, label: 'Carte' },
                { id: 'paypal', icon: Wallet, label: 'PayPal' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' }
              ].map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  variant={paymentMethod === id ? 'default' : 'outline'}
                  size="sm"
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setPaymentMethod(id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-love hover:opacity-90"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Payer {plans[feature][selectedPlan]?.price}€
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Paiement sécurisé SSL. Annulable à tout moment.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;