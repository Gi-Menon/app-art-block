import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { atualizarPerfil, listarPosts, Post, Usuario } from '../../../global/api';
import { openDrawer } from '../navigation';

export default function ProfileScreen({
  usuario,
  onUsuarioChange,
}: {
  usuario: Usuario;
  onUsuarioChange: React.Dispatch<React.SetStateAction<Usuario | null>>;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [bio, setBio] = useState(usuario?.bio ?? '');
  const [carregando, setCarregando] = useState(true);
  const [salvandoBio, setSalvandoBio] = useState(false);

  useEffect(() => {
    setBio(usuario?.bio ?? '');
  }, [usuario?.bio]);

  useEffect(() => {
    const carregarPerfil = async () => {
      setCarregando(true);
      try {
        const dados = await listarPosts(undefined, usuario.id);
        setPosts(dados);
      } catch {
        Alert.alert('Erro', 'Nao foi possivel carregar o perfil.');
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [usuario.id]);

  const minhasPostagens = posts.filter((post) => post.usuario_id === usuario.id);
  const postagensCurtidas = posts.filter((post) => post.curtido_por_mim && post.usuario_id !== usuario.id);

  const salvarBio = async () => {
    try {
      setSalvandoBio(true);
      const usuarioAtualizado = await atualizarPerfil(usuario.id, { bio });

      onUsuarioChange((anterior) => {
        if (!anterior) {
          return usuarioAtualizado;
        }

        return {
          ...anterior,
          bio: usuarioAtualizado.bio,
          nome: usuarioAtualizado.nome ?? anterior.nome,
        };
      });

      Alert.alert('Sucesso', 'Biografia atualizada com sucesso.');
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Nao foi possivel salvar a biografia.');
    } finally {
      setSalvandoBio(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        accessibilityLabel="Abrir menu lateral"
        onPress={openDrawer}
        style={styles.drawerButton}
      >
        <Text style={styles.drawerIcon}>☰</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>{usuario.nome || usuario.arroba}</Text>
        <Text style={styles.handle}>{usuario.arroba}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Biografia</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={300}
          placeholder="Escreva sua biografia..."
          style={styles.input}
        />
        <Pressable onPress={salvarBio} disabled={salvandoBio} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{salvandoBio ? 'Salvando...' : 'Salvar biografia'}</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{minhasPostagens.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{postagensCurtidas.length}</Text>
          <Text style={styles.statLabel}>Curtidas</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posts publicados</Text>
        {carregando ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : minhasPostagens.length === 0 ? (
          <Text style={styles.emptyText}>Você ainda não publicou nada.</Text>
        ) : (
          minhasPostagens.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.postText}>{post.texto}</Text>
              <Text style={styles.postMeta}>{post.curtidas} curtidas • {post.comentarios} comentários</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Curtidos</Text>
        {postagensCurtidas.length === 0 ? (
          <Text style={styles.emptyText}>Você ainda não curtiu nenhum post.</Text>
        ) : (
          postagensCurtidas.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.postAuthor}>{post.nome || post.arroba}</Text>
              <Text style={styles.postText}>{post.texto}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8a9eb8',
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 80,
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
  header: {
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  handle: {
    color: '#dbeafe',
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 10,
    borderWidth: 1,
    color: '#1f2937',
    minHeight: 100,
    padding: 12,
    textAlignVertical: 'top',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#8a9eb8',
    borderRadius: 10,
    marginTop: 12,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 16,
  },
  statValue: {
    color: '#1f2937',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#4b5563',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 20,
    padding: 16,
  },
  emptyText: {
    color: '#4b5563',
    fontSize: 15,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
  },
  postAuthor: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '700',
  },
  postText: {
    color: '#1f2937',
    fontSize: 15,
    marginTop: 6,
  },
  postMeta: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 6,
  },
});
