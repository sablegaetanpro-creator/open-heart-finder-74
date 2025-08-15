#!/bin/bash

# Script de build pour Android - LoveConnect Dating App
# Usage: ./build-android.sh [debug|release]

set -e

echo "🚀 LoveConnect - Build Android Script"
echo "====================================="

# Vérifier les arguments
BUILD_TYPE=${1:-debug}
echo "📱 Type de build: $BUILD_TYPE"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

# Vérifier les dépendances
echo "🔍 Vérification des dépendances..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Build du projet web
echo "🏗️ Build du projet web..."
npm run build

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le dossier dist n'a pas été créé"
    exit 1
fi

# Vérifier Capacitor
if [ ! -d "android" ]; then
    echo "🤖 Ajout de la plateforme Android..."
    npx cap add android
fi

# Synchroniser les fichiers
echo "🔄 Synchronisation Capacitor..."
npx cap sync

# Copier les fichiers web
echo "📋 Copie des fichiers web..."
npx cap copy android

# Aller dans le dossier Android
cd android

# Build selon le type
if [ "$BUILD_TYPE" = "release" ]; then
    echo "🏭 Build release APK..."
    ./gradlew assembleRelease
    
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        echo "✅ APK release généré: app/build/outputs/apk/release/app-release.apk"
        echo "📱 Taille: $(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)"
    else
        echo "❌ Erreur lors de la génération de l'APK release"
        exit 1
    fi
else
    echo "🔧 Build debug APK..."
    ./gradlew assembleDebug
    
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        echo "✅ APK debug généré: app/build/outputs/apk/debug/app-debug.apk"
        echo "📱 Taille: $(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)"
    else
        echo "❌ Erreur lors de la génération de l'APK debug"
        exit 1
    fi
fi

# Retourner au répertoire racine
cd ..

echo ""
echo "🎉 Build terminé avec succès!"
echo "📱 APK prêt pour installation sur Android"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Transférer l'APK sur votre téléphone Android"
echo "2. Activer 'Sources inconnues' dans les paramètres"
echo "3. Installer l'application"
echo "4. Tester toutes les fonctionnalités"
echo ""
echo "🚀 Pour publier sur Google Play Store:"
echo "1. Créer un compte développeur Google Play"
echo "2. Générer un APK signé avec: ./build-android.sh release"
echo "3. Suivre les instructions du README.md"
