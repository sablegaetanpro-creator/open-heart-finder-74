# Script de création d'APK automatique
Write-Host "Demarrage de la creation d'APK..." -ForegroundColor Green

# Étape 1: Build de l'application
Write-Host "Build de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

# Étape 2: Synchronisation avec Capacitor
Write-Host "Synchronisation avec Android..." -ForegroundColor Yellow
npx cap sync

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la synchronisation" -ForegroundColor Red
    exit 1
}

# Étape 3: Création de l'APK
Write-Host "Creation de l'APK..." -ForegroundColor Yellow
Set-Location android
./gradlew assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la création de l'APK" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Étape 4: Retour au répertoire principal
Set-Location ..

# Étape 5: Vérification de l'APK
$apkPath = "android/app/build/outputs/apk/debug/app-debug.apk"
if (Test-Path $apkPath) {
    $fileSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "APK cree avec succes !" -ForegroundColor Green
    Write-Host "📁 Emplacement: $apkPath" -ForegroundColor Cyan
    Write-Host "📏 Taille: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ APK non trouvé" -ForegroundColor Red
}

Write-Host "Processus termine !" -ForegroundColor Green
