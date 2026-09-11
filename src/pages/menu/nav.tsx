import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Menus from './index';
import { Usuario } from '../../global/api';
import ProfileScreen from './screens/ProfileScreen';

const Drawer = createDrawerNavigator();

export default function Nav({
  usuario,
  onUsuarioChange,
}: {
  usuario: Usuario;
  onUsuarioChange: React.Dispatch<React.SetStateAction<Usuario | null>>;
}) {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: 'transparent',
        drawerInactiveBackgroundColor: 'transparent',
        drawerItemStyle: { backgroundColor: 'transparent' },
        drawerLabelStyle: { color: '#fff' },
        drawerStyle: { backgroundColor: '#8a9eb8' },
      }}
    >
      <Drawer.Screen name="Home">
        {() => <Menus usuario={usuario} />}
      </Drawer.Screen>
      <Drawer.Screen name="Perfil">
        {() => <ProfileScreen usuario={usuario} onUsuarioChange={onUsuarioChange} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
