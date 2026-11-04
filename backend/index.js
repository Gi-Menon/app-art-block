const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3000;
const uploadDirectory = path.join(__dirname, 'uploads');
const feedImageDirectory = path.join(__dirname, '..', 'src', 'pages', 'feed', 'imagens');

fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname) || '.jpg';
      callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
  }),
  fileFilter: (_request, file, callback) => {
    callback(null, file.mimetype.startsWith('image/'));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json());
app.use((request, _response, next) => {
  if (request.path !== '/' && request.path.endsWith('/')) {
    request.url = request.url.replace(/\/+$/, '');
  }
  next();
});
app.use('/uploads', express.static(uploadDirectory));
app.use('/feed-images', express.static(feedImageDirectory));

async function garantirColunasNotificacoes() {
  const [usuarios] = await pool.query("SHOW COLUMNS FROM usuarios LIKE 'expo_push_token'");
  if (usuarios.length === 0) {
    await pool.execute('ALTER TABLE usuarios ADD COLUMN expo_push_token TEXT NULL');
  }

  const [notificacoes] = await pool.query("SHOW COLUMNS FROM notificacoes LIKE 'lida'");
  if (notificacoes.length === 0) {
    await pool.execute('ALTER TABLE notificacoes ADD COLUMN lida BOOLEAN NOT NULL DEFAULT FALSE');
  }

  const desenhosExemplo = [
    [1, 'miku.png'],
    [2, 'tetoris-kasane-teto.gif'],
    [3, 'banco.png'],
    [4, 'preguica.png'],
  ];

  for (const [postId, url] of desenhosExemplo) {
    await pool.execute(
      `INSERT INTO arquivos_post (post_id, tipo, url, ordem)
       SELECT ?, 'imagem', ?, 0
       WHERE EXISTS (SELECT 1 FROM posts WHERE id = ?)
         AND NOT EXISTS (
           SELECT 1 FROM arquivos_post WHERE post_id = ? AND tipo = 'imagem'
         )`,
      [postId, url, postId, postId],
    );
  }
}

function getPublicFileUrl(request, fileUrl) {
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const fileName = path.basename(fileUrl);
  const route = fileUrl.includes('/videos/') ? 'feed-videos' : 'feed-images';
  return `${request.protocol}://${request.get('host')}/${route}/${encodeURIComponent(fileName)}`;
}

async function enviarPushExpo(usuarioId, notification) {
  const [usuarios] = await pool.execute(
    'SELECT expo_push_token FROM usuarios WHERE id = ?',
    [usuarioId],
  );
  const token = usuarios[0]?.expo_push_token;

  if (!token || !token.startsWith('ExponentPushToken[')) {
    return;
  }

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ to: token, ...notification }),
  });
}

app.get('/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error(error);
    response.status(503).json({ ok: false, database: 'disconnected' });
  }
});

