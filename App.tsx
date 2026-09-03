import { NavigationContainer } from '@react-navigation/native';
import Nav from './src/pages/menu/nav';
import { navigationRef } from './src/pages/menu/navigation';

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Nav />
    </NavigationContainer>
  );
}
