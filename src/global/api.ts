import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

function obterUrlDaApi(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';
}

export const API_URL = obterUrlDaApi();

export type Usuario = {
  id: number;
  arroba: string;
  email: string;
  nome: string | null;
  bio: string | null;
  foto_url: string | null;
};

export type ArquivoPost = {
  id: number;
  tipo: 'imagem' | 'video' | 'audio';
  url: string;
};

export type Comentario = {
  id: number;
  post_id: number;
  usuario_id: number;
  comentario_pai_id: number | null;
  comentario: string;
  criado_em: string;
  arroba: string;
  nome: string | null;
  curtidas: number;
  curtido_por_mim: boolean;
};

export type Notificacao = {
  id: number;
  tipo: 'curtida' | 'curtida_comentario' | 'comentario';
  usuario_origem_id: number | null;
  post_id: number | null;
  comentario_id: number | null;
  enviado_em: string;
  lida: boolean;
  origem_arroba: string | null;
  origem_nome: string | null;
  post_texto: string | null;
  comentario_texto: string | null;
};

export type Post = {
  id: number;
  usuario_id: number;
  texto: string;
  criado_em: string;
  arroba: string;
  categoria: 'arte' | 'animacao' | 'wip';
  nome: string | null;
  foto_url: string | null;
  curtidas: number;
  comentarios: number;
  curtido_por_mim: boolean;
  arquivos: ArquivoPost[];
};

export async function atualizarPerfil(
  usuarioId: number,
  dados: { bio?: string | null; nome?: string | null },
): Promise<Usuario> {
  const response = await fetch(`${API_URL}/usuarios/${usuarioId}/perfil`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }

  const data: { usuario: Usuario } = await response.json();
  return data.usuario;
}

async function lerErro(response: Response) {
  const texto = await response.text().catch(() => '');

  if (!texto) {
    return 'Nao foi possivel completar a operacao.';
  }

  try {
    const resposta = JSON.parse(texto);
    return resposta?.error || texto;
  } catch {
    return texto;
  }
}

export async function salvarPushToken(usuarioId: number, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/usuarios/${usuarioId}/push-token`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }
}

export async function fazerLogin(email: string, senha: string): Promise<Usuario> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }

  const data: { usuario: Usuario } = await response.json();
  return data.usuario;
}

export async function cadastrarUsuario(dados: {
  nome: string;
  arroba: string;
  email: string;
  senha: string;
}): Promise<Usuario> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }

  const data: { usuario: Usuario } = await response.json();
  return data.usuario;
}

export async function listarPosts(categoria?: 'arte' | 'animacao' | 'wip', usuarioId?: number): Promise<Post[]> {
  const params = new URLSearchParams();

  if (categoria) {
    params.set('categoria', categoria);
  }

  if (usuarioId) {
    params.set('usuario_id', String(usuarioId));
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_URL}/posts${query}`);

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os posts.');
  }

  const data: { posts: Post[] } = await response.json();

  return data.posts.map((post) => ({
    ...post,
    curtidas: Number(post.curtidas || 0),
    comentarios: Number(post.comentarios || 0),
    curtido_por_mim: Boolean(post.curtido_por_mim),
  }));
}

export async function listarComentarios(postId: number, usuarioId?: number): Promise<Comentario[]> {
  const query = usuarioId ? `?usuario_id=${usuarioId}` : '';
  const response = await fetch(`${API_URL}/posts/${postId}/comentarios${query}`);

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os comentarios.');
  }

  const data: { comentarios: Comentario[] } = await response.json();
  return data.comentarios;
}

export async function criarComentario(
  postId: number,
  usuarioId: number,
  comentario: string,
  comentarioPaiId?: number | null,
): Promise<Comentario> {
  const response = await fetch(`${API_URL}/posts/${postId}/comentarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: usuarioId,
      comentario,
      comentario_pai_id: comentarioPaiId ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }

  const data: { comentario: Comentario } = await response.json();
  return data.comentario;
}

export async function alternarCurtida(postId: number, usuarioId: number): Promise<{ curtidas: number; curtido: boolean }> {
  const response = await fetch(`${API_URL}/posts/${postId}/curtir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }

  return response.json();
}

export async function alternarCurtidaComentario(
  comentarioId: number,
  usuarioId: number,
): Promise<{ curtidas: number; curtido: boolean }> {
  const response = await fetch(`${API_URL}/comentarios/${comentarioId}/curtir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }

  return response.json();
}

export async function listarNotificacoes(
  usuarioId: number,
): Promise<{ notificacoes: Notificacao[]; naoLidas: number }> {
  const response = await fetch(`${API_URL}/usuarios/${usuarioId}/notificacoes`);
  if (!response.ok) {
    throw new Error(await lerErro(response));
  }

  const data: { notificacoes: Notificacao[]; nao_lidas: number } = await response.json();
  return { notificacoes: data.notificacoes, naoLidas: Number(data.nao_lidas || 0) };
}

export async function marcarNotificacaoComoLida(notificacaoId: number, usuarioId: number): Promise<void> {
  const response = await fetch(`${API_URL}/notificacoes/${notificacaoId}/lida`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }
}

export async function marcarTodasNotificacoesComoLidas(usuarioId: number): Promise<void> {
  const response = await fetch(`${API_URL}/usuarios/${usuarioId}/notificacoes/lidas`, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }
}

export async function deletarPost(postId: number, usuarioId: number): Promise<void> {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }
}

export async function deletarComentario(postId: number, comentarioId: number, usuarioId: number): Promise<void> {
  const response = await fetch(`${API_URL}/posts/${postId}/comentarios/${comentarioId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }
}

export async function enviarImagem(uri: string, nome = 'imagem.jpg', tipo = 'image/jpeg') {
  const response = await FileSystem.uploadAsync(`${API_URL}/uploads`, uri, {
    fieldName: 'file',
    mimeType: tipo,
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
  });

  if (response.status !== 201) {
    throw new Error(response.body || 'Nao foi possivel enviar a imagem.');
  }

  return JSON.parse(response.body || '{}') as Promise<{ url: string; tipo: 'imagem' }>;
}

export async function criarPost(
  usuarioId: number,
  texto: string,
  categoria: 'arte' | 'animacao' | 'wip',
  arquivos: { url: string; tipo: 'imagem' }[],
) {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: usuarioId,
      texto,
      categoria,
      arquivos,
    }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }
}

export async function editarPost(
  postId: number,
  usuarioId: number,
  texto: string,
  categoria: 'arte' | 'animacao' | 'wip',
  arquivos: { url: string; tipo: 'imagem' }[],
  removerImagensAtuais = false,
) {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: usuarioId,
      texto,
      categoria,
      arquivos,
      remover_imagens_atuais: removerImagensAtuais,
    }),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }
}
