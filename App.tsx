import { NavigationContainer } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { salvarPushToken, Usuario } from './src/global/api';
import Login from './src/pages/login';
import Nav from './src/pages/menu/nav';
import { navigationRef } from './src/pages/menu/navigation';

async function registrarPushToken(usuarioId: number) {
  const expoGo = Constants.appOwnership === 'expo'
    || Constants.executionEnvironment === 'storeClient';
  if (expoGo) {
    console.log('Notificacoes push exigem um development build; o Expo Go nao expoe os modulos nativos.');
    return;
  }

  if (!Device.isDevice) return;

  const Notifications = await import('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('artblock-notifications', {
      name: 'Curtidas e comentarios',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8A9EB8',
    });
  }

  const { status: statusAtual } = await Notifications.getPermissionsAsync();
  const finalStatus = statusAtual === 'granted'
    ? statusAtual
    : (await Notifications.requestPermissionsAsync()).status;

  if (finalStatus !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('Project ID do Expo nao configurado.');

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await salvarPushToken(usuarioId, token);
}

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    if (!usuario) return;
    registrarPushToken(usuario.id).catch((error) => {
      console.warn('Nao foi possivel registrar notificacoes push:', error);
    });
  }, [usuario]);

  return (
    <NavigationContainer ref={navigationRef}>
      {usuario ? (
        <Nav usuario={usuario} onUsuarioChange={setUsuario} />
      ) : (
        <Login onLogin={setUsuario} />
      )}
    </NavigationContainer>
  );
}