app.post('/auth/login', async (request, response) => {
  const { email, senha } = request.body;

  if (!email || !senha) {
    return response.status(400).json({ error: 'Email e senha sao obrigatorios.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.arroba, u.email, u.senha, p.nome, p.bio, p.foto_url
       FROM usuarios u
       LEFT JOIN perfis p ON p.usuario_id = u.id
       WHERE u.email = ?`,
      [email],
    );

    const usuario = rows[0];
    const senhaValida = usuario && await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return response.status(401).json({ error: 'Email ou senha invalidos.' });
    }

    delete usuario.senha;
    return response.json({ usuario });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      error: error.message || 'Nao foi possivel fazer login.',
    });
  }
});

app.post('/auth/register', async (request, response) => {
  const { nome, arroba, email, senha } = request.body;

  if (!nome || !arroba || !email || !senha) {
    return response.status(400).json({ error: 'Nome, arroba, email e senha sao obrigatorios.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 12);

    const [resultado] = await pool.execute(
      'INSERT INTO usuarios (arroba, email, senha) VALUES (?, ?, ?)',
      [arroba, email, senhaHash],
    );

    await pool.execute(
      'INSERT INTO perfis (usuario_id, nome) VALUES (?, ?)',
      [resultado.insertId, nome],
    );

    const [rows] = await pool.execute(
      `SELECT u.id, u.arroba, u.email, p.nome, p.bio, p.foto_url
       FROM usuarios u
       LEFT JOIN perfis p ON p.usuario_id = u.id
       WHERE u.id = ?`,
      [resultado.insertId],
    );

    return response.status(201).json({ usuario: rows[0] });
  } catch (error) {
    console.error(error);

    if (error && error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({ error: 'Email ou arroba ja cadastrados.' });
    }

    return response.status(500).json({
      error: error.message || 'Nao foi possivel criar a conta.',
    });
  }
});

app.get(['/usuarios/:id/perfil', '/usuarios/:id/perfil/'], async (request, response) => {
  const { id } = request.params;

  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.arroba, u.email, p.nome, p.bio, p.foto_url
       FROM usuarios u
       LEFT JOIN perfis p ON p.usuario_id = u.id
       WHERE u.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return response.status(404).json({ error: 'Usuario nao encontrado.' });
    }

    return response.json({ usuario: rows[0] });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel carregar o perfil.' });
  }
});

app.put('/usuarios/:id/push-token', async (request, response) => {
  const { id } = request.params;
  const { token } = request.body;

  if (!token || !String(token).startsWith('ExponentPushToken[')) {
    return response.status(400).json({ error: 'Token de notificacao invalido.' });
  }

  try {
    await pool.execute('UPDATE usuarios SET expo_push_token = ? WHERE id = ?', [token, id]);
    return response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel registrar o token.' });
  }
});

app.put(['/usuarios/:id/perfil', '/usuarios/:id/perfil/'], async (request, response) => {
  const { id } = request.params;
  const { bio, nome } = request.body;

  if (bio === undefined && nome === undefined) {
    return response.status(400).json({ error: 'Informe bio ou nome para atualizar o perfil.' });
  }

  if (bio !== undefined && bio.length > 300) {
    return response.status(400).json({ error: 'A biografia deve ter no maximo 300 caracteres.' });
  }

  if (nome !== undefined && nome.length > 100) {
    return response.status(400).json({ error: 'O nome deve ter no maximo 100 caracteres.' });
  }

  try {
    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);

    if (usuarios.length === 0) {
      return response.status(404).json({ error: 'Usuario nao encontrado.' });
    }

    const [perfil] = await pool.execute('SELECT usuario_id FROM perfis WHERE usuario_id = ?', [id]);

    if (perfil.length === 0) {
      await pool.execute(
        'INSERT INTO perfis (usuario_id, nome, bio) VALUES (?, ?, ?)',
        [id, nome || '', bio || null],
      );
    } else {
      const atualizacoes = [];
      const valores = [];

      if (nome !== undefined) {
        atualizacoes.push('nome = ?');
        valores.push(nome || '');
      }

      if (bio !== undefined) {
        atualizacoes.push('bio = ?');
        valores.push(bio || null);
      }

      await pool.execute(
        `UPDATE perfis SET ${atualizacoes.join(', ')} WHERE usuario_id = ?`,
        [...valores, id],
      );
    }

    const [rows] = await pool.execute(
      `SELECT u.id, u.arroba, u.email, p.nome, p.bio, p.foto_url
       FROM usuarios u
       LEFT JOIN perfis p ON p.usuario_id = u.id
       WHERE u.id = ?`,
      [id],
    );

    return response.json({ usuario: rows[0] });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel atualizar o perfil.' });
  }
});

app.put('/posts/:id', async (request, response) => {
  const { id } = request.params;
  const {
    usuario_id,
    texto,
    categoria = 'arte',
    arquivos = [],
    remover_imagens_atuais = false,
  } = request.body;

  if (!usuario_id || !texto || !['arte', 'animacao', 'wip'].includes(categoria)) {
    return response.status(400).json({ error: 'usuario_id, texto e categoria sao obrigatorios.' });
  }

  if (!Array.isArray(arquivos) || arquivos.some((arquivo) => !arquivo.url)) {
    return response.status(400).json({ error: 'arquivos deve ser uma lista de URLs.' });
  }

  const conexao = await pool.getConnection();

  try {
    const [posts] = await conexao.execute(
      'SELECT usuario_id FROM posts WHERE id = ?',
      [id],
    );

    if (posts.length === 0) {
      return response.status(404).json({ error: 'Post nao encontrado.' });
    }

    if (posts[0].usuario_id !== Number(usuario_id)) {
      return response.status(403).json({ error: 'Voce nao pode editar este post.' });
    }

    await conexao.beginTransaction();

    await conexao.execute(
      'UPDATE posts SET texto = ?, categoria = ? WHERE id = ?',
      [texto, categoria, id],
    );

    if (remover_imagens_atuais || arquivos.length > 0) {
      await conexao.execute('DELETE FROM arquivos_post WHERE post_id = ?', [id]);
    }

    if (arquivos.length > 0) {
      for (const [ordem, arquivo] of arquivos.entries()) {
        const tipo = arquivo.tipo || 'imagem';

        if (!['imagem', 'video', 'audio'].includes(tipo)) {
          throw new Error('Tipo de arquivo invalido.');
        }

        await conexao.execute(
          'INSERT INTO arquivos_post (post_id, tipo, url, ordem) VALUES (?, ?, ?, ?)',
          [id, tipo, arquivo.url, ordem],
        );
      }
    }

    await conexao.commit();
    return response.json({ ok: true });
  } catch (error) {
    await conexao.rollback();
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel editar o post.' });
  } finally {
    conexao.release();
  }
});

app.delete('/posts/:id', async (request, response) => {
  const { id } = request.params;
  const { usuario_id } = request.body || {};

  if (!usuario_id) {
    return response.status(400).json({ error: 'usuario_id e obrigatorio.' });
  }

  try {
    const [posts] = await pool.execute('SELECT usuario_id FROM posts WHERE id = ?', [id]);

    if (posts.length === 0) {
      return response.status(404).json({ error: 'Post nao encontrado.' });
    }

    if (posts[0].usuario_id !== Number(usuario_id)) {
      return response.status(403).json({ error: 'Voce nao pode excluir este post.' });
    }

    await pool.execute('DELETE FROM posts WHERE id = ?', [id]);

    return response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel excluir o post.' });
  }
});

app.post('/uploads', upload.single('file'), (request, response) => {
  if (!request.file) {
    return response.status(400).json({ error: 'Envie uma imagem valida de ate 10 MB.' });
  }

  const host = request.get('host');
  return response.status(201).json({
    url: `http://${host}/uploads/${request.file.filename}`,
    tipo: 'imagem',
  });
});

app.post('/posts', async (request, response) => {
  const { usuario_id, texto, categoria = 'arte', arquivos = [] } = request.body;

  if (!usuario_id || !texto || !['arte', 'animacao', 'wip'].includes(categoria)) {
    return response.status(400).json({ error: 'usuario_id, texto e categoria sao obrigatorios.' });
  }

  if (!Array.isArray(arquivos) || arquivos.some((arquivo) => !arquivo.url)) {
    return response.status(400).json({ error: 'arquivos deve ser uma lista de URLs.' });
  }

  try {
    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [usuario_id]);

    if (usuarios.length === 0) {
      return response.status(401).json({ error: 'Usuario nao autenticado.' });
    }
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel validar o usuario.' });
  }

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [resultado] = await conexao.execute(
      'INSERT INTO posts (usuario_id, texto, categoria) VALUES (?, ?, ?)',
      [usuario_id, texto, categoria],
    );

    for (const [ordem, arquivo] of arquivos.entries()) {
      const tipo = arquivo.tipo || 'imagem';
      if (!['imagem', 'video', 'audio'].includes(tipo)) {
        throw new Error('Tipo de arquivo invalido.');
      }

      await conexao.execute(
        'INSERT INTO arquivos_post (post_id, tipo, url, ordem) VALUES (?, ?, ?, ?)',
        [resultado.insertId, tipo, arquivo.url, ordem],
      );
    }

    await conexao.commit();
    return response.status(201).json({ id: resultado.insertId });
  } catch (error) {
    await conexao.rollback();
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel criar o post.' });
  } finally {
    conexao.release();
  }
});

