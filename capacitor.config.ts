import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cd8e53c81cd04f3b8506a6e8262920e5',
  appName: 'LoveConnect - App de Rencontres',
  webDir: 'dist',
  // server enlevé pour utiliser les assets locaux packagés dans l'APK
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keyPassword: undefined,
    }
  },
  ios: {
    scheme: 'LoveConnect'
  }
};

export default config;