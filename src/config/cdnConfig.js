// ============================================
// 🌐 CONFIGURAÇÃO DE CDN
// ============================================

// Para produção, configure a URL do seu CDN aqui
const CDN_BASE_URL = process.env.REACT_APP_CDN_URL || '';

// URLs dos arquivos de áudio (Hinos)
export const audioUrls = {
  'hino-bandeira-vocal': `${CDN_BASE_URL}/audio/hinos/hino-bandeira-vocal.mp3`,
  'hino-proclamacao-vocal': `${CDN_BASE_URL}/audio/hinos/hino-proclamacao-vocal.mp3`,
  'paris-belfort-vocal': `${CDN_BASE_URL}/audio/hinos/paris-belfort-vocal.mp3`,
  'hino-nacional-vocal': `${CDN_BASE_URL}/audio/hinos/hino-nacional-vocal.mp3`,
  'cancao-patrulheiro-vocal': `${CDN_BASE_URL}/audio/hinos/cancao-patrulheiro-vocal.mp3`,
  'cancao-policia-militar-vocal': `${CDN_BASE_URL}/audio/hinos/cancao-policia-militar-vocal.mp3`,
  'eterno-regimento-instrumental': `${CDN_BASE_URL}/audio/hinos/eterno-regimento-instrumental.mp3`,
  'eterno-regimento-vocal': `${CDN_BASE_URL}/audio/hinos/eterno-regimento-vocal.mp3`,
  'cancao-cavalaria': `${CDN_BASE_URL}/audio/hinos/cancao-cavalaria.mp3`,
  'essd-vocal': `${CDN_BASE_URL}/audio/hinos/essd-vocal.mp3`,
  'incorporacao-bandeira': `${CDN_BASE_URL}/audio/hinos/incorporacao-bandeira.mp3`,
  'hino-nacional-continencia': `${CDN_BASE_URL}/audio/hinos/hino-nacional-continencia.mp3`,
  'cancao-essd': `${CDN_BASE_URL}/audio/hinos/cancao-essd.mp3`,
  'cancao-infantaria': `${CDN_BASE_URL}/audio/hinos/cancao-infantaria.mp3`,
  'arma-herois': `${CDN_BASE_URL}/audio/hinos/arma-herois.mp3`,
};

// Helper para obter URL de áudio
export const getAudioUrl = (key) => {
  // Em desenvolvimento, usa arquivos locais se CDN não configurado
  if (!CDN_BASE_URL) {
    const localUrls = {
      'hino-bandeira-vocal': '/Hinos/Hino á Bandeira - Vocal.mp3',
      'hino-proclamacao-vocal': '/Hinos/Hino da Proclamação da República  Vocal.mp3',
      'paris-belfort-vocal': '/Hinos/Paris Belfort (9 de Julho) - Vocal.mp3',
      'hino-nacional-vocal': '/Hinos/Hino Nacional Brasileiro - Vocal.mp3',
      'cancao-patrulheiro-vocal': '/Hinos/Canção do Patrulheiro - Vocal.mp3',
      'cancao-policia-militar-vocal': '/Hinos/Canção da Polícia Militar - Vocal.mp3',
      'eterno-regimento-instrumental': '/Hinos/Eterno Regimento - Instrumental.mp3',
      'eterno-regimento-vocal': '/Hinos/Eterno Regimento - Vocal.mp3',
      'cancao-cavalaria': '/Hinos/Canção da Cavalaria.mp3',
      'essd-vocal': '/Hinos/Essd - Vocal.mp3',
      'incorporacao-bandeira': '/Hinos/Música da Incorporação da Bandeira.mp3',
      'hino-nacional-continencia': '/Hinos/Hino Nacional Brasileiro  Continência.mp3',
      'cancao-essd': '/Hinos/cancao_essd.mp3',
      'cancao-infantaria': '/Hinos/01-Canção da Infantaria.mp3',
      'arma-herois': '/Hinos/Arma de Herois - Canção da Cavalaria.mp3',
    };
    return localUrls[key] || '';
  }
  
  return audioUrls[key] || '';
};

// Helper para imagens CDN
export const getImageUrl = (path) => {
  if (!CDN_BASE_URL) {
    return path; // Usa caminho local em desenvolvimento
  }
  return `${CDN_BASE_URL}/images/${path}`;
};

// Verificar se CDN está configurado
export const isCDNConfigured = () => {
  return Boolean(CDN_BASE_URL);
};

export default {
  audioUrls,
  getAudioUrl,
  getImageUrl,
  isCDNConfigured,
};
