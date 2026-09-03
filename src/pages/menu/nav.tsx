import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Menus from './index';
import { navigationRef } from './navigation';
import ProfileScreen from './screens/ProfileScreen';

const Drawer = createDrawerNavigator();

export default function nav() {
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
      <Drawer.Screen name="Home" component={Menus} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
