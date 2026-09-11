import React from "react";
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import {style} from "./style";
import {
  alternarCurtida,
  criarComentario,
  criarPost,
  deletarComentario,
  deletarPost,
  editarPost,
  enviarImagem,
  listarComentarios,
  listarPosts,
  Comentario,
  Post,
  Usuario,
} from '../../global/api';

export default function Feed({
  category,
  usuario,
}: {
  category?: 'Principal' | 'Artes' | 'Animações' | 'Wips';
  usuario?: Usuario | null;
}){
  const [posts, setPosts] = useState<Post[]>([]);
  const [comentariosPorPost, setComentariosPorPost] = useState<Record<number, Comentario[]>>({});
  const [comentariosDigitados, setComentariosDigitados] = useState<Record<number, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [textoNovo, setTextoNovo] = useState('');
  const [imagensNovas, setImagensNovas] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [postEditandoId, setPostEditandoId] = useState<number | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<'arte' | 'animacao' | 'wip'>('arte');
  const [removerImagensAtuais, setRemoverImagensAtuais] = useState(false);

  const categoriaFiltro = category === 'Artes' ? 'arte' : category === 'Animações' ? 'animacao' : category === 'Wips' ? 'wip' : undefined;
  const categoriaPadrao = categoriaFiltro ?? 'arte';
  const postEditando = posts.find((post) => post.id === postEditandoId) ?? null;

  const carregarPosts = async () => {
    setCarregando(true);
    try {
      const postsCarregados = await listarPosts(categoriaFiltro, usuario?.id);
      setPosts(postsCarregados);
      setErro(null);
    } catch {
      setErro('Nao foi possivel carregar os posts.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPosts();
  }, [categoriaFiltro, usuario?.id]);

  useEffect(() => {
    posts.forEach(async (post) => {
      if (comentariosPorPost[post.id]) {
        return;
      }

      try {
        const comentarios = await listarComentarios(post.id);
        setComentariosPorPost((anterior) => ({
          ...anterior,
          [post.id]: comentarios,
        }));
      } catch {
        // ignora erro de comentários para não quebrar a listagem dos posts
      }
    });
  }, [posts]);

  const escolherImagem = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissao necessaria', 'Permita o acesso as fotos para escolher imagens.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 0.85,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      setImagensNovas(resultado.assets);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setPostEditandoId(null);
    setTextoNovo('');
    setImagensNovas([]);
    setRemoverImagensAtuais(false);
  };

  const abrirModalNovoPost = () => {
    if (!usuario) {
      Alert.alert('Login necessario', 'Faca login antes de criar um post.');
      return;
    }

    setPostEditandoId(null);
    setTextoNovo('');
    setImagensNovas([]);
    setCategoriaSelecionada(categoriaPadrao);
    setRemoverImagensAtuais(false);
    setModalAberto(true);
  };

  const abrirModalEdicao = (post: Post) => {
    if (!usuario) {
      Alert.alert('Login necessario', 'Faca login antes de editar um post.');
      return;
    }

    setPostEditandoId(post.id);
    setTextoNovo(post.texto);
    setImagensNovas([]);
    setCategoriaSelecionada(post.categoria);
    setRemoverImagensAtuais(false);
    setModalAberto(true);
  };

  const publicar = async () => {
    if (!usuario) {
      Alert.alert('Login necessario', 'Faca login para publicar.');
      return;
    }

    if (!textoNovo.trim() && imagensNovas.length === 0 && !postEditando) {
      Alert.alert('Post vazio', 'Escreva algo ou escolha uma ou mais imagens.');
      return;
    }

    setPublicando(true);
    try {
      let arquivos: { url: string; tipo: 'imagem' }[] = [];

      if (imagensNovas.length > 0) {
        arquivos = await Promise.all(
          imagensNovas.map(async (imagem) =>
            enviarImagem(
              imagem.uri,
              imagem.fileName || 'imagem.jpg',
              imagem.mimeType || 'image/jpeg',
            ),
          ),
        );
      } else if (postEditando && postEditando.arquivos.length > 0) {
        arquivos = postEditando.arquivos.map((arquivo) => ({
          url: arquivo.url,
          tipo: 'imagem',
        }));
      }

      if (postEditandoId !== null) {
        await editarPost(
          postEditandoId,
          usuario.id,
          textoNovo.trim() || 'Nova publicação',
          categoriaSelecionada,
          arquivos,
          removerImagensAtuais,
        );
      } else {
        await criarPost(usuario.id, textoNovo.trim() || 'Nova publicação', categoriaSelecionada, arquivos);
      }

      fecharModal();
      carregarPosts();
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Nao foi possivel publicar.');
    } finally {
      setPublicando(false);
    }
  };

  const handleCurtir = async (postId: number) => {
    if (!usuario) {
      Alert.alert('Login necessario', 'Faca login para curtir um post.');
      return;
    }

    try {
      const resultado = await alternarCurtida(postId, usuario.id);
      setPosts((anterior) =>
        anterior.map((post) =>
          post.id === postId
            ? {
                ...post,
                curtidas: resultado.curtidas,
                curtido_por_mim: resultado.curtido,
              }
            : post,
        ),
      );
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Nao foi possivel curtir este post.');
    }
  };

  const enviarComentario = async (postId: number) => {
    if (!usuario) {
      Alert.alert('Login necessario', 'Faca login para comentar.');
      return;
    }

    const texto = (comentariosDigitados[postId] || '').trim();
    if (!texto) {
      return;
    }

    try {
      const comentario = await criarComentario(postId, usuario.id, texto);

      setComentariosPorPost((anterior) => ({
        ...anterior,
        [postId]: [...(anterior[postId] || []), comentario],
      }));

      setPosts((anterior) =>
        anterior.map((post) =>
          post.id === postId
            ? { ...post, comentarios: post.comentarios + 1 }
            : post,
        ),
      );

      setComentariosDigitados((anterior) => ({
        ...anterior,
        [postId]: '',
      }));
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Nao foi possivel comentar.');
    }
  };

  const handleExcluirPost = async (postId: number) => {
    if (!usuario) {
      Alert.alert('Login necessario', 'Faca login para excluir um post.');
      return;
    }

    Alert.alert(
      'Excluir post',
      'Tem certeza que deseja excluir este post?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarPost(postId, usuario.id);
              setPosts((anterior) => anterior.filter((post) => post.id !== postId));
              setComentariosPorPost((anterior) => {
                const copia = { ...anterior };
                delete copia[postId];
                return copia;
              });
            } catch (error) {
              Alert.alert('Erro', error instanceof Error ? error.message : 'Nao foi possivel excluir o post.');
            }
          },
        },
      ],
    );
  };

  const handleExcluirComentario = async (postId: number, comentarioId: number) => {
    if (!usuario) {
      Alert.alert('Login necessario', 'Faca login para excluir um comentario.');
      return;
    }

    Alert.alert(
      'Excluir comentário',
      'Tem certeza que deseja excluir este comentário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarComentario(postId, comentarioId, usuario.id);
              setComentariosPorPost((anterior) => ({
                ...anterior,
                [postId]: (anterior[postId] || []).filter((comentario) => comentario.id !== comentarioId),
              }));
              setPosts((anterior) =>
                anterior.map((post) =>
                  post.id === postId
                    ? { ...post, comentarios: Math.max(0, post.comentarios - 1) }
                    : post,
                ),
              );
            } catch (error) {
              Alert.alert('Erro', error instanceof Error ? error.message : 'Nao foi possivel excluir o comentario.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={style.scrollView}
      contentContainerStyle={style.container}
      showsVerticalScrollIndicator
    >
      <Pressable
        style={[style.newPostButton, !usuario && { opacity: 0.6 }]}
        onPress={abrirModalNovoPost}
      >
        <Text style={style.newPostButtonText}>{usuario ? '+ Novo post' : 'Faça login para postar'}</Text>
      </Pressable>
      {carregando && <ActivityIndicator size="large" color="#fff" />}
      {erro && <Text style={style.message}>{erro}</Text>}
      {!carregando && !erro && posts.map((post) => (
        <View key={post.id} style={style.post}>
          <Text style={style.author}>{post.nome || post.arroba}</Text>
          <Text style={style.handle}>{post.arroba}</Text>
          <Text style={style.text}>{post.texto}</Text>
          {post.arquivos
            .filter((arquivo) => arquivo.tipo !== 'audio')
            .map((arquivo) => (
              <Image
                key={arquivo.id}
                source={{ uri: arquivo.url }}
                style={style.postImage}
              />
            ))}

          <View style={style.actionsRow}>
            <Pressable
              onPress={() => handleCurtir(post.id)}
              style={[style.actionButton, post.curtido_por_mim && style.actionButtonActive]}
            >
              <Text style={[style.actionButtonText, post.curtido_por_mim && style.actionButtonTextActive]}>
                {post.curtido_por_mim ? 'Curtido' : 'Curtir'}
              </Text>
            </Pressable>
            <Text style={style.likes}>{post.curtidas} curtidas</Text>
          </View>

          <Text style={style.commentsCount}>{post.comentarios} comentários</Text>

          {(comentariosPorPost[post.id] || []).length > 0 && (
            <View style={style.commentsBox}>
              {(comentariosPorPost[post.id] || []).map((comentario) => (
                <View key={comentario.id} style={style.commentItem}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={style.commentAuthor}>{comentario.nome || comentario.arroba}</Text>
                    {usuario && usuario.id === comentario.usuario_id && (
                      <Pressable onPress={() => handleExcluirComentario(post.id, comentario.id)}>
                        <Text style={{ color: '#991b1b', fontWeight: '700' }}>Excluir</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={style.commentText}>{comentario.comentario}</Text>
                </View>
              ))}
            </View>
          )}

          {usuario ? (
            <View style={style.commentInputRow}>
              <TextInput
                value={comentariosDigitados[post.id] || ''}
                onChangeText={(texto) =>
                  setComentariosDigitados((anterior) => ({
                    ...anterior,
                    [post.id]: texto,
                  }))
                }
                placeholder="Escreva um comentário..."
                style={style.commentInput}
              />
              <Pressable onPress={() => enviarComentario(post.id)} style={style.commentButton}>
                <Text style={style.commentButtonText}>Enviar</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={style.loginHint}>Faça login para comentar.</Text>
          )}

          {usuario && usuario.id === post.usuario_id && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Pressable
                onPress={() => abrirModalEdicao(post)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: '#dbeafe',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#1e3a8a', fontWeight: '700' }}>Editar</Text>
              </Pressable>
              <Pressable
                onPress={() => handleExcluirPost(post.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: '#fee2e2',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#991b1b', fontWeight: '700' }}>Excluir</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}
      <Modal visible={modalAberto} transparent animationType="slide" onRequestClose={fecharModal}>
        <View style={style.modalBackdrop}>
          <View style={style.modalBox}>
            <Text style={style.modalTitle}>{postEditandoId !== null ? 'Editar post' : 'Novo post'}</Text>
            <TextInput
              value={textoNovo}
              onChangeText={setTextoNovo}
              placeholder="Escreva uma legenda..."
              multiline
              style={style.postInput}
            />
            {postEditando && postEditando.arquivos.length > 0 && (
              <Pressable
                onPress={() => {
                  setRemoverImagensAtuais(true);
                  setImagensNovas([]);
                }}
                style={{
                  marginTop: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: '#fee2e2',
                  borderWidth: 1,
                  borderColor: '#fca5a5',
                }}
              >
                <Text style={{ color: '#991b1b', fontWeight: '700', textAlign: 'center' }}>
                  Remover imagens do post
                </Text>
              </Pressable>
            )}
            <Text style={{ color: '#1f2937', fontWeight: '700', marginTop: 12 }}>Aba do post</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {([
                { value: 'arte', label: 'Artes' },
                { value: 'animacao', label: 'Animações' },
                { value: 'wip', label: 'Wips' },
              ] as const).map((opcao) => (
                <Pressable
                  key={opcao.value}
                  onPress={() => setCategoriaSelecionada(opcao.value)}
                  style={{
                    borderWidth: 1,
                    borderColor: categoriaSelecionada === opcao.value ? '#2563eb' : '#cbd5e1',
                    backgroundColor: categoriaSelecionada === opcao.value ? '#dbeafe' : '#f8fafc',
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: '#1f2937', fontWeight: '600' }}>{opcao.label}</Text>
                </Pressable>
              ))}
            </View>
            {imagensNovas.length > 0 && (
              <View style={{ gap: 8, marginTop: 12 }}>
                {imagensNovas.map((imagem, index) => (
                  <Image
                    key={`${imagem.uri}-${index}`}
                    source={{ uri: imagem.uri }}
                    style={style.previewImage}
                  />
                ))}
              </View>
            )}
            <Pressable style={style.secondaryButton} onPress={escolherImagem}>
              <Text style={style.secondaryButtonText}>{imagensNovas.length > 0 ? 'Trocar imagens' : 'Escolher imagens'}</Text>
            </Pressable>
            <View style={style.modalActions}>
              <Pressable onPress={fecharModal} style={style.cancelButton}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable onPress={publicar} disabled={publicando} style={style.publishButton}>
                <Text style={style.publishButtonText}>{publicando ? 'Salvando...' : postEditandoId !== null ? 'Salvar' : 'Publicar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
