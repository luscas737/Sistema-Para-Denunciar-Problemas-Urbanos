import dataSource from '../database/data-source';

async function main() {
  const ds = dataSource;
  if (!ds.isInitialized) {
    await ds.initialize();
  }
  const qr = ds.createQueryRunner();

  try {
    console.log('=== Iniciando seed ===');

    // 1. Setores
    const setorId1 = '11111111-1111-1111-1111-111111111001';
    const setorId2 = '22222222-2222-2222-2222-222222222002';
    await qr.query(
      `INSERT INTO "setores" ("id", "nome", "descricao", "email", "ativo", "criadoEm", "atualizadoEm") VALUES
        ($1, 'Obras e Viação', 'Buracos, calçadas e sinalização', 'obras@prefeitura.gov.br', 1, datetime('now'), datetime('now')),
        ($2, 'Iluminação Pública', 'Lâmpadas quebradas e postes danificados', 'iluminacao@prefeitura.gov.br', 1, datetime('now'), datetime('now'))`,
      [setorId1, setorId2],
    );
    console.log('Setores criados.');

    // 2. Categorias
    const catBuracoId = 'aaaaaaaa-0000-0000-0000-000000000001';
    const catPosteId = 'bbbbbbbb-0000-0000-0000-000000000002';
    const catLixoId = 'cccccccc-0000-0000-0000-000000000003';
    await qr.query(
      `INSERT INTO "categorias" ("id", "nome", "descricao", "ativo", "criadoEm", "atualizadoEm") VALUES
        ($1, 'buraco', 'Buracos em vias públicas', 1, datetime('now'), datetime('now')),
        ($2, 'poste', 'Problemas em postes de iluminação', 1, datetime('now'), datetime('now')),
        ($3, 'lixo', 'Acúmulo de lixo e entulho', 1, datetime('now'), datetime('now'))`,
      [catBuracoId, catPosteId, catLixoId],
    );
    console.log('Categorias criadas.');

    // 3. Usuários
    const cidadaoId = '33333333-3333-3333-3333-333333333003';
    const atendenteId = '44444444-4444-4444-4444-444444444004';
    const adminId = '55555555-5555-5555-5555-555555555005';
    await qr.query(
      `INSERT INTO "usuarios" ("id", "nome", "email", "telefone", "ativo", "cpf", "bairro", "criadoEm", "atualizadoEm", "tipo", "matricula", "setorId", "nivelAcesso") VALUES
        ($1, 'Maria Silva', 'maria@email.com', '11999999999', 1, '123.456.789-00', 'Centro', datetime('now'), datetime('now'), 'cidadao', NULL, NULL, NULL),
        ($2, 'João Atendente', 'joao@prefeitura.gov.br', '11988888888', 1, NULL, NULL, datetime('now'), datetime('now'), 'atendente', 'MAT-001', $3, NULL),
        ($3, 'Ana Admin', 'ana@prefeitura.gov.br', '11977777777', 1, NULL, NULL, datetime('now'), datetime('now'), 'administrador', NULL, NULL, 1)`,
      [cidadaoId, atendenteId, setorId1],
    );
    console.log('Usuários criados.');

    // 4. Denúncias (uma com cidadão, outra anônima)
    const denunciaId1 = '66666666-6666-6666-6666-666666666006';
    const denunciaId2 = '77777777-7777-7777-7777-777777777007';
    await qr.query(
      `INSERT INTO "denuncias" ("id", "titulo", "descricao", "categoria", "latitude", "longitude", "status", "cidadaoId", "setorAtualId", "arquivada", "arquivadaEm", "criadoEm", "atualizadoEm") VALUES
        ($1, 'Buraco na Rua das Flores', 'Buraco grande em frente ao número 120, causando risco a veículos.', 'buraco', -8.9016, -36.4926, 'recebida', $2, NULL, 0, NULL, datetime('now'), datetime('now')),
        ($3, 'Poste quebrado na Avenida Central', 'Poste de iluminação com fios expostos, perigoso à noite.', 'poste', -8.8954, -36.5012, 'encaminhada', NULL, $4, 0, NULL, datetime('now'), datetime('now'))`,
      [denunciaId1, cidadaoId, denunciaId2, setorId2],
    );
    console.log('Denúncias criadas.');

    // 5. N-N: DenunciaCategoria (duas categorias na primeira denúncia, uma na segunda)
    await qr.query(
      `INSERT INTO "denuncias_categorias" ("id", "denunciaId", "categoriaId", "dataVinculacao", "ehPrincipal") VALUES
        ('d1c1-0000-0000-0000-000000000001', $1, $2, datetime('now'), 1),
        ('d1c2-0000-0000-0000-000000000002', $1, $3, datetime('now'), 0),
        ('d2c1-0000-0000-0000-000000000003', $4, $5, datetime('now'), 1)`,
      [denunciaId1, catBuracoId, catLixoId, denunciaId2, catPosteId],
    );
    console.log('Vínculos denúncia-categoria criados (N-N).');

    // 6. Anexo na primeira denúncia
    await qr.query(
      `INSERT INTO "anexos" ("id", "denunciaId", "url", "tipo", "descricao", "enviadoPorId", "criadoEm") VALUES
        ('88888888-8888-8888-8888-888888888008', $1, 'https://storage.example.com/fotos/buraco-flores.jpg', 'imagem', 'Foto do buraco na Rua das Flores', $2, datetime('now'))`,
      [denunciaId1, cidadaoId],
    );
    console.log('Anexo criado.');

    // 7. Encaminhamento: denuncia 2 → setor 2 (Iluminação)
    const encId = '99999999-9999-9999-9999-999999999009';
    await qr.query(
      `INSERT INTO "encaminhamentos" ("id", "denunciaId", "setorDestinoId", "enviadoPorId", "observacao", "dataEncaminhamento", "aceite") VALUES
        ($1, $2, $3, $4, 'Solicito vistoria urgente em poste com fios expostos.', datetime('now'), NULL)`,
      [encId, denunciaId2, setorId2, atendenteId],
    );
    console.log('Encaminhamento criado.');

    // 8. Histórico de status da denúncia 2 (recebida → encaminhada)
    await qr.query(
      `INSERT INTO "historico_status" ("id", "denunciaId", "statusAnterior", "statusAtual", "alteradoPorId", "comentario", "dataAlteracao") VALUES
        ('h1-0000-0000-0000-000000000001', $1, NULL, 'recebida', NULL, 'Denúncia registrada.', datetime('now')),
        ('h2-0000-0000-0000-000000000002', $1, 'recebida', 'encaminhada', $2, 'Encaminhado para o setor de Iluminação Pública.', datetime('now'))`,
      [denunciaId2, atendenteId],
    );
    console.log('Histórico de status criado.');

    console.log('=== Seed concluído com sucesso ===');
  } catch (err) {
    console.error('Erro no seed:', err);
    process.exit(1);
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

main();
