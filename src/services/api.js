const API_BASE_URL = "http://10.37.20.250:3000";

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

  indicadoresAnuais: async (ano) => {
    const anoParam = ano || new Date().getFullYear();
    const response = await fetch(`${API_BASE_URL}/solipedes/indicadores/anual?ano=${anoParam}`);
    return response.json();
  },

  // Solípedes (com autenticação)
  listarSolipedes: async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  obterSolipede: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  criarSolipede: async (dados) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes`, {
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
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/${numero}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  movimentacaoBulk: async ({ numeros, novaMovimentacao, observacao, senha }) => {
    console.log("🌐 API.movimentacaoBulk CHAMADO");
    console.log("   - numeros:", numeros);
    console.log("   - novaMovimentacao:", novaMovimentacao);
    console.log("   - observacao:", observacao);
    console.log("   - senha:", senha ? "****" : "vazia");
    
    const token = localStorage.getItem("token");
    console.log("   - token:", token ? "existe" : "NÃO EXISTE");
    
    const url = `${API_BASE_URL}/gestaoFVR/solipedes/movimentacao/bulk`;
    console.log("   - URL:", url);
    
    const body = { numeros, novaMovimentacao, observacao, senha };
    console.log("   - Body completo:", body);
    
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

  excluirSolipede: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/${numero}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

 adicionarHoras: async (dados) => {
  const token = localStorage.getItem("token");
  console.log("API adicionarHoras - dados enviados:", dados);

  const response = await fetch(
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
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/historico/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  historicoHorasPublico: async (numero) => {
    const response = await fetch(`${API_BASE_URL}/solipedes/historico/${numero}`);
    return response.json();
  },

  historicoMensal: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/historico/mensal/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  atualizarHistorico: async (id, horas) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/historico/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ horas }),
    });
    return response.json();
  },

  // Prontuário
  salvarProntuario: async (dados) => {
    const token = localStorage.getItem("token");
    
    console.log("🔐 salvarProntuario:");
    console.log("   Token presente:", token ? "✅ Sim" : "❌ Não");
    console.log("   Token (primeiros 30 chars):", token ? token.substring(0, 30) + "..." : "N/A");
    console.log("   Dados sendo enviados:", dados);
    
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/prontuario`, {
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

  listarProntuario: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/prontuario/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  atualizarProntuario: async (id, dados) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/prontuario/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/prontuario/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Exclusão (soft delete)
  excluirSolipede: async (numero, motivoExclusao, senha) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/excluir`, {
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
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/excluidos/listar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

