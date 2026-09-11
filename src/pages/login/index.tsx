import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { cadastrarUsuario, fazerLogin, Usuario } from '../../global/api';
import { style } from './style';

export default function Login({ onLogin }: { onLogin: (usuario: Usuario) => void }) {
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [nome, setNome] = useState('');
  const [arroba, setArroba] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const limparCampos = () => {
    setNome('');
    setArroba('');
    setEmail('');
    setSenha('');
  };

  const validarEmail = (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha email e senha para entrar.');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Email invalido', 'Digite um email valido.');
      return;
    }

    setCarregando(true);
    try {
      const usuario = await fazerLogin(email.trim(), senha);
      onLogin(usuario);
      limparCampos();
    } catch (error) {
      Alert.alert('Erro ao entrar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async () => {
    if (!nome.trim() || !arroba.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha todos os campos para criar a conta.');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Email invalido', 'Digite um email valido.');
      return;
    }

    setCarregando(true);
    try {
      const usuario = await cadastrarUsuario({
        nome: nome.trim(),
        arroba: arroba.trim(),
        email: email.trim(),
        senha,
      });
      onLogin(usuario);
      limparCampos();
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={style.container}>
      <View style={style.headerBox}>
        <Text style={style.logo}>Art Block</Text>
        <Text style={style.subtitle}>Entre para ver e publicar na sua comunidade.</Text>
      </View>

      <View style={style.card}>
        <View style={style.switchContainer}>
          <Pressable
            style={[style.switchButton, modo === 'login' && style.switchButtonActive]}
            onPress={() => setModo('login')}
          >
            <Text style={[style.switchText, modo === 'login' && style.switchTextActive]}>Entrar</Text>
          </Pressable>
          <Pressable
            style={[style.switchButton, modo === 'cadastro' && style.switchButtonActive]}
            onPress={() => setModo('cadastro')}
          >
            <Text style={[style.switchText, modo === 'cadastro' && style.switchTextActive]}>Cadastrar</Text>
          </Pressable>
        </View>

        {modo === 'cadastro' && (
          <TextInput
            style={style.input}
            placeholder="Nome completo"
            placeholderTextColor="#94a3b8"
            value={nome}
            onChangeText={setNome}
          />
        )}

        {modo === 'cadastro' && (
          <TextInput
            style={style.input}
            placeholder="@usuario"
            placeholderTextColor="#94a3b8"
            value={arroba}
            onChangeText={setArroba}
          />
        )}

        <TextInput
          style={style.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={style.input}
          placeholder="Senha"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Pressable
          style={[style.primaryButton, carregando && style.primaryButtonDisabled]}
          onPress={modo === 'login' ? handleLogin : handleCadastro}
          disabled={carregando}
        >
          <Text style={style.primaryButtonText}>{carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
