# Script de build pour Android - LoveConnect Dating App (Windows)
# Usage: .\build-android.ps1 [debug|release]

param(
    [string]$BuildType = "debug"
)

Write-Host "🚀 LoveConnect - Build Android Script (Windows)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "📱 Type de build: $BuildType" -ForegroundColor Yellow

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet." -ForegroundColor Red
    exit 1
}

# Vérifier les dépendances
Write-Host "🔍 Vérification des dépendances..." -ForegroundColor Blue

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Blue
    npm install
}

# Build du projet web
Write-Host "🏗️ Build du projet web..." -ForegroundColor Blue
npm run build

# Vérifier que le dossier dist existe
if (-not (Test-Path "dist")) {
    Write-Host "❌ Erreur: Le dossier dist n'a pas été créé" -ForegroundColor Red
    exit 1
}

# Vérifier Capacitor
if (-not (Test-Path "android")) {
    Write-Host "🤖 Ajout de la plateforme Android..." -ForegroundColor Blue
    npx cap add android
}

# Synchroniser les fichiers
Write-Host "🔄 Synchronisation Capacitor..." -ForegroundColor Blue
npx cap sync

# Copier les fichiers web
Write-Host "📋 Copie des fichiers web..." -ForegroundColor Blue
npx cap copy android

# Aller dans le dossier Android
Set-Location android

# Build selon le type
if ($BuildType -eq "release") {
    Write-Host "🏭 Build release APK..." -ForegroundColor Blue
    .\gradlew.bat assembleRelease
    
    if (Test-Path "app\build\outputs\apk\release\app-release.apk") {
        $fileSize = (Get-Item "app\build\outputs\apk\release\app-release.apk").Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        Write-Host "✅ APK release généré: app\build\outputs\apk\release\app-release.apk" -ForegroundColor Green
        Write-Host "📱 Taille: $fileSizeMB MB" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la génération de l'APK release" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "🔧 Build debug APK..." -ForegroundColor Blue
    .\gradlew.bat assembleDebug
    
    if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
        $fileSize = (Get-Item "app\build\outputs\apk\debug\app-debug.apk").Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        Write-Host "✅ APK debug généré: app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
        Write-Host "📱 Taille: $fileSizeMB MB" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la génération de l'APK debug" -ForegroundColor Red
        exit 1
    }
}

# Retourner au répertoire racine
Set-Location ..

Write-Host ""
Write-Host "🎉 Build terminé avec succès!" -ForegroundColor Green
Write-Host "📱 APK prêt pour installation sur Android" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Transférer l'APK sur votre téléphone Android" -ForegroundColor White
Write-Host "2. Activer 'Sources inconnues' dans les paramètres" -ForegroundColor White
Write-Host "3. Installer l'application" -ForegroundColor White
Write-Host "4. Tester toutes les fonctionnalités" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Pour publier sur Google Play Store:" -ForegroundColor Yellow
Write-Host "1. Créer un compte développeur Google Play" -ForegroundColor White
Write-Host "2. Générer un APK signé avec: .\build-android.ps1 release" -ForegroundColor White
Write-Host "3. Suivre les instructions du README.md" -ForegroundColor White
