const API_BASE_URL = "http://localhost:3000";

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

  excluirSolipede: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/${numero}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  adicionarHoras: async (numero, horas, dadosUsuario = {}) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/adicionarHoras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        numero, 
        horas,
        ...dadosUsuario
      }),
    });
    return response.json();
  },

  historicoHoras: async (numero) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/solipedes/historico/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
    const response = await fetch(`${API_BASE_URL}/gestaoFVR/prontuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    return response.json();
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
};
