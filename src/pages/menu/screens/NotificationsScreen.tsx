import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  listarNotificacoes,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  Notificacao,
  Usuario,
} from '../../../global/api';

function textoNotificacao(notificacao: Notificacao): string {
  const origem = notificacao.origem_nome || notificacao.origem_arroba || 'Alguem';

  if (notificacao.tipo === 'comentario') {
    return `${origem} comentou no seu post`;
  }
  if (notificacao.tipo === 'curtida_comentario') {
    return `${origem} curtiu seu comentário`;
  }
  return `${origem} curtiu seu post`;
}

export default function NotificationsScreen({
  usuario,
  onUnreadCountChange,
}: {
  usuario: Usuario;
  onUnreadCountChange: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resultado = await listarNotificacoes(usuario.id);
      setNotificacoes(resultado.notificacoes);
      onUnreadCountChange(resultado.naoLidas);
      setErro(null);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar as notificacoes.');
    } finally {
      setCarregando(false);
    }
  }, [onUnreadCountChange, usuario.id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const marcarComoLida = async (notificacao: Notificacao) => {
    if (notificacao.lida) return;

    try {
      await marcarNotificacaoComoLida(notificacao.id, usuario.id);
      setNotificacoes((anteriores) =>
        anteriores.map((item) => item.id === notificacao.id ? { ...item, lida: true } : item),
      );
      onUnreadCountChange((count) => Math.max(0, count - 1));
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Nao foi possivel atualizar a notificacao.');
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await marcarTodasNotificacoesComoLidas(usuario.id);
      setNotificacoes((anteriores) => anteriores.map((item) => ({ ...item, lida: true })));
      onUnreadCountChange(0);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Nao foi possivel atualizar as notificacoes.');
    }
  };

  const temNaoLidas = notificacoes.some((notificacao) => !notificacao.lida);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações</Text>
        <Pressable onPress={carregar} accessibilityRole="button">
          <Text style={styles.headerAction}>Atualizar</Text>
        </Pressable>
      </View>
      {temNaoLidas && (
        <Pressable onPress={marcarTodasComoLidas} style={styles.markAllButton} accessibilityRole="button">
          <Text style={styles.markAllText}>Marcar todas como lidas</Text>
        </Pressable>
      )}
      {carregando ? (
        <ActivityIndicator size="large" color="#fff" style={styles.loading} />
      ) : erro ? (
        <Text style={styles.emptyText}>{erro}</Text>
      ) : notificacoes.length === 0 ? (
        <Text style={styles.emptyText}>Você ainda não recebeu notificações.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {notificacoes.map((notificacao) => (
            <Pressable
              key={notificacao.id}
              onPress={() => marcarComoLida(notificacao)}
              style={[styles.item, !notificacao.lida && styles.unreadItem]}
              accessibilityRole="button"
              accessibilityLabel={textoNotificacao(notificacao)}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.message}>{textoNotificacao(notificacao)}</Text>
                {!notificacao.lida && <View style={styles.unreadDot} />}
              </View>
              {(notificacao.comentario_texto || notificacao.post_texto) && (
                <Text style={styles.preview} numberOfLines={2}>
                  {notificacao.comentario_texto || notificacao.post_texto}
                </Text>
              )}
              <Text style={styles.date}>
                {new Date(notificacao.enviado_em).toLocaleString('pt-BR')}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8a9eb8',
    flex: 1,
    paddingTop: 112,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  headerAction: {
    color: '#fff',
    fontWeight: '700',
  },
  markAllButton: {
    alignSelf: 'flex-end',
    marginHorizontal: 18,
    marginBottom: 10,
  },
  markAllText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 18,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  unreadItem: {
    borderLeftColor: '#2563eb',
    borderLeftWidth: 4,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  message: {
    color: '#1f2937',
    flex: 1,
    fontWeight: '700',
  },
  unreadDot: {
    backgroundColor: '#2563eb',
    borderRadius: 5,
    height: 10,
    marginLeft: 8,
    width: 10,
  },
  preview: {
    color: '#4b5563',
    marginTop: 6,
  },
  date: {
    color: '#718096',
    fontSize: 12,
    marginTop: 8,
  },
  loading: {
    marginTop: 32,
  },
  emptyText: {
    color: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    textAlign: 'center',
  },
});