app.get('/posts', async (request, response) => {
  const categoria = request.query.categoria;
  const usuarioId = request.query.usuario_id ? Number(request.query.usuario_id) : null;

  if (categoria && !['arte', 'animacao', 'wip'].includes(categoria)) {
    return response.status(400).json({ error: 'Categoria invalida.' });
  }

  try {
    const [posts] = await pool.execute(
      `SELECT p.id, p.texto, p.criado_em, u.id AS usuario_id, u.arroba,
              p.categoria, pf.nome, pf.foto_url,
              (SELECT COUNT(*) FROM curtidas c WHERE c.post_id = p.id) AS curtidas,
              (SELECT COUNT(*) FROM comentarios cm WHERE cm.post_id = p.id) AS comentarios,
              (CASE
                WHEN ? IS NOT NULL AND EXISTS (
                  SELECT 1 FROM curtidas cu WHERE cu.post_id = p.id AND cu.usuario_id = ?
                ) THEN 1
                ELSE 0
              END) AS curtido_por_mim
       FROM posts p
       JOIN usuarios u ON u.id = p.usuario_id
       LEFT JOIN perfis pf ON pf.usuario_id = u.id
       WHERE (? IS NULL OR p.categoria = ?)
       ORDER BY p.criado_em DESC`,
      [usuarioId, usuarioId, categoria || null, categoria || null],
    );

    if (posts.length > 0) {
      const placeholders = posts.map(() => '?').join(',');
      const [arquivos] = await pool.execute(
        `SELECT post_id, id, tipo, url, ordem
         FROM arquivos_post
         WHERE post_id IN (${placeholders})
         ORDER BY ordem ASC, id ASC`,
        posts.map((post) => post.id),
      );

      const arquivosPorPost = new Map();
      for (const arquivo of arquivos) {
        const lista = arquivosPorPost.get(arquivo.post_id) || [];
        lista.push({
          id: arquivo.id,
          tipo: arquivo.tipo,
          url: getPublicFileUrl(request, arquivo.url),
        });
        arquivosPorPost.set(arquivo.post_id, lista);
      }

      for (const post of posts) {
        post.arquivos = arquivosPorPost.get(post.id) || [];
        post.curtidas = Number(post.curtidas || 0);
        post.comentarios = Number(post.comentarios || 0);
        post.curtido_por_mim = Boolean(post.curtido_por_mim);
      }
    }

    return response.json({ posts });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel carregar os posts.' });
  }
});

