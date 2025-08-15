# LoveConnect - Application de Rencontres

Une application de rencontres moderne et intuitive, construite avec React, TypeScript, et Capacitor pour une expérience native sur mobile.

## 🚀 Fonctionnalités

- **Interface moderne** inspirée de Happn
- **Mode hors ligne** avec synchronisation automatique
- **Système de swipe** vertical avec like/dislike/super-like
- **Chat en temps réel** avec support multimédia
- **Système de paiement** intégré (Stripe, PayPal)
- **Publicités** optimisées (AdMob)
- **Filtres avancés** de recherche
- **140+ passions** pour une meilleure compatibilité
- **Design responsive** et accessible

## 📱 Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Mobile**: Capacitor 7, Android SDK
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Base de données locale**: Dexie (IndexedDB)
- **UI Components**: Radix UI, Shadcn/ui
- **État**: React Query, Context API
- **Paiements**: Stripe, PayPal
- **Publicités**: Google AdMob

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Android Studio (pour le développement Android)
- JDK 11+
- Supabase account

### 1. Cloner le projet

```bash
git clone <votre-repo-url>
cd open-heart-finder-main
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
VITE_STRIPE_PUBLISHABLE_KEY=votre_clé_stripe_publique
VITE_ADMOB_BANNER_ID=ca-app-pub-votre-id/banner-unit
VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-votre-id/interstitial-unit
```

### 4. Configuration de la base de données

Exécutez les migrations Supabase dans votre dashboard :

```sql
-- Créer les tables principales
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme', 'autre')),
  looking_for TEXT NOT NULL CHECK (looking_for IN ('homme', 'femme', 'les_deux')),
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('amitie', 'relation_serieuse', 'relation_casuelle', 'mariage')),
  smoker BOOLEAN DEFAULT false,
  animals TEXT NOT NULL CHECK (animals IN ('aime_animaux', 'n_aime_pas_animaux', 'allergie_animaux')),
  children TEXT NOT NULL CHECK (children IN ('veut_enfants', 'ne_veut_pas_enfants', 'a_deja_enfants', 'pas_sur')),
  profile_photo_url TEXT DEFAULT '',
  bio TEXT,
  location TEXT,
  max_distance INTEGER DEFAULT 50,
  interests TEXT[] DEFAULT '{}',
  is_profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fonction pour créer un profil utilisateur
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  email TEXT,
  first_name TEXT,
  age INTEGER,
  gender TEXT,
  looking_for TEXT,
  relationship_type TEXT,
  smoker BOOLEAN,
  animals TEXT,
  children TEXT,
  profile_photo_url TEXT,
  max_distance INTEGER,
  is_profile_complete BOOLEAN
) RETURNS profiles AS $$
DECLARE
  new_profile profiles;
BEGIN
  INSERT INTO profiles (
    user_id, email, first_name, age, gender, looking_for, 
    relationship_type, smoker, animals, children, profile_photo_url, 
    max_distance, is_profile_complete
  ) VALUES (
    user_id, email, first_name, age, gender, looking_for,
    relationship_type, smoker, animals, children, profile_photo_url,
    max_distance, is_profile_complete
  ) RETURNING * INTO new_profile;
  
  RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Développement local

```bash
# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build
```

## 📱 Déploiement Android

### 1. Préparer l'environnement Android

```bash
# Installer Capacitor CLI globalement
npm install -g @capacitor/cli

# Ajouter la plateforme Android
npm run cap:add:android

# Synchroniser les fichiers
npm run cap:sync
```

### 2. Configuration Android

Ouvrez `android/app/src/main/AndroidManifest.xml` et ajoutez les permissions :

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### 3. Build et test

```bash
# Build du projet web
npm run build

# Copier les fichiers vers Android
npm run cap:copy

# Ouvrir dans Android Studio
npm run cap:run:android
```

### 4. Générer l'APK

```bash
# Build debug APK
cd android
./gradlew assembleDebug

# Build release APK (nécessite un keystore)
./gradlew assembleRelease
```

L'APK sera généré dans : `android/app/build/outputs/apk/debug/app-debug.apk`

## 🔧 Configuration des services

### AdMob

1. Créez un compte AdMob
2. Ajoutez votre application
3. Créez des unités publicitaires (banner, interstitial)
4. Remplacez les IDs dans `.env.local`

### Stripe

1. Créez un compte Stripe
2. Récupérez vos clés API
3. Configurez les webhooks
4. Ajoutez les clés dans Supabase Edge Functions

### PayPal

1. Créez un compte PayPal Developer
2. Configurez votre application
3. Ajoutez les credentials dans les Edge Functions

## 🚀 Déploiement Google Play Store

### 1. Préparer l'APK

```bash
# Build release avec signature
cd android
./gradlew bundleRelease
```

### 2. Créer un compte développeur

- Inscrivez-vous sur [Google Play Console](https://play.google.com/console)
- Payez les frais d'inscription ($25)

### 3. Publier l'application

1. Créez une nouvelle application
2. Remplissez les informations :
   - Nom : "LoveConnect - App de Rencontres"
   - Description
   - Captures d'écran
   - Icône (512x512)
   - Bannière (1024x500)
3. Téléchargez l'AAB (Android App Bundle)
4. Configurez la confidentialité
5. Soumettez pour examen

## 📊 Monitoring et Analytics

- **Supabase Analytics** : Suivi des utilisateurs et performances
- **AdMob Analytics** : Revenus publicitaires
- **Stripe Dashboard** : Paiements et abonnements
- **Google Play Console** : Métriques d'application

## 🔒 Sécurité

- Authentification Supabase
- Row Level Security (RLS)
- Validation des données côté client et serveur
- Chiffrement des communications
- Gestion sécurisée des paiements

## 🐛 Dépannage

### Erreurs courantes

1. **"useAuth must be used within an AuthProvider"**
   - Vérifiez que AuthProvider entoure votre application

2. **Erreurs de build Android**
   - Vérifiez que Android Studio est installé
   - Mettez à jour le SDK Android

3. **Problèmes de synchronisation**
   - Vérifiez la connexion internet
   - Redémarrez l'application

### Logs de débogage

```bash
# Voir les logs Android
adb logcat | grep "LoveConnect"

# Voir les logs Capacitor
npx cap run android --livereload
```

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation Supabase
- Vérifiez les logs de débogage
- Contactez l'équipe de développement

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

**LoveConnect** - Connectez-vous avec votre âme sœur ❤️
