import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cd8e53c81cd04f3b8506a6e8262920e5',
  appName: 'LoveConnect - App de Rencontres',
  webDir: 'dist',
  server: {
    url: 'https://4300ab76-ad1b-4084-8ca9-03e4344e1aff.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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