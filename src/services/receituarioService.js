import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Gera um PDF de receituário baseado em um elemento HTML
 * @param {string} elementId - ID do elemento HTML a ser convertido
 * @param {string} nomeArquivo - Nome do arquivo PDF
 */
export const gerarReceituarioPDF = async (elementId, nomeArquivo = 'receituario.pdf') => {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.error(`Elemento com ID '${elementId}' não encontrado`);
      return;
    }

    // Captura o elemento como imagem
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // margem de 10mm de cada lado
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Adiciona a imagem ao PDF (com suporte a múltiplas páginas)
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Faz download do PDF
    pdf.save(nomeArquivo);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
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
