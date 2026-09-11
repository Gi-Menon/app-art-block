import React from 'react';
import Feed from '../../feed';
import { Usuario } from '../../../global/api';

export default function HomeScreen({ usuario }: { usuario?: Usuario | null }) {
  return (
    <Feed category="Principal" usuario={usuario} />
  );
}
