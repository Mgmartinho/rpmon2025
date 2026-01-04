// Utilitários de autenticação

/**
 * Decodifica um token JWT sem verificação (apenas lê o payload)
 */
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

/**
 * Verifica se o token está expirado
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // exp está em segundos, Date.now() está em milissegundos
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Verifica se o usuário está autenticado com token válido
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }

  // Verifica se o token está expirado
  if (isTokenExpired(token)) {
    console.warn('⚠️ Token expirado detectado');
    logout();
    return false;
  }

  return true;
};

/**
 * Faz logout limpando dados de autenticação
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

/**
 * Obtém informações do usuário logado
 */
export const getUsuarioLogado = () => {
  const usuarioStr = localStorage.getItem('usuario');
  if (!usuarioStr) return null;

  try {
    return JSON.parse(usuarioStr);
  } catch (error) {
    console.error('Erro ao parsear usuário:', error);
    return null;
  }
};

/**
 * Verifica periodicamente se o token expirou
 * Retorna função para cancelar a verificação
 */
export const startTokenExpirationCheck = (intervalMs = 60000) => {
  const intervalId = setInterval(() => {
    const token = localStorage.getItem('token');
    
    if (token && isTokenExpired(token)) {
      console.warn('⚠️ Token expirou - fazendo logout automático');
      logout();
      window.location.href = '/dashboard';
    }
  }, intervalMs);

  // Retorna função para parar a verificação
  return () => clearInterval(intervalId);
};
