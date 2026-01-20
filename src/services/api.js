// Usa a configuração dinâmica do window.ENV se disponível, senão usa a variável de ambiente
const API_BASE_URL = (window.ENV && window.ENV.API_URL) || process.env.REACT_APP_API_URL || "http://localhost:3000";

console.log('🔗 API configurada para:', API_BASE_URL);

// Função auxiliar para verificar se token está presente
const checkAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  return true;
};

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

  criarUsuario: async (nome, registro, email, senha, perfil) => {
    const response = await fetch(`${API_BASE_URL}/auth/criar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, registro, email, senha, perfil }),
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

  movimentacaoBulk: async ({ numeros, novaAlocacao, observacao, senha }) => {
    console.log("🌐 API.movimentacaoBulk CHAMADO");
    console.log("   - numeros:", numeros);
    console.log("   - novaAlocacao:", novaAlocacao);
    console.log("   - observacao:", observacao);
    console.log("   - senha:", senha ? "****" : "vazia");
    
    const token = localStorage.getItem("token");
    console.log("   - token:", token ? "existe" : "NÃO EXISTE");
    
    const url = `${API_BASE_URL}/gestaoFVR/solipedes/movimentacao/bulk`;
    console.log("   - URL:", url);
    
    const body = { numeros, novaAlocacao, observacao, senha };
    console.log("   - Body completo:", body);
    
    // Não usar fetchWithAuth aqui para evitar logout automático em caso de senha incorreta
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("   - Response status:", response.status);
    console.log("   - Response ok:", response.ok);
    
    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();
    console.log("   - Response raw:", raw);
    
    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(raw);
        console.log("   - Response parsed:", parsed);
        return parsed;
      } catch (e) {
        console.error("   - Erro ao parsear JSON:", e);
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

  // Prontuário Público
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
      const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/todos`, {
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
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/prontuario/${numero}`, {
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

  concluirRegistro: async (prontuarioId, senha) => {
    console.log(`🔐 API: Concluindo registro ${prontuarioId}`);
    try {
      const token = localStorage.getItem("token");
      // Usar fetch normal, sem fetchWithAuth que intercepta 401
      const response = await fetch(`${API_BASE_URL}/gestaoFVR/prontuario/${prontuarioId}/concluir-registro`, {
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
  excluirSolipede: async (numero, motivoExclusao, senha) => {
    const token = localStorage.getItem("token");
    const response = await fetchWithAuth(`${API_BASE_URL}/gestaoFVR/solipedes/excluir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ numero, motivoExclusao, senha }),
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
};

