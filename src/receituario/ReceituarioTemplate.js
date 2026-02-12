import React from 'react';
import LogoRpmon from '../Imagens/LOGORPMON.png';
import LogoPmesp from '../Imagens/Logo-PM.png';

export const ReceituarioTemplate = React.forwardRef(({ solipede, tratamento, usuarioLogado }, ref) => {
  const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR');

  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        height: '296mm',
        margin: 0,
        padding: '15mm 20mm 20mm 20mm',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        backgroundColor: '#fff',
        color: '#000',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >

      {/* CABEÇALHO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #000',
        paddingBottom: '10px',
        marginBottom: '15px'
      }}>
        <div style={{ width: '60px', textAlign: 'center' }}>
          <img src={LogoPmesp} alt="Logo PMESP" style={{ height: '55px', width: 'auto' }} />
        </div>

        <div style={{
          flex: 1,
          textAlign: 'center',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>
            SECRETARIA DA SEGURANÇA PÚBLICA
          </div>
          <div style={{ fontSize: '12px', marginBottom: '2px' }}>
            POLÍCIA MILITAR DO ESTADO DE SÃO PAULO
          </div>
          <div style={{ fontSize: '12px', marginBottom: '2px' }}>
            COMANDO DE POLICIAMENTO DE CHOQUE
          </div>
          <div style={{ fontSize: '11px', color: '#333', fontWeight: '500' }}>
            REGIMENTO DE POLÍCIA MONTADA "9 DE JULHO"
          </div>
        </div>

        <div style={{ width: '60px', textAlign: 'center' }}>
          <img src={LogoRpmon} alt="Logo RPMON" style={{ height: '55px', width: 'auto' }} />
        </div>
      </div>

      {/* TÍTULO */}
      <div style={{
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: '10px'
      }}>
        RECEITUÁRIO VETERINÁRIO
      </div>

      {/* CONTEÚDO - ÁREA COM ALTURA FIXA */}
      <div style={{
        height: 'calc(297mm - 15mm - 20mm - 100px - 16px - 10px - 80px)', // Altura total - paddings - cabeçalho - título - rodapé
        overflow: 'hidden'
      }}>
        {/* Dados do Solípede */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <strong>Número:</strong> {solipede?.numero || '—'}
            </div>
            <div style={{ flex: 1 }}>
              <strong>Nome:</strong> {solipede?.nome || '—'}
            </div>
            <div style={{ flex: 1 }}>
              <strong>Nascimento:</strong>{' '}
              {solipede?.DataNascimento
                ? new Date(solipede.DataNascimento).toLocaleDateString('pt-BR')
                : '—'}
            </div>
          </div>

          <div style={{ display: 'flex', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <strong>Sexo:</strong> {solipede?.sexo || '—'}
            </div>
            <div style={{ flex: 1 }}>
              <strong>Pelagem:</strong> {solipede?.pelagem || '—'}
            </div>
            <div style={{ flex: 1 }}>
              <strong>Esquadrão:</strong> {solipede?.esquadrao || '—'}
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <strong>Status:</strong> {solipede?.status || '—'}
          </div>
        </div>
        <hr style={{ margin: '10px 0' }} />
        
        {/* Diagnóstico - COM ALTURA MÁXIMA */}
        {tratamento?.diagnosticos && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Diagnóstico:</div>
            <div style={{
              padding: '2px 0',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              maxHeight: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {tratamento.diagnosticos}
            </div>
          </div>
        )}

        {/* Prescrição - COM ALTURA MÁXIMA */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Prescrição / Conduta Terapêutica:</div>
          <div style={{
            padding: '2px 0',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {tratamento?.recomendacoes || 'Nenhuma prescrição registrada.'}
          </div>
        </div>

        {/* Observações Adicionais */}
        <div style={{ marginTop: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Observações Adicionais:</div>
          
        </div>
      </div>

      {/* RODAPÉ — POSIÇÃO ABSOLUTA NO FINAL DA PÁGINA */}
      <div style={{
        position: 'absolute',
        bottom: '20mm',
        left: '20mm',
        right: '20mm',
        paddingTop: '15px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '10px',
        }}>
          <div style={{
            borderTop: '1px solid #000',
            width: '300px',
            margin: '0 auto 5px auto',
            paddingTop: '5px',
            fontSize: '11px'
          }}>
            Assinatura do Responsável
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px'
        }}>
          <div>
            <strong>Data:</strong> {dataFormatada}
          </div>
          <div>
            <strong>Responsável:</strong> {usuarioLogado?.nome || '—'}
          </div>
        </div>
      </div>

    </div>
  );
});

ReceituarioTemplate.displayName = 'ReceituarioTemplate';
export default ReceituarioTemplate;
