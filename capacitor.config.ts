import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'id.my.fikfikk.figo',
  appName: 'FiGo',
  webDir: '.output/public',
  server: {
    url: 'https://go.fikfikk.my.id',
    cleartext: false,
    allowNavigation: ['go.fikfikk.my.id'],
  },
  android: {
    backgroundColor: '#0f1117',
  },
}

export default config
