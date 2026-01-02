// Sistema de permissões baseado em perfis

export const PERFIS = {
  CONSULTA: "Consulta",
  PAGADOR: "Pagador de cavalo",
  FERRADOR: "Ferrador",
  VETERINARIO: "Veterinario",
  VETERINARIO_ADMIN: "Veterinario Admin",
  DESENVOLVEDOR: "Desenvolvedor",
};

// Hierarquia de permissões (menor número = mais permissões)
export const NIVEL_PERMISSAO = {
  [PERFIS.DESENVOLVEDOR]: 0,
  [PERFIS.VETERINARIO_ADMIN]: 1,
  [PERFIS.VETERINARIO]: 2,
  [PERFIS.FERRADOR]: 3,
  [PERFIS.PAGADOR]: 4,
  [PERFIS.CONSULTA]: 5,
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

  // Carga Horária
  ADMIN_CARGA_HORARIA: [
    PERFIS.CONSULTA,
    PERFIS.PAGADOR,
    PERFIS.FERRADOR,
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
  ],

  ADICIONAR_HORAS: [
    PERFIS.PAGADOR,
    PERFIS.VETERINARIO,
    PERFIS.VETERINARIO_ADMIN,
    PERFIS.DESENVOLVEDOR,
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