app.get('/posts/:id/comentarios', async (request, response) => {
  const { id } = request.params;

  try {
    const [comentarios] = await pool.execute(
      `SELECT c.id, c.post_id, c.usuario_id, c.comentario_pai_id, c.comentario, c.criado_em,
              u.arroba, pf.nome
       FROM comentarios c
       JOIN usuarios u ON u.id = c.usuario_id
       LEFT JOIN perfis pf ON pf.usuario_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.criado_em ASC, c.id ASC`,
      [id],
    );

    return response.json({ comentarios });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel carregar os comentarios.' });
  }
});

app.post('/posts/:id/comentarios', async (request, response) => {
  const { id } = request.params;
  const { usuario_id, comentario, comentario_pai_id = null } = request.body;

  if (!usuario_id || !comentario || !String(comentario).trim()) {
    return response.status(400).json({ error: 'usuario_id e comentario sao obrigatorios.' });
  }

  try {
    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [usuario_id]);
    if (usuarios.length === 0) {
      return response.status(401).json({ error: 'Usuario nao autenticado.' });
    }

    const [posts] = await pool.execute('SELECT id FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return response.status(404).json({ error: 'Post nao encontrado.' });
    }

    const comentarioTexto = String(comentario).trim();
    const [resultado] = await pool.execute(
      `INSERT INTO comentarios (post_id, usuario_id, comentario_pai_id, comentario)
       VALUES (?, ?, ?, ?)`,
      [id, usuario_id, comentario_pai_id, comentarioTexto],
    );

    const [destinos] = await pool.execute(
      `SELECT p.usuario_id AS dono_post, u.arroba AS origem
       FROM posts p JOIN usuarios u ON u.id = ? WHERE p.id = ?`,
      [usuario_id, id],
    );
    const donoPost = destinos[0]?.dono_post;
    const origem = destinos[0]?.origem || 'Alguem';

    if (donoPost && Number(donoPost) !== Number(usuario_id)) {
      await pool.execute(
        `INSERT INTO notificacoes (usuario_id, tipo, usuario_origem_id, post_id, comentario_id)
         VALUES (?, 'comentario', ?, ?, ?)`,
        [donoPost, usuario_id, id, resultado.insertId],
      );
      await enviarPushExpo(donoPost, {
        title: 'Novo comentario',
        body: `${origem} comentou na sua arte: ${comentarioTexto}`,
        data: { postId: Number(id), type: 'comentario' },
      }).catch((error) => console.error('Erro ao enviar push:', error));
    }

    const [comentarioCriado] = await pool.execute(
      `SELECT c.id, c.post_id, c.usuario_id, c.comentario_pai_id, c.comentario, c.criado_em,
              u.arroba, pf.nome
       FROM comentarios c
       JOIN usuarios u ON u.id = c.usuario_id
       LEFT JOIN perfis pf ON pf.usuario_id = u.id
       WHERE c.id = ?`,
      [resultado.insertId],
    );

    return response.status(201).json({ comentario: comentarioCriado[0] });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel criar o comentario.' });
  }
});

