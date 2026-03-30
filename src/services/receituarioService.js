import html2pdf from 'html2pdf.js';

/**
 * Gera um PDF de receituário baseado em um elemento HTML
 * @param {string} elementId - ID do elemento HTML a ser convertido
 * @param {string} nomeArquivo - Nome do arquivo PDF
 */
export const gerarReceituarioPDF = async (elementId, nomeArquivo = 'receituario.pdf') => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Elemento com ID '${elementId}' não encontrado`);
    return;
  }

  const opcoes = {
    margin: 0,
    filename: nomeArquivo,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  await html2pdf().set(opcoes).from(element).save();
};

/**
 * Abre o receituário em uma nova aba para impressão
 * @param {string} conteudoHTML - HTML do receituário
 */
export const imprimirReceituario = (conteudoHTML) => {
  try {
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(conteudoHTML);
    novaJanela.document.close();
    novaJanela.print();
  } catch (error) {
    console.error('Erro ao abrir impressão:', error);
    throw error;
  }
};
