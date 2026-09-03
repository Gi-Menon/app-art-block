import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Feed from '../feed';
import Artes from '../feed/artes';
import Animações from '../feed/animacao';
import { openDrawer } from './navigation';
import HomeScreen from './screens/HomeScreen';

const Tab = createBottomTabNavigator();

function ArtsScreen() {
  return <Feed/>;
}

function getTabIcon(routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap {
  switch (routeName) {
    case 'Principal':
      return focused ? 'home' : 'home-outline';
    case 'Artes':
      return focused ? 'color-palette' : 'color-palette-outline';
    case 'Animações':
      return focused ? 'film' : 'film-outline';
    default:
      return focused ? 'construct' : 'construct-outline';
  }
}

function EmptyScreen({ title }: { title: string }) {
  return (
    <View style={styles.emptyScreen}>
      <Text style={styles.emptyTitle}>{title}</Text>
    </View>
  );
}

export default function Menus() {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Abrir menu lateral"
        onPress={openDrawer}
        style={styles.drawerButton}
      >
        <Text style={styles.drawerIcon}>☰</Text>
      </Pressable>

      <Tab.Navigator
        initialRouteName="Principal"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#38465a',
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={getTabIcon(route.name, focused)}
              size={size}
              color={color}
            />
          ),
          tabBarStyle: {
            height: 64,
            paddingBottom: 8,
            backgroundColor: '#8a9eb8',
            borderTopWidth: 0,
          },
        })}
      >
        <Tab.Screen name="Principal" component={HomeScreen} />
        <Tab.Screen name="Artes" component={Artes} />
        <Tab.Screen name="Animações" component={Animações} />
        <Tab.Screen name="Wips">
          {() => <EmptyScreen title="Wips" />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerButton: {
    alignItems: 'center',
    backgroundColor: '#8a9eb8',
    borderRadius: 28,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    top: 48,
    width: 56,
    zIndex: 10,
  },
  drawerIcon: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 28,
  },
  emptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#2d3748',
    fontSize: 20,
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});