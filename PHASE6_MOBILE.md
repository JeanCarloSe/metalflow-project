# Phase 6: Mobile App (React Native)

## Visão Geral

Phase 6 especifica a arquitetura para um app mobile (iOS + Android) usando React Native com capacidades offline-first.

## 📱 Estrutura do Projeto

```
metalflow-mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── TenantSelectorScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── QuotationBuilderScreen.js
│   │   ├── HistoryScreen.js
│   │   ├── AnalyticsScreen.js
│   │   └── SettingsScreen.js
│   ├── components/
│   │   ├── QuotationLineItem.js
│   │   ├── ClientSelector.js
│   │   ├── StatusBadge.js
│   │   ├── OfflineIndicator.js
│   │   └── SyncStatus.js
│   ├── services/
│   │   ├── storageService.js (SQLite)
│   │   ├── syncService.js (Replicache)
│   │   ├── authService.js
│   │   ├── notificationService.js (Push)
│   │   └── cameraService.js
│   ├── navigation/
│   │   ├── RootNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── AppNavigator.js
│   ├── redux/
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── quotationsSlice.js
│   │   │   ├── clientsSlice.js
│   │   │   └── syncSlice.js
│   ├── theme/
│   │   └── colors.js
│   └── App.js
├── app.json
├── package.json
└── README.md
```

## 🔧 Stack Tecnológico

```json
{
  "dependencies": {
    "react-native": "^0.73.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-sqlite-storage": "^6.0.0",
    "replicache": "^24.1.0",
    "axios": "^1.6.0",
    "@react-native-camera/camera": "^4.2.0",
    "react-native-push-notifications": "^8.1.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "react-native-svg": "^13.14.0",
    "react-native-date-picker": "^4.6.0",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-reanimated": "^3.6.0"
  },
  "devDependencies": {
    "react-native-cli": "^2.0.1",
    "eas-cli": "^5.9.0"
  }
}
```

## 📲 Telas Principais

### 1. **Auth Stack**
- **LoginScreen**: Email/senha com validação
- **TenantSelectorScreen**: Selecionar empresa
- **RegisterScreen**: Novo usuário

### 2. **App Stack**
- **DashboardScreen**: KPIs, quick actions, insights
- **QuotationBuilderScreen**: Criar/editar orçamentos
- **HistoryScreen**: Lista com filtros, busca
- **AnalyticsScreen**: Gráficos e estatísticas
- **SettingsScreen**: Configurações, integrações

## 🏗️ Arquitetura

### State Management (Redux Toolkit)
```javascript
// authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    tenant: null,
    token: null,
    loading: false,
  },
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    logout: (state) => { state.user = null; state.token = null; },
  },
});
```

### Offline Storage (SQLite + Replicache)
```javascript
// storageService.js
export const initDB = async () => {
  const db = await SQLite.openDatabase('metalflow.db');
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      number TEXT,
      clientId TEXT,
      totalPrice REAL,
      status TEXT,
      date TEXT,
      synced INTEGER DEFAULT 0
    )
  `);
  return db;
};

export const syncWithBackend = async () => {
  // Usar Replicache para sync automático
};
```

### Navigation
```javascript
// RootNavigator.js
export const RootNavigator = ({ user, tenant }) => {
  if (!tenant) return <TenantSelectorScreen />;
  if (!user) return <LoginScreen />;
  return <AppNavigator />;
};
```

## 📷 Features Especiais

### 1. **Camera Integration**
```javascript
// components/CameraCapture.js
<CameraRoll.openCropper({
  mediaType: 'photo',
  width: 200,
  height: 200,
  cropping: true,
  cropperToolbarTitle: 'Foto da Peça',
}).then(image => {
  onPhotoCapture(image);
});
```

### 2. **Push Notifications**
```javascript
// notificationService.js
export const requestNotificationPermission = async () => {
  await notifee.requestPermission();
};

