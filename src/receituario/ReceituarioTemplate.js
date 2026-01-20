import React from 'react';

/**
 * Componente que renderiza o template do receituário
 * Recebe os dados do solípede e tratamento
 */
export const ReceituarioTemplate = React.forwardRef(({ solipede, tratamento, usuarioLogado }, ref) => {
  const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
  const horaFormatada = dataAtual.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        height: '297mm',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#333',
        backgroundColor: '#fff',
        display: 'none',
        pageBreakAfter: 'always'
      }}
    >
      {/* CABEÇALHO */}
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
          SECRETARIA DA SEGURANÇA PÚBLICA
        </div>
        <div style={{ fontSize: '11px', marginBottom: '3px' }}>
          POLÍCIA MILITAR DO ESTADO DE SÃO PAULO
        </div>
        <div style={{ fontSize: '11px', marginBottom: '3px' }}>
          COMANDO DE POLICIAMENTO DE CHOQUE
        </div>
        <div style={{ fontSize: '10px', color: '#666' }}>
          REGIMENTO DE POLÍCIA MONTADA "9 DE JULHO"
        </div>
      </div>

      {/* INFORMAÇÕES DO SOLÍPEDE */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', textDecoration: 'underline' }}>
          RECEITUÁRIO
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', paddingBottom: '8px' }}>
                <strong>Solípede:</strong> {solipede?.nome || 'N/A'}
              </td>
              <td style={{ width: '50%', paddingBottom: '8px' }}>
                <strong>Nº:</strong> {solipede?.numero || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <strong>Sexo:</strong> {solipede?.sexo || 'N/A'}
              </td>
              <td style={{ paddingBottom: '8px' }}>
                <strong>Pelagem:</strong> {solipede?.pelagem || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <strong>Nascimento:</strong> {solipede?.DataNascimento 
                  ? new Date(solipede.DataNascimento).toLocaleDateString('pt-BR') 
                  : 'N/A'}
              </td>
              <td style={{ paddingBottom: '8px' }}>
                <strong>Esquadrão:</strong> {solipede?.esquadrao || 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* OBSERVAÇÃO CLÍNICA */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textDecoration: 'underline' }}>
          OBSERVAÇÃO CLÍNICA
        </div>
        <div style={{ 
          border: '1px solid #999', 
          padding: '10px', 
          minHeight: '60px', 
          backgroundColor: '#f9f9f9',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
          {tratamento?.observacao || '(Nenhuma observação registrada)'}
        </div>
      </div>

      {/* PRESCRIÇÃO */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textDecoration: 'underline' }}>
          PRESCRIÇÃO / MEDICAMENTOS
        </div>
        <div style={{ 
          border: '1px solid #999', 
          padding: '10px', 
          minHeight: '60px', 
          backgroundColor: '#f9f9f9',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
          {tratamento?.recomendacoes || '(Nenhuma prescrição registrada)'}
        </div>
      </div>

      {/* INFORMAÇÕES ADICIONAIS */}
      <div style={{ marginBottom: '20px' }}>
        <table style={{ width: '100%', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ paddingBottom: '6px' }}>
                <strong>Data do Lançamento:</strong> {tratamento?.data_criacao 
                  ? new Date(tratamento.data_criacao).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </td>
              <td style={{ paddingBottom: '6px' }}>
                <strong>Hora:</strong> {tratamento?.data_criacao 
                  ? new Date(tratamento.data_criacao).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                  : 'N/A'}
              </td>
            </tr>
            
          </tbody>
        </table>
      </div>

      {/* ASSINATURA */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ height: '50px' }} />
          <div style={{ borderTop: '1px solid #000', textAlign: 'center', marginTop: '5px', fontSize: '11px' }}>
            Assinatura do Veterinário Responsável
          </div>
        </div>

        <table style={{ width: '100%', fontSize: '10px', color: '#666', marginTop: '20px' }}>
          <tbody>
            <tr>
              <td>
                <strong>Responsável:</strong> {usuarioLogado?.nome || 'N/A'}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Data de Impressão:</strong> {dataFormatada} às {horaFormatada}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RODAPÉ */}
      <div style={{ 
        marginTop: '40px', 
        paddingTop: '10px', 
        borderTop: '1px solid #ccc', 
        fontSize: '9px', 
        textAlign: 'center', 
        color: '#999' 
      }}>
        Documento gerado automaticamente pelo Sistema de Prontuário Veterinário
      </div>
    </div>
  );
});

ReceituarioTemplate.displayName = 'ReceituarioTemplate';

export default ReceituarioTemplate;
