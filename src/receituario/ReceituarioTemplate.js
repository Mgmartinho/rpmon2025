import React from 'react';
import LogoRpmon from '../Imagens/LOGORPMON.png';
import LogoPmesp from '../Imagens/Logo-PM.png';

/**
 * Componente que renderiza o template do receituário
 * Recebe os dados do solípede e tratamento
 */
export const ReceituarioTemplate = React.forwardRef(({ solipede, tratamento, usuarioLogado }, ref) => {
  const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR');


  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm 15mm 25mm 15mm', // espaço inferior pro rodapé
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#333',
        backgroundColor: '#fff',
        display: 'none',
        position: 'relative' // NECESSÁRIO para o rodapé absoluto
      }}
    >

      {/* CABEÇALHO */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '2px solid #000',
          paddingBottom: '10px'
        }}
      >
        {/* Logo PMESP */}
        <img
          src={LogoPmesp}
          alt="Logo PMESP"
          style={{ height: '70px', paddingLeft: '85px' }}
        />

        {/* Texto Central */}
        <div style={{ textAlign: 'center', flex: 1 }}>
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

        {/* Logo RPMON */}
        <img
          src={LogoRpmon}
          alt="Logo RPMON"
          style={{ height: '70px', paddingRight: '85px' }}
        />
      </div>

      {/* INFORMAÇÕES DO SOLÍPEDE */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            marginBottom: '10px',
            textDecoration: 'underline'
          }}
        >
          RECEITUÁRIO
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%', paddingBottom: '8px' }}>
                <strong>Numeração:</strong> {solipede?.numero || 'N/A'}
              </td>
              <td style={{ width: '33%', paddingBottom: '8px' }}>
                <strong>Solípede:</strong> {solipede?.nome || 'N/A'}
              </td>
              <td style={{ paddingBottom: '8px' }}>
                <strong>Nascimento:</strong>{' '}
                {solipede?.DataNascimento
                  ? new Date(solipede.DataNascimento).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </td>

            </tr>

            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <strong>Sexo:</strong> {solipede?.sexo || 'N/A'}
              </td>
              <td style={{ paddingBottom: '8px' }}>
                <strong>Pelagem:</strong> {solipede?.pelagem || 'N/A'}
              </td>
              <td style={{ paddingBottom: '8px' }}>
                <strong>Esquadrão:</strong> {solipede?.esquadrao || 'N/A'}
              </td>
            </tr>

            <tr>

              <td style={{ width: '34%', paddingBottom: '8px' }}>
                <strong>Status:</strong> {solipede?.status || 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      {/* OBSERVAÇÃO CLÍNICA */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textDecoration: 'underline' }}>
          DETALHES CLÍNICOS
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



      {/* Espaço em branco */}

      {/* RODAPÉ FIXO */}
      <div
        style={{
          position: 'absolute',
          bottom: '15mm',
          left: '15mm',
          right: '15mm',
          fontSize: '11px',
          color: '#333'
        }}
      >
        <hr style={{ marginBottom: '10px' }} />

        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          Assinatura do Veterinário Responsável
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '2px'
          }}
        >
          <span><strong>Data do Lançamento:</strong> {dataFormatada}</span>
        </div>

        <div style={{ marginBottom: '2px' }}>
          <strong>Responsável:</strong> {usuarioLogado?.nome || '—'}
        </div>
      </div>
      
    </div>
  );
});

ReceituarioTemplate.displayName = 'ReceituarioTemplate';

export default ReceituarioTemplate;
