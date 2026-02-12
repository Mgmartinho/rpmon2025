// Sistema de permissões baseado em perfis

export const PERFIS = {
  DESENVOLVEDOR: "Desenvolvedor",
  VETERINARIO_ADMIN: "Veterinario Admin",
  VETERINARIO: "Veterinario",
  ENFERMEIRO_VETERINARIO: "Enfermeiro Veterinario",
  COORDENADOR_OPERACIONAL: "Coordenador Operacional",
  FERRADOR: "Ferrador",
  PAGADOR: "Pagador de cavalo",
  CARGA_HORARIA: 'Lancador de Carga Horaria',
  OBSERVACAO_COMPORTAMENTAL: 'Observacao Comportamental',
  CONSULTA: "Consulta",
  PENDENTE_APROVACAO: "Pendente de Aprovacao",
};

// Hierarquia de permissões (menor número = mais permissões)
export const NIVEL_PERMISSAO = {
  [PERFIS.DESENVOLVEDOR]: 0,
  [PERFIS.VETERINARIO_ADMIN]: 1,
  [PERFIS.VETERINARIO]: 2,
  [PERFIS.ENFERMEIRO_VETERINARIO]: 3,
  [PERFIS.COORDENADOR_OPERACIONAL]: 4,
  [PERFIS.FERRADOR]: 5,
  [PERFIS.PAGADOR]: 7,
  [PERFIS.CARGA_HORARIA]: 7,
  [PERFIS.OBSERVACAO_COMPORTAMENTAL]: 8,
  [PERFIS.CONSULTA]: 9,
  [PERFIS.PENDENTE_APROVACAO]: 99, // Sem acesso - aguardando aprovação
};

// Definição de permissões por perfil
export const PERMISSOES = {
  // Rotas públicas - todos têm acesso
  ROTA_HOME: [
    PERFIS.CONSULTA,
    PERFIS.PAGADOR,
    PERFIS.FERRADOR,
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
    PERFIS.ENFERMEIRO_VETERINARIO,
    PERFIS.COORDENADOR_OPERACIONAL,
    PERFIS.OBSERVACAO_COMPORTAMENTAL,
  ],

  // Dashboard/Listagem - Todos EXCETO Consulta
  VISUALIZAR_DASHBOARD: [
    PERFIS.CONSULTA,
    PERFIS.PAGADOR,
    PERFIS.FERRADOR,
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
    PERFIS.ENFERMEIRO_VETERINARIO,
    PERFIS.COORDENADOR_OPERACIONAL,
    PERFIS.OBSERVACAO_COMPORTAMENTAL,
    PERFIS.CARGA_HORARIA,
  ],

  // Estatísticas - Todos EXCETO Consulta
  VISUALIZAR_ESTATISTICAS: [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
    PERFIS.COORDENADOR_OPERACIONAL,
    PERFIS.OBSERVACAO_COMPORTAMENTAL,
  ],

  // Gestão de Solípedes
  GESTAO_SOLIPEDES: [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],
  
  CRIAR_SOLIPEDE: [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  EDITAR_SOLIPEDE: [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  EXCLUIR_SOLIPEDE: [
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  // Carga Horária - Visível para todos EXCETO Consulta e Ferrador
  ADMIN_CARGA_HORARIA: [
    PERFIS.PAGADOR,
    PERFIS.CARGA_HORARIA,
    PERFIS.OBSERVACAO_COMPORTAMENTAL,
    PERFIS.COORDENADOR_OPERACIONAL,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.VETERINARIO,
    PERFIS.DESENVOLVEDOR,
  ],

  ADICIONAR_HORAS: [
    PERFIS.PAGADOR,
    PERFIS.DESENVOLVEDOR,
    PERFIS.CARGA_HORARIA,
  ],

  // Ferradoria
  GESTAO_FERRAGEAMENTO: [
    PERFIS.FERRADOR,
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  CRIAR_FERRAGEAMENTO: [
    PERFIS.FERRADOR,
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  EDITAR_FERRAGEAMENTO: [
    PERFIS.FERRADOR,
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  // Prontuário
  GESTAO_PRONTUARIO: [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  CRIAR_PRONTUARIO: [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  EDITAR_PRONTUARIO: [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  VISUALIZAR_TASKS: [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
    PERFIS.ENFERMEIRO_VETERINARIO,
  ],

  // Gerenciamento de Usuários
  VISUALIZAR_USUARIOS: [
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  EDITAR_USUARIO: [
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  ALTERAR_PERFIL_USUARIO: [
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  ALTERAR_SENHA_USUARIO: [
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  CRIAR_USUARIO: [
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],
};

// Função para verificar se o usuário tem permissão
export const temPermissao = (perfilUsuario, permissao) => {
  if (!perfilUsuario || !permissao) return false;
  
  const perfisPermitidos = PERMISSOES[permissao];
  if (!perfisPermitidos) return false;
  
  return perfisPermitidos.includes(perfilUsuario);
};

// Função para verificar se o perfil é admin (Vet Admin ou Dev)
export const isAdmin = (perfilUsuario) => {
  return [PERFIS.VETERINARIO_ADMIN, PERFIS.DESENVOLVEDOR].includes(perfilUsuario);
};

// Função para verificar se o perfil é veterinário (qualquer nível)
export const isVeterinario = (perfilUsuario) => {
  return [
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ].includes(perfilUsuario);
};

// Função para comparar níveis de permissão
export const temNivelSuperior = (perfilUsuario, perfilComparado) => {
  const nivelUsuario = NIVEL_PERMISSAO[perfilUsuario];
  const nivelComparado = NIVEL_PERMISSAO[perfilComparado];
  
  if (nivelUsuario === undefined || nivelComparado === undefined) return false;
  
  return nivelUsuario < nivelComparado; // Menor número = mais permissões
};

export default {
  PERFIS,
  PERMISSOES,
  temPermissao,
  isAdmin,
  isVeterinario,
  temNivelSuperior,
};
