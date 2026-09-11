import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
import { Usuario } from './src/global/api';
import Login from './src/pages/login';
import Nav from './src/pages/menu/nav';
import { navigationRef } from './src/pages/menu/navigation';

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

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
