CREATE DATABASE IF NOT EXISTS artblock;
USE artblock;

CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    arroba VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);


CREATE TABLE perfis (
    usuario_id BIGINT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    bio VARCHAR(300),
    foto_url TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE seguidores (
    seguidor_id BIGINT NOT NULL,
    seguido_id BIGINT NOT NULL,
    PRIMARY KEY (seguidor_id, seguido_id),
    FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (seguido_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_nao_seguir_si_mesmo CHECK (seguidor_id <> seguido_id)
);

CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    texto TEXT NOT NULL,
    categoria ENUM('arte', 'animacao', 'wip') NOT NULL DEFAULT 'arte',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE arquivos_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    tipo ENUM('imagem', 'video', 'audio') NOT NULL,
    url TEXT NOT NULL,
    ordem INT NOT NULL DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE curtidas (
    usuario_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    curtido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, post_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE comentarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    comentario_pai_id BIGINT NULL,
    comentario TEXT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_pai_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

CREATE TABLE notificacoes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    usuario_origem_id BIGINT,
    post_id BIGINT,
    comentario_id BIGINT,
    enviado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_origem_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

CREATE TABLE conversas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participantes_conversa (
    conversa_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    PRIMARY KEY (conversa_id, usuario_id),
    FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE mensagens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversa_id BIGINT NOT NULL,
    remetente_id BIGINT NOT NULL,
    mensagem TEXT NOT NULL,
    enviada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_usuario ON posts(usuario_id);
CREATE INDEX idx_posts_data ON posts(criado_em DESC);
CREATE INDEX idx_seguidores_seguidor ON seguidores(seguidor_id);
CREATE INDEX idx_seguidores_seguido ON seguidores(seguido_id);
CREATE INDEX idx_curtidas_post ON curtidas(post_id);
CREATE INDEX idx_comentarios_post ON comentarios(post_id);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_mensagens_conversa ON mensagens(conversa_id, enviada_em);



INSERT INTO usuarios (id, arroba, email, senha) VALUES
(1, '@lino', 'mulino@email.com', '$2a$12$eImiTXuWVxfM37uY4JANjOL.g'),
(2, '@gigi', 'gigimaria@email.com', '$2a$12$eImiTXuWVxfM37uY4JANjOL.g'),
(3, '@elmosco69', 'pneuscontraataca@email.com', '$2a$12$eImiTXuWVxfM37uY4JANjOL.g');

INSERT INTO perfis (usuario_id, nome, bio) VALUES
(1, 'Lino', 'Amo criar meus personagens!'),
(2, 'Gigi', 'Tento criar os meus personagens'),
(3, 'El mosco', 'gamedev e artista');

INSERT INTO seguidores (seguidor_id, seguido_id) VALUES
(1, 2), 
(3, 1);

INSERT INTO posts (id, usuario_id, texto, categoria) VALUES
(1, 2, 'Acabei de finalizar meu novo desenho digital! O que acharam?', 'arte'),
(2, 1, 'Procurando alguém pra jogar coop hoje à noite, chama aí!', 'animacao'),
(3, 3, 'Trabalho de banco de dados finalmente entregue! 🚀', 'arte'),
(4, 1, 'Preguiça de terminar o trabalho', 'arte');

INSERT INTO curtidas (usuario_id, post_id) VALUES
(1, 1), 
(3, 1),
(2, 2); 

INSERT INTO comentarios (id, post_id, usuario_id, comentario_pai_id, comentario) VALUES
(1, 1, 1, NULL, 'Ficou MANEIRO! Gostei demais das cores.'),
(2, 1, 2, 1, 'Valeu Lino! Deu um trabalhão pra acertar a paleta.');

   