app.delete('/posts/:id/comentarios/:comentarioId', async (request, response) => {
  const { id, comentarioId } = request.params;
  const { usuario_id } = request.body || {};

  if (!usuario_id) {
    return response.status(400).json({ error: 'usuario_id e obrigatorio.' });
  }

  try {
    const [comentario] = await pool.execute(
      'SELECT usuario_id FROM comentarios WHERE id = ? AND post_id = ?',
      [comentarioId, id],
    );

    if (comentario.length === 0) {
      return response.status(404).json({ error: 'Comentario nao encontrado.' });
    }

    if (comentario[0].usuario_id !== Number(usuario_id)) {
      return response.status(403).json({ error: 'Voce nao pode excluir este comentario.' });
    }

    await pool.execute('DELETE FROM comentarios WHERE id = ? AND post_id = ?', [comentarioId, id]);

    return response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel excluir o comentario.' });
  }
});

app.post('/posts/:id/curtir', async (request, response) => {
  const { id } = request.params;
  const { usuario_id } = request.body;

  if (!usuario_id) {
    return response.status(400).json({ error: 'usuario_id e obrigatorio.' });
  }

  try {
    const [posts] = await pool.execute(
      `SELECT p.id, p.usuario_id AS dono_post, u.arroba AS origem
       FROM posts p JOIN usuarios u ON u.id = ? WHERE p.id = ?`,
      [usuario_id, id],
    );
    if (posts.length === 0) {
      return response.status(404).json({ error: 'Post nao encontrado.' });
    }

    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [usuario_id]);
    if (usuarios.length === 0) {
      return response.status(401).json({ error: 'Usuario nao autenticado.' });
    }

    const [curtidaExistente] = await pool.execute(
      'SELECT 1 FROM curtidas WHERE usuario_id = ? AND post_id = ?',
      [usuario_id, id],
    );

    if (curtidaExistente.length > 0) {
      await pool.execute(
        'DELETE FROM curtidas WHERE usuario_id = ? AND post_id = ?',
        [usuario_id, id],
      );
    } else {
      await pool.execute(
        'INSERT INTO curtidas (usuario_id, post_id) VALUES (?, ?)',
        [usuario_id, id],
      );

      const donoPost = posts[0]?.dono_post;
      const origem = posts[0]?.origem || 'Alguem';
      if (donoPost && Number(donoPost) !== Number(usuario_id)) {
        await pool.execute(
          `INSERT INTO notificacoes (usuario_id, tipo, usuario_origem_id, post_id)
           VALUES (?, 'curtida', ?, ?)`,
          [donoPost, usuario_id, id],
        );
        await enviarPushExpo(donoPost, {
          title: 'Nova curtida',
          body: `${origem} curtiu sua arte`,
          data: { postId: Number(id), type: 'curtida' },
        }).catch((error) => console.error('Erro ao enviar push:', error));
      }
    }

    const [resultado] = await pool.execute(
      'SELECT COUNT(*) AS curtidas FROM curtidas WHERE post_id = ?',
      [id],
    );

    return response.json({
      curtidas: Number(resultado[0].curtidas || 0),
      curtido: curtidaExistente.length === 0,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Nao foi possivel atualizar a curtida.' });
  }
});

app.listen(port, '0.0.0.0', async () => {
  try {
    await garantirColunasNotificacoes();
  } catch (error) {
    console.error('Erro ao preparar tabelas de notificacoes:', error);
  }
  console.log(`API Art-Block executando em http://localhost:${port}`);
});
