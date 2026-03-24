// URL da API centralizada no .env
const API_BASE_URL = process.env.REACT_APP_API_URL;

console.log('🔗 API configurada para:', API_BASE_URL);

// Função para fazer logout e redirecionar
const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "/dashboard";
};

// Wrapper para fetch que intercepta erros 401
const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Se receber 401 (não autorizado), faz logout automático
    if (response.status === 401) {
      console.warn("⚠️ Token expirado ou inválido - fazendo logout automático");
      handleUnauthorized();
      throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

const parseApiResponse = async (response, endpointLabel = "API") => {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return {
        error: `Resposta JSON inválida em ${endpointLabel}`,
        detail: raw,
      };
    }
  }

  // Quando backend/roteamento falha, costuma voltar HTML (ex.: página de erro)
  if (raw.trim().startsWith("<!DOCTYPE") || raw.trim().startsWith("<html")) {
    return {
      error: `Resposta não-JSON recebida em ${endpointLabel}. Verifique se a rota existe e se a API está rodando.`,
      status: response.status,
    };
  }

  return {
    error: raw || `Falha na chamada ${endpointLabel}`,
    status: response.status,
  };
};

export const api = {
  // Auth
  login: async (email, senha) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    return response.json();
  },

  criarUsuario: async (nome, registro, email, senha) => {
    const response = await fetch(`${API_BASE_URL}/auth/criar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, registro, email, senha }),
    });
    return response.json();
  },

  // Solípedes PÚBLICO (sem autenticação)
  listarSolipedesPublico: async () => {
    const response = await fetch(`${API_BASE_URL}/solipedes/publico`);
    return response.json();
  },

  // 🚀 OTIMIZADO: Busca apenas números de solípedes com restrições ativas
  listarSolipedesComRestricao: async () => {
    const response = await fetch(`${API_BASE_URL}/restricoes/solipedes-com-restricao`);
    return response.json();
  },
  
  // 🚀 OTIMIZADO: Busca apenas números de solípedes com observações
  listarSolipedesComObservacoes: async () => {
    const response = await fetch(`${API_BASE_URL}/observacoes/solipedes-com-observacoes`);
    return response.json();
  },

  // ➕ Criar nova observação comportamental
  criarObservacao: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  // ✏️ Editar observação comportamental
  editarObservacao: async (id, dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  // 🗑️ Deletar observação comportamental
  deletarObservacao: async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  indicadoresAnuais: async (ano) => {
    const anoParam = ano || new Date().getFullYear();
    const response = await fetch(`${API_BASE_URL}/solipedes/indicadores/anual?ano=${anoParam}`);
    return response.json();
  },

  // Solípedes (com autenticação)
  listarSolipedes: async () => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  obterSolipede: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
  
  atualizarStatusSolipede: async (numero, novoStatus) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/${numero}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: novoStatus }),
    });
    return response.json();
  },

  criarSolipede: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  atualizarSolipede: async (numero, dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/${numero}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  movimentacaoBulk: async ({ numeros, destino, novaAlocacao, data_movimentacao, dataMovimentacao, motivo, observacao, senha }) => {
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}/gestaoFVR/solipedes/movimentacao/bulk`;
    const body = {
      numeros,
      destino: destino || novaAlocacao,
      data_movimentacao: data_movimentacao || dataMovimentacao,
      motivo: motivo || observacao || null,
      senha,
    };
    
    // Não usar fetchWithAuth aqui para evitar logout automático em caso de senha incorreta
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    
    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();
    
    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(raw);
        return parsed;
      } catch (e) {
        return { error: "Resposta JSON inválida", detail: raw };
      }
    }
    return { error: raw || "Falha desconhecida" };
  },

  // ⚠️ Função removida - use a versão com soft delete abaixo (linha ~283)

 adicionarHoras: async (dados) => {
  const token = localStorage.getItem("token");
  console.log("API adicionarHoras - dados enviados:", dados);

  const response = await fetchWithAuth(
    `${API_BASE_URL}/gestaoFVR/solipedes/adicionarHoras`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    }
  );

  return response.json();
},


  historicoHoras: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/historico/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  historicoHorasPublico: async (numero) => {
    const response = await fetch(`${API_BASE_URL}/solipedes/historico/${numero}`);
    return response.json();
  },

  horasMesAtual: async () => {
    const response = await fetch(`${API_BASE_URL}/solipedes/horas-mes-atual`);
    return response.json();
  },

  historicoMensal: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/historico/mensal/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  atualizarHistorico: async (id, horas) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/historico/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ horas }),
    });
    return response.json();
  },

  // Histórico de Movimentação
  historicoMovimentacao: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/historico-movimentacao/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  historicoMovimentacaoPublico: async (numero) => {
    const response = await fetch(`${API_BASE_URL}/solipedes/historico-movimentacao/${numero}`);
    return response.json();
  },

  // Prontuário Público - Um solípede específico
  listarProntuarioPublico: async (numero) => {
    const response = await fetch(`${API_BASE_URL}/solipedes/prontuario/${numero}`);
    return response.json();
  },

  // Observações Gerais Público (todos os tipos exceto Restrições) - COM dados do usuário
  listarObservacoesPublico: async (numero) => {
    const response = await fetch(`${API_BASE_URL}/observacoes/${numero}`);
    return response.json();
  },
  
  // Ferrageamentos Público
  listarFerrageamentosPublico: async () => {
    const response = await fetch(`${API_BASE_URL}/solipedes/ferrageamentos`);
    return response.json();
  },

  // Prontuário
  salvarProntuario: async (dados) => {
    const token = localStorage.getItem("token");
    
    console.log("🔐 salvarProntuario:");
    console.log("   Token presente:", token ? "✅ Sim" : "❌ Não");
    console.log("   Token (primeiros 30 chars):", token ? token.substring(0, 30) + "..." : "N/A");
    console.log("   Dados sendo enviados:", dados);
    
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    
    const resultado = await response.json();
    console.log("📥 Resposta do servidor:", resultado);
    return resultado;
  },

  listarTodosProntuarios: async () => {
    const token = localStorage.getItem("token");
    console.log("🔐 Token presente:", token ? "✅ Sim" : "❌ Não");
    
    if (!token) {
      return { error: "Você precisa estar logado para acessar os lançamentos" };
    }
    
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/novo-modelo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("📡 Status da resposta:", response.status);
      
      const data = await response.json();
      console.log("📦 Dados recebidos:", data);
      
      return data;
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      return { error: "Erro de conexão com o servidor" };
    }
  },

  listarProntuario: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/novo-modelo/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  contarBaixasPendentes: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${numero}/baixas-pendentes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  contarTratamentosEmAndamento: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${numero}/tratamentos-andamento`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  liberarBaixa: async (prontuarioId) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${prontuarioId}/liberar-baixa`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  concluirTratamento: async (prontuarioId, senha) => {
    console.log(`🔐 API: Concluindo tratamento ${prontuarioId}`);
    try {
      const token = localStorage.getItem("token");
      // Usar fetch normal, sem fetchWithAuth que intercepta 401
      const response = await fetch(`${API_BASE_URL}/gestaoFVR/prontuario/${prontuarioId}/concluir-tratamento`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ senha }),
      });
      
      console.log(`📡 Status da resposta: ${response.status}`);
      
      const data = await response.json();
      console.log("📦 Dados recebidos:", data);
      
      // Se o status HTTP é sucesso (200-299), retornar os dados
      if (response.ok) {
        return data;
      }
      
      // Para erros HTTP, retornar os dados com erro
      return data;
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      return { error: "Erro de conexão com o servidor" };
    }
  },

  concluirRegistro: async (prontuarioId, senha, opcoes = {}) => {
    console.log(`🔐 API: Concluindo registro ${prontuarioId}`);
    try {
      const token = localStorage.getItem("token");
      const payload = { senha, ...opcoes };
      // Usar fetch normal, sem fetchWithAuth que intercepta 401
      const response = await fetch(`${API_BASE_URL}/gestaoFVR/prontuario/${prontuarioId}/concluir-registro`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      console.log(`📡 Status da resposta: ${response.status}`);
      
      const data = await response.json();
      console.log("📦 Dados recebidos:", data);
      
      // Se o status HTTP é sucesso (200-299), retornar os dados
      if (response.ok) {
        return data;
      }
      
      // Para erros HTTP, retornar os dados com erro
      return data;
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      return { error: "Erro de conexão com o servidor" };
    }
  },

  atualizarProntuario: async (id, dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  deletarProntuario: async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Excluir registro de prontuário (com senha)
  excluirRegistroProntuario: async (id, senha) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${id}/excluir`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ senha }),
    });
    return response.json();
  },

  // Exclusão (soft delete)
  excluirSolipede: async (numero, motivoExclusao, observacao, senha) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/excluir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ numero, motivoExclusao, observacao, senha }),
    });
    return response.json();
  },

  listarExcluidos: async () => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/excluidos/listar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Buscar solípede excluído
  obterSolipedeExcluido: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/excluidos/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Buscar prontuário arquivado
  listarProntuarioExcluido: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/excluidos/${numero}/prontuario`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Ferrageamentos
  criarFerrageamento: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/ferrageamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  listarFerrageamentos: async () => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/ferrageamentos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  listarFerrageamentosComStatus: async () => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/ferrageamentos/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  historicoFerrageamento: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/ferrageamentos/historico/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  ultimoFerrageamento: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/ferrageamentos/ultimo/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  atualizarFerrageamento: async (id, dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/ferrageamentos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  deletarFerrageamento: async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/ferrageamentos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Excluir ferrageamento com senha
  excluirFerrageamento: async (id, senha) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/ferrageamentos/${id}/excluir`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ senha }),
    });
    return response.json();
  },




  //NOVOS METODOS PARA PRONTUARIOS
  // Lista registros de prontuario_geral; se numero for informado, filtra por solipede
  listarNovoModeloProntuarios: async (numero) => {
    const token = localStorage.getItem("token");
    const sufixo = numero !== undefined && numero !== null && numero !== "" ? `/${numero}` : "";
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/novo-modelo${sufixo}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  //TRATAMENTOS
  listarProntuarioTratamentos: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${numero}/tratamentos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  criarProntuarioTratamento: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/tratamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },
    //RESTRIÇÕES
  criarProntuarioRestricao: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/restricoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },
    //DIETAS
  criarProntuarioDieta: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/dietas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },
    //SUPLEMENTAÇÕES
  criarProntuarioSuplementacao: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/suplementacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },
    //MOVIMENTAÇÕES
  criarProntuarioMovimentacao: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/movimentacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  //VACINAÇÕES
  listarProntuarioVacinacoes: async (prontuarioId) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${prontuarioId}/vacinacoes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  criarProntuarioVacinacao: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/vacinacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return parseApiResponse(response, "criarProntuarioVacinacao");
  },

  atualizarProntuarioVacinacao: async (id, dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/vacinacoes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return parseApiResponse(response, "atualizarProntuarioVacinacao");
  },

  excluirProntuarioVacinacao: async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/vacinacoes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseApiResponse(response, "excluirProntuarioVacinacao");
  },

  //VERMIFUGAÇÕES
  listarProntuarioVermifugacoes: async (prontuarioId) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${prontuarioId}/vermifugacoes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseApiResponse(response, "listarProntuarioVermifugacoes");
  },

  criarProntuarioVermifugacao: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/vermifugacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return parseApiResponse(response, "criarProntuarioVermifugacao");
  },

  atualizarProntuarioVermifugacao: async (id, dados) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/vermifugacoes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return parseApiResponse(response, "atualizarProntuarioVermifugacao");
  },

  excluirProntuarioVermifugacao: async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/vermifugacoes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseApiResponse(response, "excluirProntuarioVermifugacao");
  },

};