export const onMessageReceived = (message) => {
  if (message.notification) {
    notifee.displayNotification({
      title: message.notification.title,
      body: message.notification.body,
      android: { channelId: 'default' },
    });
  }
};
```

### 3. **Offline Indicator**
```javascript
// components/OfflineIndicator.js
<View style={[
  styles.indicator,
  { backgroundColor: isOnline ? '#10b981' : '#ef4444' }
]}>
  <Text style={styles.text}>
    {isOnline ? '✓ Online' : '⚠️ Offline'}
  </Text>
</View>
```

### 4. **Gesture Support**
```javascript
// Swipe to delete
<Swipeable
  renderRightActions={() => <DeleteButton />}
  onSwipeableRightOpen={() => handleDelete(id)}
>
  <QuotationItem item={item} />
</Swipeable>
```

## 🔄 Sync Strategy

```
┌──────────────────────────────┐
│  Local SQLite (Offline)      │
│  ├── quotations              │
│  ├── clients                 │
│  └── materials               │
└──────────────┬───────────────┘
               │
         (Replicache)
               │
┌──────────────▼───────────────┐
│  Backend API (Online)        │
│  ├── /api/quotations         │
│  ├── /api/sync/delta         │
│  └── /api/sync/import        │
└──────────────────────────────┘
```

### Sincronização
1. **User goes offline**: Operações salvas localmente
2. **User creates quotation**: Armazenado em SQLite com `synced: 0`
3. **User goes online**: Replicache detecta e sincroniza
4. **Conflict resolution**: Last-write-wins ou server-side merge

## 📊 Performance

| Métrica | Target | Atual |
|---------|--------|-------|
| Initial Load | <2s | - |
| Quotation Creation | <500ms | - |
| Sync Time | <5s | - |
| Offline Support | 100% | - |
| App Size | <50MB | - |

## 🚀 Deployment

### iOS
```bash
eas build --platform ios
eas submit --platform ios
```

### Android
```bash
eas build --platform android
eas submit --platform android
```

### Configuration (app.json)
```json
{
  "expo": {
    "name": "Metalflow",
    "slug": "metalflow",
    "version": "2.0.0",
    "ios": { "bundleIdentifier": "com.astonmetalurgica.metalflow" },
    "android": { "package": "com.astonmetalurgica.metalflow" },
    "plugins": [
      "@react-native-camera/camera",
      "@react-native-firebase/app"
    ]
  }
}
```

## 📱 Platform-Specific Features

### iOS
- Face ID / Touch ID authentication
- iCloud backup support
- Siri shortcuts integration
- AirDrop document sharing

### Android
- Biometric authentication
- Google Drive backup
- Android widgets
- Share to multiple apps

## 🧪 Testing

```bash
# Unit tests
jest src/services/

# Integration tests
detox test e2e/01.e2e.js --configuration ios.sim.debug

# Performance testing
react-native-performance-profiler
```

## 🔒 Security

- ✅ SSL pinning
- ✅ Keychain/Keystore para tokens
- ✅ Encriptação de dados locais
- ✅ Biometric authentication
- 🔲 OWASP compliance
- 🔲 Penetration testing

## 📈 Analytics

```javascript
// Analytics events
analytics.logEvent('quotation_created', {
  clientName: client.name,
  totalPrice: quotation.totalPrice,
  lineCount: quotation.lines.length,
});
```

## 🗺️ Roadmap

**MVP (v2.0)**
- ✅ Offline-first architecture
- ✅ Dashboard
- ✅ Quotation builder
- ✅ History/search

**v2.1**
- 🔲 Camera integration
- 🔲 Push notifications
- 🔲 Advanced sync

**v2.2**
- 🔲 Signature capture
- 🔲 Document export (PDF)
- 🔲 Voice commands

**v3.0**
- 🔲 AR visualization (ver peça em 3D)
- 🔲 AI recommendations
- 🔲 Collaborative features

## 📚 Resources

- React Native Docs: https://reactnative.dev
- Replicache: https://replicache.dev
- Expo: https://expo.dev
- React Navigation: https://reactnavigation.org

---

Phase 6 torna Metalflow acessível em qualquer lugar, com suporte total offline.
