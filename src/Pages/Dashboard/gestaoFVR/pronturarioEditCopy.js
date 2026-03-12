import { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Spinner,
  Container,
  Nav,
  Tab,
  ListGroup,
  Alert,
  Modal,
  Accordion,
} from "react-bootstrap";
import {
  BsPlusCircle,
  BsClockHistory,
  BsCheckCircle,
  BsExclamationTriangle,
  BsFilePdf,
  BsFileWord,
  BsPencilSquare,
  BsArchive,
  BsPrinter,
} from "react-icons/bs";

import { LuTriangleAlert } from "react-icons/lu";

import { useParams, useSearchParams } from "react-router-dom";
import { flushSync } from "react-dom";
import { api } from "../../../services/api";
import html2pdf from 'html2pdf.js';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import ReceituarioTemplate from "../../../receituario/ReceituarioTemplate.js";

import ProntuarioDieta from "./prontuario/prontuarioDieta";
import ProntuarioRestricao from "./prontuario/prontuarioRestricao";
import ProntuarioSuplementacao from "./prontuario/prontuarioSuplementacao";
import ProntuarioTratamento from "./prontuario/prontuarioTratamento";
import ProntuarioMovimentacao from "./prontuario/prontuarioMovimentacao";

import HistoricoProntuarioRestricoes from "../gestaoFVR/historico/historicoProntuarioRestricao";
import HistoricoProntuarioTratamento from "./historico/historicoProntuarioTratamento";
import HistoricoProntuarioDieta from "./historico/historicoProntuarioDieta";
import HistoricoProntuarioSuplementacao from "./historico/historicoProntuarioSuplementacao";
import HistoricoProntuarioMovimentacao from "./historico/historicoProntuarioMovimentacao";


export default function ProntuarioSolipedeEditCopy() {
  const { numero } = useParams();
  const [searchParams] = useSearchParams();
  const readonlyMode = searchParams.get('readonly') === 'true';

  const [solipede, setSolipede] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [recomendacoes, setRecomendacoes] = useState("");
  const [tipoObservacao, setTipoObservacao] = useState("Tratamento");
  const [historico, setHistorico] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [visaoGeralTexto, setVisaoGeralTexto] = useState(""); // Novo estado para Visão Geral
  const [tratamentosEmAndamento, setTratamentosEmAndamento] = useState(0);

  const [loadingHistorico, setLoadingHistorico] = useState(true);

  const [dataLancamento, setDataLancamento] = useState("");
  const [dataValidade, setDataValidade] = useState("");

  const [tipoBaixa, setTipoBaixa] = useState("");
  const [baixasPendentes, setBaixasPendentes] = useState(0);

  // Estados para Vacinação, Vermifugação e AIE
  const [dataAplicacao, setDataAplicacao] = useState("");
  const [partidaLote, setPartidaLote] = useState("");
  const [validadeProduto, setValidadeProduto] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");

  // Estados para edição de registros
  const [registroEditando, setRegistroEditando] = useState(null);
  const [showModalEdicao, setShowModalEdicao] = useState(false);
  const [observacaoEdicao, setObservacaoEdicao] = useState("");
  const [diagnosticoEdicao, setDiagnosticoEdicao] = useState("");
  const [recomendacoesEdicao, setRecomendacoesEdicao] = useState("");
  const [dataValidadeEdicao, setDataValidadeEdicao] = useState("");

  // Estados para edição de Restrições
  const [showModalEdicaoRestricao, setShowModalEdicaoRestricao] = useState(false);
  const [observacaoEdicaoRestricao, setObservacaoEdicaoRestricao] = useState("");
  const [dataValidadeEdicaoRestricao, setDataValidadeEdicaoRestricao] = useState("");

  // Estados para edição de Dieta
  const [showModalEdicaoDieta, setShowModalEdicaoDieta] = useState(false);
  const [observacaoEdicaoDieta, setObservacaoEdicaoDieta] = useState("");
  const [dietaEdicao, setDietaEdicao] = useState({
    fenoSoFeno: false,
    umQuintoRacao: false,
    fenoMolhado: false,
    jejum: false,
  });

  // Estados para edição de Suplementação
  const [showModalEdicaoSuplementacao, setShowModalEdicaoSuplementacao] = useState(false);
  const [observacaoEdicaoSuplementacao, setObservacaoEdicaoSuplementacao] = useState("");
  const [dataValidadeEdicaoSuplementacao, setDataValidadeEdicaoSuplementacao] = useState("");
  const [suplementacaoEdicao, setSuplementacaoEdicao] = useState({
    produto: "",
    dose: "",
    frequencia: "",
  });

  // Estados para conclusão manual de registros
  const [showModalConclusaoRegistro, setShowModalConclusaoRegistro] = useState(false);
  const [registroIdConcluir, setRegistroIdConcluir] = useState(null);
  const [emailConclusaoRegistro, setEmailConclusaoRegistro] = useState("");
  const [senhaConclusaoRegistro, setSenhaConclusaoRegistro] = useState("");
  const [concluindoRegistro, setConcluindoRegistro] = useState(false);
  const [erroConclusaoRegistro, setErroConclusaoRegistro] = useState("");

  // Estados para conclusão de tratamento
  const [showModalConclusao, setShowModalConclusao] = useState(false);
  const [prontuarioIdConcluir, setProntuarioIdConcluir] = useState(null);
  const [emailConclusao, setEmailConclusao] = useState("");
  const [senhaConclusao, setSenhaConclusao] = useState("");
  const [concluindo, setConcluindo] = useState(false);
  const [erroConclusao, setErroConclusao] = useState("");

  // Estados para alteração de status do solípede
  const [novoStatus, setNovoStatus] = useState("");
  const [precisaBaixar, setPrecisaBaixar] = useState(""); // Novo: Sim/Não para baixar solípede
  const [showModalAlterarStatus, setShowModalAlterarStatus] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [erroAlterarStatus, setErroAlterarStatus] = useState("");

  // Estado para usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Estados para dieta (quando tipoObservacao === "Dieta")
  const [dietaSelecionada, setDietaSelecionada] = useState({
    fenoSoFeno: false,
    umQuintoRacao: false,
    fenoMolhado: false,
    jejum: false,
  });

  // Estados para suplementação (quando tipoObservacao === "Suplementação")
  const [suplementacao, setSuplementacao] = useState({
    produto: "",
    dose: "",
    frequencia: "",
  });

  // Estados para movimentação (quando tipoObservacao === "Movimentação")
  const [novaAlocacao, setNovaAlocacao] = useState("");
  const [showModalMovimentacao, setShowModalMovimentacao] = useState(false);
  const [senhaMovimentacao, setSenhaMovimentacao] = useState("");
  const [realizandoMovimentacao, setRealizandoMovimentacao] = useState(false);
  const [erroMovimentacao, setErroMovimentacao] = useState("");
  const opcoesMovimentacao = [
    "",
    "RPMon",
    "Barro Branco",
    "Hospital Veterinário",
    "Avare",
    "Barretos",
    "Bauru",
    "Campinas",
    "Colina",
    "Escola Equitação Exército",
    "Itapetininga",
    "Marilia",
    "Maua",
    "Presidente Prudente",
    "Ribeirão Preto",
    "Santos",
    "São Bernardo do Campo",
    "São José do Rio Preto",
    "Sorocaba",
    "Taubate",
    "Representacao",
  ];

  // Estado para paginação da Visão Geral
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Estados para paginação do Histórico
  const [paginaHistorico, setPaginaHistorico] = useState(1);
  const [itensPorPaginaHistorico, setItensPorPaginaHistorico] = useState(4);

  // Estados para paginação dos Registros por Tipo
  const [paginaRegistrosPorTipo, setPaginaRegistrosPorTipo] = useState(1);
  const [itensPorPaginaRegistros, setItensPorPaginaRegistros] = useState(4);

  // Estados para exclusão de registros
  const [showModalExclusao, setShowModalExclusao] = useState(false);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);
  const [senhaExclusao, setSenhaExclusao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  // Ref para receituário
  const receituarioRef = useRef(null);
  const [tratamentoReceituarioSelecionado, setTratamentoReceituarioSelecionado] = useState(null);

  // Estados para exames laboratoriais (quando tipoObservacao === "Exame")
  const [examesSelecionados, setExamesSelecionados] = useState({
    // Hematologia
    hemogramaCompleto: false,
    hemacias: false,
    hemoglobina: false,
    hematocrito: false,
    indices: false,
    leucograma: false,
    plaquetas: false,
    // Bioquímica - Função hepática
    ast: false,
    alt: false,
    ggt: false,
    fosfataseAlcalina: false,
    bilirrubinaTotal: false,
    bilirrubinaDireta: false,
    bilirrubinaIndireta: false,
    // Bioquímica - Função renal
    ureia: false,
    creatinina: false,
    // Bioquímica - Músculos
    ck: false,
    ldh: false,
    // Bioquímica - Metabolismo e proteínas
    proteinasTotais: false,
    albumina: false,
    globulinas: false,
    relacaoAG: false,
    // Bioquímica - Eletrólitos
    sodio: false,
    potassio: false,
    cloro: false,
    calcio: false,
    fosforo: false,
    magnesio: false,
    // Bioquímica - Outros
    glicose: false,
    colesterol: false,
    triglicerideos: false,
    lactato: false,
    // Sorologia
    aie: false,
    mormo: false,
    leptospirose: false,
    brucelose: false,
    influenzaEquina: false,
    herpesvirusEquino: false,
    raiva: false,
    encefalomieliteEquina: false,
    arteriteViralEquina: false,
    // Parasitologia
    coproparasitologico: false,
    opg: false,
    coprocultura: false,
  });


  useEffect(() => {
    const fetchSolipede = async () => {
      try {
        // Se readonly, buscar da tabela de excluídos
        const data = readonlyMode
          ? await api.obterSolipedeExcluido(numero)
          : await api.obterSolipede(numero);

        if (data && data.error) {
          setError(data.error);
          setSolipede(null);
        } else if (data) {
          setSolipede(data);
          setError(null);
          // Simular preenchimento do texto da Visão Geral
          setVisaoGeralTexto(
            `<p><strong>Nome:</strong> ${data.nome}</p>
             <p><strong>Número:</strong> ${data.numero}</p>
             <p><strong>Status:</strong> ${data.status}</p>
             <p><strong>Esquadrão:</strong> ${data.esquadrao || "N/A"}</p>
             <p><strong>Últimos registros clínicos:</strong> Nenhum registro adicionado ainda.</p>`
          );
        }
      } catch (err) {
        console.error("Erro ao buscar solípede:", err);
        setError("Erro ao carregar dados do solípede");
      } finally {
        setLoading(false);
      }
    };

    if (numero) {
      fetchSolipede();
    }
  }, [numero, readonlyMode]);

  // Função para gerar documento formatado com paginação (retorna apenas uma página por vez)
  const gerarDocumentoFormatado = (numeroPagina = 1) => {
    if (!historico || !Array.isArray(historico) || historico.length === 0) return '';

    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Primeira página: 2 registros (dados do solípede + 2 registros)
    // Páginas seguintes: 5 registros cada
    const registrosPrimeiraPagina = 2;
    const registrosPorPaginaDemais = 5;

    // Calcular total de páginas
    const registrosRestantes = Math.max(0, historico.length - registrosPrimeiraPagina);
    const paginasAdicionais = Math.ceil(registrosRestantes / registrosPorPaginaDemais);
    const totalPags = 1 + paginasAdicionais; // 1 página de dados + páginas de registros

    // Atualizar total de páginas no estado
    if (totalPaginas !== totalPags) {
      setTotalPaginas(totalPags);
    }

    // Função para gerar cabeçalho
    const gerarCabecalho = (numPag, totalP) => `
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">
          REGIMENTO DE POLÍCIA MONTADA "9 De Julho"
        </h2>
        <h3 style="margin: 5px 0; font-size: 16px; font-weight: bold;">
          FORMAÇÃO VETERINÁRIA REGIMENTAL
        </h3>
        <p style="margin: 5px 0; font-size: 12px;">PRONTUÁRIO VETERINÁRIO</p>
        <p style="margin: 5px 0; font-size: 11px; color: #666;">Página ${numPag} de ${totalP}</p>
      </div>
    `;

    // Função para gerar rodapé
    const gerarRodape = (numPag) => `
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; text-align: center; font-size: 10px; color: #666;">
        <p style="margin: 3px 0;">Documento gerado em: ${dataAtual}</p>
        <p style="margin: 3px 0;">Página ${numPag} | Total de registros: ${historico.length}</p>
      </div>
    `;

    // Página 1: Dados do Solípede + Primeiros registros
    if (numeroPagina === 1) {
      return `
        <div style="font-family: 'Times New Roman', serif; width: 21cm; height: 29.7cm; margin: 0 auto; padding: 1.5cm; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); box-sizing: border-box; overflow: hidden;">
          ${gerarCabecalho(1, totalPags)}
          
          <hr style="border: 1px solid #000; margin: 15px 0;">

          <!-- Dados do Solípede -->
          <div style="margin-bottom: 25px;">
            <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 12px; text-decoration: underline;">
              I - DADOS DO SOLÍPEDE
            </h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; width: 30%;"><strong>Nome:</strong></td>
                <td style="padding: 4px 0;">${solipede.nome}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Número:</strong></td>
                <td style="padding: 4px 0;">${solipede.numero}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Pelagem:</strong></td>
                <td style="padding: 4px 0;">${solipede.pelagem || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Sexo:</strong></td>
                <td style="padding: 4px 0;">${solipede.sexo || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Data de Nascimento:</strong></td>
                <td style="padding: 4px 0;">${solipede.DataNascimento ? new Date(solipede.DataNascimento).toLocaleDateString('pt-BR') : 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Idade:</strong></td>
                <td style="padding: 4px 0;">${calcularIdade(solipede.DataNascimento)} anos</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Esquadrão:</strong></td>
                <td style="padding: 4px 0;">${solipede.esquadrao || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Unidade:</strong></td>
                <td style="padding: 4px 0;">${solipede.alocacao || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Status:</strong></td>
                <td style="padding: 4px 0;"><strong>${solipede.status || 'N/A'}</strong></td>
              </tr>
            </table>
          </div>

          <hr style="border: 1px solid #000; margin: 15px 0;">

          <!-- Início do Histórico Clínico -->
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 12px; text-decoration: underline;">
              II - HISTÓRICO CLÍNICO E EVOLUÇÃO
            </h4>
            ${historico.slice(0, registrosPrimeiraPagina).map((registro, index) => {
        const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
        const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
        const tipo = registro.tipo ? registro.tipo.toUpperCase() : 'OBSERVAÇÃO GERAL';
        const usuario = registro.usuario_nome || 'N/A';
        const registro_re = registro.usuario_registro || '';
        const observacao = registro.observacao || 'Sem observação registrada';

        const foiEditado = registro.data_atualizacao &&
          new Date(registro.data_atualizacao).getTime() !== new Date(registro.data_criacao).getTime();

        const isConcluido = registro.status_conclusao === 'concluido';

        return `
                <div style="margin-bottom: 20px; page-break-inside: avoid; border-left: 3px solid #007bff; padding-left: 12px;">
                  <p style="margin: 0 0 6px 0; font-size: 13px;">
                    <strong>${index + 1}. ${tipo}</strong>
                    ${isConcluido ? ' <span style="color: #28a745; font-size: 11px;">[✓ CONCLUÍDO]</span>' : ''}
                    ${registro.precisa_baixar === "sim" ? ' <span style="color: #dc3545; font-size: 11px;">[⚠ BAIXOU SOLÍPEDE]</span>' : ''}
                  </p>
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">
                    <em>Data: ${dataBR} às ${horaBR}</em>
                    ${usuario !== 'N/A' ? ` | Responsável: ${usuario}${registro_re ? ' (RE: ' + registro_re + ')' : ''}` : ''}
                  </p>
                  <p style="text-align: justify; line-height: 1.5; margin: 8px 0; font-size: 12px;">
                    ${observacao}
                  </p>
                  ${registro.recomendacoes ? `
                    <div style="background-color: #fffbea; border-left: 3px solid #f0ad4e; padding: 8px; margin-top: 8px; font-size: 11px;">
                      <strong>📌 Recomendações:</strong> ${registro.recomendacoes}
                    </div>
                  ` : ''}
                  ${isConcluido && registro.usuario_conclusao_nome ? `
                    <div style="background-color: #e8f5e9; border-left: 3px solid #28a745; padding: 8px; margin-top: 8px; font-size: 11px;">
                      <strong>✓ Concluído por:</strong> ${registro.usuario_conclusao_nome}${registro.usuario_conclusao_registro ? ' (RE: ' + registro.usuario_conclusao_registro + ')' : ''}
                      ${registro.data_conclusao ? '<br/><em>Em: ' + new Date(registro.data_conclusao).toLocaleDateString('pt-BR') + ' às ' + new Date(registro.data_conclusao).toLocaleTimeString('pt-BR') + '</em>' : ''}
                    </div>
                  ` : ''}
                  ${foiEditado ? `
                    <div style="background-color: #e3f2fd; border-left: 3px solid #2196f3; padding: 8px; margin-top: 8px; font-size: 10px;">
                      <strong>✎ Atualizado em:</strong> ${new Date(registro.data_atualizacao).toLocaleDateString('pt-BR')} às ${new Date(registro.data_atualizacao).toLocaleTimeString('pt-BR')}
                      ${registro.usuario_atualizacao_nome ? '<br/><strong>Por:</strong> ' + registro.usuario_atualizacao_nome + (registro.usuario_atualizacao_registro ? ' (RE: ' + registro.usuario_atualizacao_registro + ')' : '') : ''}
                    </div>
                  ` : ''}
                </div>
              `;
      }).join('')}
          </div>

          ${gerarRodape(1)}
        </div>
      `;
    }

    // Páginas subsequentes: Continuação do histórico
    // Página 1 tem 3 registros, páginas seguintes têm 7
    const inicio = registrosPrimeiraPagina + ((numeroPagina - 2) * registrosPorPaginaDemais);
    const fim = Math.min(inicio + registrosPorPaginaDemais, historico.length);
    const registrosDaPagina = historico.slice(inicio, fim);

    return `
      <div style="font-family: 'Times New Roman', serif; width: 21cm; height: 29.7cm; margin: 0 auto; padding: 1.5cm; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); box-sizing: border-box; overflow: hidden;">
        ${gerarCabecalho(numeroPagina, totalPags)}
        
        <hr style="border: 1px solid #000; margin: 15px 0;">

        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 12px; text-decoration: underline;">
            II - HISTÓRICO CLÍNICO E EVOLUÇÃO (continuação)
          </h4>
          ${registrosDaPagina.map((registro, index) => {
      const indexGlobal = inicio + index;
      const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
      const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
      const tipo = registro.tipo ? registro.tipo.toUpperCase() : 'OBSERVAÇÃO GERAL';
      const usuario = registro.usuario_nome || 'N/A';
      const registro_re = registro.usuario_registro || '';
      const observacao = registro.observacao || 'Sem observação registrada';

      const foiEditado = registro.data_atualizacao &&
        new Date(registro.data_atualizacao).getTime() !== new Date(registro.data_criacao).getTime();

      const isConcluido = registro.status_conclusao === 'concluido';

      return `
              <div style="margin-bottom: 20px; page-break-inside: avoid; border-left: 3px solid #007bff; padding-left: 12px;">
                <p style="margin: 0 0 6px 0; font-size: 13px;">
                  <strong>${indexGlobal + 1}. ${tipo}</strong>
                  ${isConcluido ? ' <span style="color: #28a745; font-size: 11px;">[✓ CONCLUÍDO]</span>' : ''}
                  ${registro.precisa_baixar === "sim" ? ' <span style="color: #dc3545; font-size: 11px;">[⚠ BAIXOU SOLÍPEDE]</span>' : ''}
                </p>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">
                  <em>Data: ${dataBR} às ${horaBR}</em>
                  ${usuario !== 'N/A' ? ` | Responsável: ${usuario}${registro_re ? ' (RE: ' + registro_re + ')' : ''}` : ''}
                </p>
                <p style="text-align: justify; line-height: 1.5; margin: 8px 0; font-size: 12px;">
                  ${observacao}
                </p>
                ${registro.recomendacoes ? `
                  <div style="background-color: #fffbea; border-left: 3px solid #f0ad4e; padding: 8px; margin-top: 8px; font-size: 11px;">
                    <strong>📌 Recomendações:</strong> ${registro.recomendacoes}
                  </div>
                ` : ''}
                ${isConcluido && registro.usuario_conclusao_nome ? `
                  <div style="background-color: #e8f5e9; border-left: 3px solid #28a745; padding: 8px; margin-top: 8px; font-size: 11px;">
                    <strong>✓ Concluído por:</strong> ${registro.usuario_conclusao_nome}${registro.usuario_conclusao_registro ? ' (RE: ' + registro.usuario_conclusao_registro + ')' : ''}
                    ${registro.data_conclusao ? '<br/><em>Em: ' + new Date(registro.data_conclusao).toLocaleDateString('pt-BR') + ' às ' + new Date(registro.data_conclusao).toLocaleTimeString('pt-BR') + '</em>' : ''}
                  </div>
                ` : ''}
                ${foiEditado ? `
                  <div style="background-color: #e3f2fd; border-left: 3px solid #2196f3; padding: 8px; margin-top: 8px; font-size: 10px;">
                    <strong>✎ Atualizado em:</strong> ${new Date(registro.data_atualizacao).toLocaleDateString('pt-BR')} às ${new Date(registro.data_atualizacao).toLocaleTimeString('pt-BR')}
                    ${registro.usuario_atualizacao_nome ? '<br/><strong>Por:</strong> ' + registro.usuario_atualizacao_nome + (registro.usuario_atualizacao_registro ? ' (RE: ' + registro.usuario_atualizacao_registro + ')' : '') : ''}
                  </div>
                ` : ''}
              </div>
            `;
    }).join('')}
        </div>

        ${gerarRodape(numeroPagina)}
      </div>
    `;
  };

  // Função para exportar para PDF usando html2pdf (gera documento completo)
  const exportarPDF = () => {
    const element = document.createElement('div');
    // Gerar todas as páginas para exportação
    let documentoCompleto = '';
    const registrosPrimeiraPagina = 3;
    const registrosPorPaginaDemais = 7;
    const registrosRestantes = Math.max(0, historico.length - registrosPrimeiraPagina);
    const paginasAdicionais = Math.ceil(registrosRestantes / registrosPorPaginaDemais);
    const totalPags = 1 + paginasAdicionais;

    for (let i = 1; i <= totalPags; i++) {
      documentoCompleto += gerarDocumentoFormatado(i);
    }

    element.innerHTML = documentoCompleto;

    const opt = {
      margin: [15, 15],
      filename: `Prontuario_${solipede.nome}_${solipede.numero}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Função para exportar para Word usando html-docx-js (gera documento completo)
  const exportarWord = () => {
    // Gerar todas as páginas para exportação
    let documentoCompleto = '';
    const registrosPrimeiraPagina = 3;
    const registrosPorPaginaDemais = 7;
    const registrosRestantes = Math.max(0, historico.length - registrosPrimeiraPagina);
    const paginasAdicionais = Math.ceil(registrosRestantes / registrosPorPaginaDemais);
    const totalPags = 1 + paginasAdicionais;

    for (let i = 1; i <= totalPags; i++) {
      documentoCompleto += gerarDocumentoFormatado(i);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Times New Roman', serif; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid black; padding: 8px; }
            h1, h2, h3, h4 { font-family: 'Times New Roman', serif; }
          </style>
        </head>
        <body>
          ${documentoCompleto}
        </body>
      </html>
    `;

    const converted = htmlDocx.asBlob(htmlContent);
    saveAs(converted, `Prontuario_${solipede.nome}_${solipede.numero}.docx`);
  };

  // Função para gerar receituário PDF para um tratamento específico
  const gerarReceituarioPDFHandler = async (tratamento) => {
    try {
      if (!receituarioRef.current || !tratamento) {
        setMensagem({
          tipo: "danger",
          texto: "Erro ao gerar receituário. Tente novamente.",
        });
        return;
      }

      flushSync(() => {
        setTratamentoReceituarioSelecionado(tratamento);
      });

      // Atualizar o ref com os dados do tratamento antes de gerar
      receituarioRef.current.style.display = "block";

      // Aguardar um pouco para garantir que o DOM foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));

      // Usar html2pdf para gerar o PDF
      const element = receituarioRef.current;
      const opt = {
        margin: 0,
        filename: `Receituario_ID-${tratamento.id}_${solipede.nome}_${solipede.numero}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          windowWidth: 794, // Largura A4 em pixels (210mm)
          windowHeight: 1123 // Altura A4 em pixels (297mm)
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: 'avoid-all' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        receituarioRef.current.style.display = "none";
        setMensagem({
          tipo: "success",
          texto: "✅ Receituário gerado com sucesso!",
        });
        setTimeout(() => setMensagem(""), 3000);
      });
    } catch (error) {
      console.error("Erro ao gerar receituário:", error);
      if (receituarioRef.current) {
        receituarioRef.current.style.display = "none";
      }
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao gerar receituário. Tente novamente.",
      });
    }
  };

  useEffect(() => {
    async function carregarProntuario() {
      try {
        console.log("🔍 Carregando prontuário para número:", solipede.numero);

        // Se readonly, buscar prontuário arquivado
        const response = readonlyMode
          ? await api.listarProntuarioExcluido(solipede.numero)
          : await api.listarProntuario(solipede.numero);

        console.log("📦 Resposta da API:", response);
        console.log("📊 Total de registros recebidos:", response?.length);

        // Debug: verificar campos foi_responsavel_pela_baixa E precisa_baixar
        if (Array.isArray(response)) {
          response.forEach((reg, index) => {
            if (reg.tipo === "Tratamento") {
              console.log(`🩺 Tratamento ${index}:`, {
                id: reg.id,
                tipo: reg.tipo,
                foi_responsavel_pela_baixa: reg.foi_responsavel_pela_baixa,
                precisa_baixar: reg.precisa_baixar,
                typeof_precisa: typeof reg.precisa_baixar,
                observacao: reg.observacao?.substring(0, 50)
              });
            }
          });
        }

        // Garantir que response seja sempre um array e filtrar Observações Comportamentais
        const historicoFiltrado = Array.isArray(response) 
          ? response.filter(reg => reg.tipo !== "Observações Comportamentais")
          : [];
        setHistorico(historicoFiltrado);

        // Debug: mostrar tipos dos registros
        if (Array.isArray(response) && response.length > 0) {
          const tipos = response.map(r => r.tipo);
          console.log("📋 Tipos encontrados:", tipos);
          const restricoes = response.filter(r => r.tipo === "Restrições");
          console.log("🚫 Total de Restrições:", restricoes.length);
        }

        // Carregar contador de baixas pendentes
        const baixas = await api.contarBaixasPendentes(solipede.numero);
        setBaixasPendentes(baixas.total || 0);

        // Carregar contador de tratamentos em andamento
        const tratamentos = await api.contarTratamentosEmAndamento(solipede.numero);
        setTratamentosEmAndamento(tratamentos.total || 0);
      } catch (error) {
        console.error("❌ Erro ao carregar prontuário", error);
        setHistorico([]); // Define array vazio em caso de erro
      } finally {
        setLoadingHistorico(false);
      }
    }

    if (solipede?.numero) {
      carregarProntuario();
    }
  }, [solipede, readonlyMode]);

  // Carregar dados do usuário logado
  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      try {
        const dadosUsuario = JSON.parse(usuario);
        setUsuarioLogado(dadosUsuario);
        // Pré-preencher emails nos estados
        setEmailConclusao(dadosUsuario.email || "");
        setEmailConclusaoRegistro(dadosUsuario.email || "");
      } catch (error) {
        console.error("Erro ao parsear usuário:", error);
      }
    }
  }, []);

  // Atualizar visão geral quando histórico mudar ou página mudar
  useEffect(() => {
    if (historico && Array.isArray(historico) && historico.length > 0 && solipede) {
      const documentoFormatado = gerarDocumentoFormatado(paginaAtual);
      setVisaoGeralTexto(documentoFormatado);
    } else if (solipede) {
      setVisaoGeralTexto(
        `<div style="font-family: 'Times New Roman', serif; padding: 40px; text-align: center;">
          <h3>Nenhum registro clínico encontrado</h3>
          <p>Adicione o primeiro registro na aba "Novo Registro"</p>
        </div>`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historico, solipede, paginaAtual]);

  // Funções para gerenciar exames
  const handleCheckboxChange = (exame) => {
    setExamesSelecionados((prev) => ({
      ...prev,
      [exame]: !prev[exame],
    }));
  };

  const marcarTodosCategoria = (categoria) => {
    const novosExames = { ...examesSelecionados };

    switch (categoria) {
      case "hematologia":
        novosExames.hemogramaCompleto = true;
        novosExames.hemacias = true;
        novosExames.hemoglobina = true;
        novosExames.hematocrito = true;
        novosExames.indices = true;
        novosExames.leucograma = true;
        novosExames.plaquetas = true;
        break;
      case "funcaoHepatica":
        novosExames.ast = true;
        novosExames.alt = true;
        novosExames.ggt = true;
        novosExames.fosfataseAlcalina = true;
        novosExames.bilirrubinaTotal = true;
        novosExames.bilirrubinaDireta = true;
        novosExames.bilirrubinaIndireta = true;
        break;
      case "funcaoRenal":
        novosExames.ureia = true;
        novosExames.creatinina = true;
        break;
      case "musculos":
        novosExames.ck = true;
        novosExames.ldh = true;
        break;
      case "metabolismo":
        novosExames.proteinasTotais = true;
        novosExames.albumina = true;
        novosExames.globulinas = true;
        novosExames.relacaoAG = true;
        break;
      case "eletrolitos":
        novosExames.sodio = true;
        novosExames.potassio = true;
        novosExames.cloro = true;
        novosExames.calcio = true;
        novosExames.fosforo = true;
        novosExames.magnesio = true;
        break;
      case "outrosBioq":
        novosExames.glicose = true;
        novosExames.colesterol = true;
        novosExames.triglicerideos = true;
        novosExames.lactato = true;
        break;
      case "sorologia":
        novosExames.aie = true;
        novosExames.mormo = true;
        novosExames.leptospirose = true;
        novosExames.brucelose = true;
        novosExames.influenzaEquina = true;
        novosExames.herpesvirusEquino = true;
        novosExames.raiva = true;
        novosExames.encefalomieliteEquina = true;
        novosExames.arteriteViralEquina = true;
        break;
      case "parasitologia":
        novosExames.coproparasitologico = true;
        novosExames.opg = true;
        novosExames.coprocultura = true;
        break;
      default:
        break;
    }

    setExamesSelecionados(novosExames);
  };

  const handleAdicionarObservacao = async () => {
    // Se for tipo "Exame", verificar se algum exame foi selecionado
    if (tipoObservacao === "Exame") {
      const algumSelecionado = Object.values(examesSelecionados).some((v) => v === true);

      if (!algumSelecionado && !observacao.trim()) {
        setMensagem({
          tipo: "warning",
          texto: "Selecione pelo menos um exame ou adicione uma observação!",
        });
        return;
      }

      // Se houver exames selecionados, gerar o texto formatado
      if (algumSelecionado) {
        const examesLista = [];

        // Hematologia
        if (examesSelecionados.hemogramaCompleto) examesLista.push("• Hemograma completo");
        if (examesSelecionados.hemacias) examesLista.push("• Hemácias");
        if (examesSelecionados.hemoglobina) examesLista.push("• Hemoglobina");
        if (examesSelecionados.hematocrito) examesLista.push("• Hematócrito");
        if (examesSelecionados.indices) examesLista.push("• VCM, HCM, CHCM");
        if (examesSelecionados.leucograma) examesLista.push("• Leucograma");
        if (examesSelecionados.plaquetas) examesLista.push("• Plaquetas");

        // Bioquímica - Função Hepática
        if (examesSelecionados.ast) examesLista.push("• AST (TGO)");
        if (examesSelecionados.alt) examesLista.push("• ALT (TGP)");
        if (examesSelecionados.ggt) examesLista.push("• GGT");
        if (examesSelecionados.fosfataseAlcalina) examesLista.push("• FA (Fosfatase Alcalina)");
        if (examesSelecionados.bilirrubinaTotal) examesLista.push("• Bilirrubina total");
        if (examesSelecionados.bilirrubinaDireta) examesLista.push("• Bilirrubina direta");
        if (examesSelecionados.bilirrubinaIndireta) examesLista.push("• Bilirrubina indireta");

        // Bioquímica - Função Renal
        if (examesSelecionados.ureia) examesLista.push("• Ureia");
        if (examesSelecionados.creatinina) examesLista.push("• Creatinina");

        // Bioquímica - Músculos
        if (examesSelecionados.ck) examesLista.push("• CK (Creatina Quinase)");
        if (examesSelecionados.ldh) examesLista.push("• LDH");

        // Bioquímica - Metabolismo
        if (examesSelecionados.proteinasTotais) examesLista.push("• Proteínas totais");
        if (examesSelecionados.albumina) examesLista.push("• Albumina");
        if (examesSelecionados.globulinas) examesLista.push("• Globulinas");
        if (examesSelecionados.relacaoAG) examesLista.push("• Relação A/G");

        // Bioquímica - Eletrólitos
        if (examesSelecionados.sodio) examesLista.push("• Sódio (Na⁺)");
        if (examesSelecionados.potassio) examesLista.push("• Potássio (K⁺)");
        if (examesSelecionados.cloro) examesLista.push("• Cloro (Cl⁻)");
        if (examesSelecionados.calcio) examesLista.push("• Cálcio (Ca²⁺)");
        if (examesSelecionados.fosforo) examesLista.push("• Fósforo (P)");
        if (examesSelecionados.magnesio) examesLista.push("• Magnésio (Mg²⁺)");

        // Bioquímica - Outros
        if (examesSelecionados.glicose) examesLista.push("• Glicose");
        if (examesSelecionados.colesterol) examesLista.push("• Colesterol");
        if (examesSelecionados.triglicerideos) examesLista.push("• Triglicerídeos");
        if (examesSelecionados.lactato) examesLista.push("• Lactato");

        // Sorologia
        if (examesSelecionados.aie) examesLista.push("• Anemia Infecciosa Equina (AIE – Coggins)");
        if (examesSelecionados.mormo) examesLista.push("• Mormo");
        if (examesSelecionados.leptospirose) examesLista.push("• Leptospirose");
        if (examesSelecionados.brucelose) examesLista.push("• Brucelose");
        if (examesSelecionados.influenzaEquina) examesLista.push("• Influenza Equina");
        if (examesSelecionados.herpesvirusEquino) examesLista.push("• Herpesvírus Equino (EHV-1/EHV-4)");
        if (examesSelecionados.raiva) examesLista.push("• Raiva");
        if (examesSelecionados.encefalomieliteEquina) examesLista.push("• Encefalomielite Equina");
        if (examesSelecionados.arteriteViralEquina) examesLista.push("• Arterite Viral Equina");

        // Parasitologia
        if (examesSelecionados.coproparasitologico) examesLista.push("• Exame coproparasitológico");
        if (examesSelecionados.opg) examesLista.push("• OPG (Ovos Por Grama)");
        if (examesSelecionados.coprocultura) examesLista.push("• Coprocultura");

        // Montar texto formatado
        const textoExames = `SOLICITAÇÃO DE EXAMES LABORATORIAIS\n\n` +
          `Exames solicitados:\n${examesLista.join("\n")}\n\n` +
          (observacao ? `Observações adicionais: ${observacao}\n\n` : "") +
          `Data da solicitação: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`;

        // Substituir a observação pelo texto dos exames
        setObservacao(textoExames);

        // Continuar com o salvamento usando o texto gerado
        setSalvando(true);
        try {
          const response = await api.salvarProntuario({
            numero_solipede: numero,
            tipo: tipoObservacao,
            observacao: textoExames,
            recomendacoes: recomendacoes || null,
          });

          if (response.success || response.id) {
            const historicoAtualizado = await api.listarProntuario(numero);
            setHistorico(historicoAtualizado);

            setMensagem({
              tipo: "success",
              texto: "Solicitação de exames registrada com sucesso!",
            });

            // Limpar formulário
            setObservacao("");
            setRecomendacoes("");
            // Resetar checkboxes de exames
            setExamesSelecionados(Object.keys(examesSelecionados).reduce((acc, key) => {
              acc[key] = false;
              return acc;
            }, {}));
          }
        } catch (error) {
          console.error("Erro ao salvar:", error);
          setMensagem({
            tipo: "danger",
            texto: "Erro ao salvar solicitação de exames",
          });
        } finally {
          setSalvando(false);
        }
        return;
      }
    }

    // Validação para Dieta
    if (tipoObservacao === "Dieta") {
      const algumaDietaSelecionada = Object.values(dietaSelecionada).some((v) => v === true);

      if (!algumaDietaSelecionada && !observacao.trim()) {
        setMensagem({
          tipo: "warning",
          texto: "Selecione pelo menos uma opção de dieta ou adicione uma observação!",
        });
        return;
      }

      // Se houver dietas selecionadas, gerar o texto formatado
      if (algumaDietaSelecionada) {
        const dietasLista = [];

        if (dietaSelecionada.jejum) dietasLista.push("• Jejum");
        if (dietaSelecionada.meiaRacao) dietasLista.push("• 1/2 ração");
        if (dietaSelecionada.fenoSoFeno) dietasLista.push("• Feno (só feno)");
        if (dietaSelecionada.fenoSoFenoMolhado) dietasLista.push("•Somente Feno molhado");
        if (dietaSelecionada.fenoMolhadoMaisRacao) dietasLista.push("• Feno molhado + ração");

        // Montar texto formatado
        const textoDieta = `DIETA PRESCRITA\n\n` +
          `Opções de dieta:\n${dietasLista.join("\n")}\n\n` +
          (observacao ? `Observações adicionais: ${observacao}\n\n` : "") +
          `Data da prescrição: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`;

        // Usar o texto gerado
        setObservacao(textoDieta);

        // Continuar com o salvamento usando o texto gerado
        setSalvando(true);
        try {
          const response = await api.salvarProntuario({
            numero_solipede: numero,
            tipo: tipoObservacao,
            observacao: textoDieta,
            recomendacoes: null, // Dieta não usa recomendações
          });

          if (response.success || response.id) {
            const historicoAtualizado = await api.listarProntuario(numero);
            setHistorico(historicoAtualizado);

            setMensagem({
              tipo: "success",
              texto: "Dieta registrada com sucesso!",
            });

            // Limpar formulário
            setObservacao("");
            setRecomendacoes("");
            // Resetar checkboxes de dieta
            setDietaSelecionada({
              jejum: false,
              meiaRacao: false,
              fenoSoFeno: false,
              fenoSoFenoMolhado: false,
              fenoMolhadoMaisRacao: false,
            });
          }
        } catch (error) {
          console.error("Erro ao salvar:", error);
          setMensagem({
            tipo: "danger",
            texto: "Erro ao salvar dieta",
          });
        } finally {
          setSalvando(false);
        }
        return;
      }
    }

    // Validação para Suplementação
    if (tipoObservacao === "Suplementação") {
      if (!suplementacao.produto.trim() || !suplementacao.dose.trim() || !suplementacao.frequencia.trim()) {
        setMensagem({
          tipo: "warning",
          texto: "Preencha todos os campos obrigatórios da suplementação (Produto, Dose e Frequência)!",
        });
        return;
      }

      // Gerar o texto formatado
      const textoSuplementacao = `SUPLEMENTAÇÃO PRESCRITA\n\n` +
        `Produto: ${suplementacao.produto}\n` +
        `Dose: ${suplementacao.dose}\n` +
        `Frequência: ${suplementacao.frequencia}\n\n` +
        (observacao ? `Observações adicionais: ${observacao}\n\n` : "") +
        `Data da prescrição: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`;

      // Usar o texto gerado
      setObservacao(textoSuplementacao);

      // Continuar com o salvamento usando o texto gerado
      setSalvando(true);
      try {
        const response = await api.salvarProntuario({
          numero_solipede: numero,
          tipo: tipoObservacao,
          observacao: textoSuplementacao,
          recomendacoes: null, // Suplementação não usa recomendações
          data_validade: dataValidade && dataValidade.trim() !== "" ? dataValidade : null,
        });

        if (response.success || response.id) {
          const historicoAtualizado = await api.listarProntuario(numero);
          setHistorico(historicoAtualizado);

          setMensagem({
            tipo: "success",
            texto: "Suplementação registrada com sucesso!",
          });

          // Limpar formulário
          setObservacao("");
          setRecomendacoes("");
          setDataValidade("");
          // Resetar campos de suplementação
          setSuplementacao({
            produto: "",
            dose: "",
            frequencia: "",
          });
        }
      } catch (error) {
        console.error("Erro ao salvar:", error);
        setMensagem({
          tipo: "danger",
          texto: "Erro ao salvar suplementação",
        });
      } finally {
        setSalvando(false);
      }
      return;
    }

    // Validação e Processamento para Movimentação
    if (tipoObservacao === "Movimentação") {
      if (!novaAlocacao || novaAlocacao === "") {
        setMensagem({
          tipo: "warning",
          texto: "Selecione uma nova alocação antes de salvar!",
        });
        return;
      }

      if (novaAlocacao === solipede?.alocacao) {
        setMensagem({
          tipo: "warning",
          texto: "A nova alocação selecionada é igual à alocação atual!",
        });
        return;
      }

      // Abre o modal para confirmar com senha
      setShowModalMovimentacao(true);
      return;
    }

    // Validação padrão para outros tipos
    if (tipoObservacao === "Tratamento") {
      // Para tratamento, exige observação OU seleção de baixar
      if (!observacao.trim() && !precisaBaixar) {
        setMensagem({
          tipo: "warning",
          texto: "Adicione uma observação ou selecione se precisa baixar o solípede!",
        });
        return;
      }
    } else {
      // Para outros tipos, observação é obrigatória
      if (!observacao.trim()) {
        setMensagem({
          tipo: "warning",
          texto: "Adicione uma observação antes de salvar!",
        });
        return;
      }
    }

    setSalvando(true);
    try {
      console.log("📤 Enviando prontuário para servidor...");
      console.log("🔍 Tipo:", tipoObservacao, "PrecisaBaixar:", precisaBaixar);
      console.log("🔬 Diagnóstico:", diagnostico);

      const dadosEnvio = {
        numero_solipede: numero,
        tipo: tipoObservacao,
        observacao,
        diagnosticos: tipoObservacao === "Tratamento" && diagnostico ? diagnostico : null,
        recomendacoes: recomendacoes || null,
        tipo_baixa: tipoObservacao === "Baixa" && tipoBaixa ? tipoBaixa : null,
        data_lancamento: tipoObservacao === "Baixa" && dataLancamento ? dataLancamento : null,
        data_validade: (tipoObservacao === "Baixa" && dataValidade) || (tipoObservacao === "Restrições" && dataValidade) || (tipoObservacao === "Suplementação" && dataValidade) ? dataValidade : null,
        precisa_baixar: tipoObservacao === "Tratamento" && precisaBaixar ? precisaBaixar : undefined, // Envia 'sim', 'nao' ou undefined
      };

      console.log("📦 Dados completos sendo enviados:", dadosEnvio);

      const response = await api.salvarProntuario(dadosEnvio);

      console.log("📥 Resposta do servidor:", response);

      if (response.success || response.id) {
        console.log("✅ Prontuário salvo com sucesso! Recarregando histórico...");

        // Recarregar o histórico para pegar os dados do usuário
        const historicoAtualizado = await api.listarProntuario(numero);
        // Filtrar Observações Comportamentais
        const historicoFiltrado = historicoAtualizado.filter(reg => reg.tipo !== "Observações Comportamentais");
        console.log("📖 Histórico atualizado:", historicoFiltrado);

        // Debug: verificar se precisa_baixar está vindo no histórico atualizado
        const ultimoTratamento = historicoFiltrado.find(h => h.tipo === "Tratamento");
        if (ultimoTratamento) {
          console.log("🔍 DEBUG - Último tratamento retornado:", {
            id: ultimoTratamento.id,
            precisa_baixar: ultimoTratamento.precisa_baixar,
            foi_responsavel_pela_baixa: ultimoTratamento.foi_responsavel_pela_baixa
          });
        }

        setHistorico(historicoFiltrado);

        // Se for baixa, atualizar contador e status do solípede
        if (tipoObservacao === "Baixa") {
          const baixas = await api.contarBaixasPendentes(numero);
          setBaixasPendentes(baixas.total || 0);

          // Recarregar dados do solípede para atualizar status
          const dadosAtualizados = await api.obterSolipede(numero);
          setSolipede(dadosAtualizados);
        }

        // Recarregar dados do solípede se alterou status (baixou)
        if (precisaBaixar === "sim") {
          const dadosAtualizados = await api.obterSolipede(numero);
          setSolipede(dadosAtualizados);
        }

        setObservacao("");
        setDiagnostico("");
        setRecomendacoes("");
        setDataLancamento("");
        setDataValidade("");
        setTipoBaixa("");
        setPrecisaBaixar(""); // Resetar pergunta de baixa
        setMensagem({
          tipo: "success",
          texto: precisaBaixar === "sim"
            ? "✅ Tratamento salvo e solípede baixado com sucesso!"
            : "✅ Tratamento salvo com sucesso!",
        });

        setTimeout(() => setMensagem(""), 3000);
      } else {
        console.error("❌ Erro: resposta sem ID ou sucesso");
        setMensagem({ tipo: "danger", texto: "❌ Erro ao salvar observação" });
      }
    } catch (err) {
      console.error("❌ Erro ao salvar observação:", err);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao conectar com o servidor",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !solipede) {
    return (
      <Container className="mt-4">
        <Card className="border-danger">
          <Card.Body>
            <p className="text-danger mb-0">
              ❌ {error || "Solípede não encontrado"}
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Função para abrir modal de edição (geral - Tratamento)
  const handleAbrirEdicao = (registro) => {
    setRegistroEditando(registro);

    if (registro.tipo === "Restrições") {
      setObservacaoEdicaoRestricao(registro.observacao || "");
      setDataValidadeEdicaoRestricao(registro.data_validade ? registro.data_validade.split('T')[0] : "");
      setShowModalEdicaoRestricao(true);
    } else if (registro.tipo === "Dieta") {
      // Parse da observação para extrair checkboxes
      const obs = registro.observacao || "";
      setDietaEdicao({
        fenoSoFeno: obs.includes("Feno (só feno)"),
        umQuintoRacao: obs.includes("1/2 ração"),
        fenoMolhado: obs.includes("Feno molhado"),
        jejum: obs.includes("Jejum"),
      });

      // Extrair apenas as observações adicionais (texto após "Observações adicionais:")
      const obsAdicionaisMatch = obs.match(/Observações adicionais:\s*([\s\S]*?)(?=\n\nData da prescrição:|$)/i);
      setObservacaoEdicaoDieta(obsAdicionaisMatch ? obsAdicionaisMatch[1].trim() : "");

      setShowModalEdicaoDieta(true);
    } else if (registro.tipo === "Suplementação") {
      // Parse da observação para extrair dados estruturados
      const obs = registro.observacao || "";
      const produtoMatch = obs.match(/Produto:\s*(.+?)(?=\n|Dose:|$)/i);
      const doseMatch = obs.match(/Dose:\s*(.+?)(?=\n|Frequência:|$)/i);
      const freqMatch = obs.match(/Frequência:\s*(.+?)(?=\n|$)/i);

      setSuplementacaoEdicao({
        produto: produtoMatch ? produtoMatch[1].trim() : "",
        dose: doseMatch ? doseMatch[1].trim() : "",
        frequencia: freqMatch ? freqMatch[1].trim() : "",
      });

      // Extrair apenas as observações adicionais (texto após "Observações adicionais:")
      const obsAdicionaisMatch = obs.match(/Observações adicionais:\s*([\s\S]*?)(?=\n\nData da prescrição:|$)/i);
      setObservacaoEdicaoSuplementacao(obsAdicionaisMatch ? obsAdicionaisMatch[1].trim() : "");
      setDataValidadeEdicaoSuplementacao(registro.data_validade ? registro.data_validade.split('T')[0] : "");

      setShowModalEdicaoSuplementacao(true);
    } else {
      // Tratamento e outros
      setObservacaoEdicao(registro.observacao || "");
      setDiagnosticoEdicao(registro.diagnosticos || "");
      setRecomendacoesEdicao(registro.recomendacoes || "");
      setDataValidadeEdicao(registro.data_validade ? registro.data_validade.split('T')[0] : "");
      setShowModalEdicao(true);
    }
  };

  // Função para fechar modal de edição
  const handleFecharEdicao = () => {
    setShowModalEdicao(false);
    setRegistroEditando(null);
    setObservacaoEdicao("");
    setDiagnosticoEdicao("");
    setRecomendacoesEdicao("");
    setDataValidadeEdicao("");
    setNovoStatus(""); // Resetar seleção de status
  };

  // Função para fechar modal de edição de Restrição
  const handleFecharEdicaoRestricao = () => {
    setShowModalEdicaoRestricao(false);
    setRegistroEditando(null);
    setObservacaoEdicaoRestricao("");
    setDataValidadeEdicaoRestricao("");
  };

  // Função para fechar modal de edição de Dieta
  const handleFecharEdicaoDieta = () => {
    setShowModalEdicaoDieta(false);
    setRegistroEditando(null);
    setObservacaoEdicaoDieta("");
    setDietaEdicao({
      fenoSoFeno: false,
      umQuintoRacao: false,
      fenoMolhado: false,
      jejum: false,
    });
  };

  // Função para fechar modal de edição de Suplementação
  const handleFecharEdicaoSuplementacao = () => {
    setShowModalEdicaoSuplementacao(false);
    setRegistroEditando(null);
    setObservacaoEdicaoSuplementacao("");
    setDataValidadeEdicaoSuplementacao("");
    setSuplementacaoEdicao({
      produto: "",
      dose: "",
      frequencia: "",
    });
  };

  // Função para salvar edição
  const handleSalvarEdicao = async () => {
    if (!observacaoEdicao.trim()) {
      setMensagem({
        tipo: "warning",
        texto: "A observação não pode estar vazia!",
      });
      return;
    }

    try {
      console.log("💾 Salvando edição do registro:", registroEditando.id);
      console.log("🏷️  Tipo do registro:", registroEditando.tipo);

      // Construir objeto de dados dinamicamente
      const dadosAtualizacao = {
        observacao: observacaoEdicao,
        recomendacoes: recomendacoesEdicao || null,
      };

      // Adicionar diagnóstico se for Tratamento
      if (registroEditando.tipo === "Tratamento") {
        dadosAtualizacao.diagnosticos = diagnosticoEdicao || null;
      }

      // Apenas incluir data_validade se for uma Restrição
      if (registroEditando.tipo === "Restrições") {
        // Converter string vazia em null
        dadosAtualizacao.data_validade = dataValidadeEdicao && dataValidadeEdicao.trim() !== ""
          ? dataValidadeEdicao
          : null;
        console.log("📅 Data validade sendo enviada:", dadosAtualizacao.data_validade);
      }

      console.log("📝 Dados enviados:", dadosAtualizacao);

      const response = await api.atualizarProntuario(registroEditando.id, dadosAtualizacao);

      console.log("✅ Resposta do backend:", response);

      if (response.success) {
        // Se foi selecionado um novo status, alterar
        if (novoStatus && novoStatus.trim() !== "") {
          console.log("🔄 Alterando status do solípede para:", novoStatus);
          try {
            await api.atualizarSolipede(numero, {
              status: novoStatus,
              numero: numero // Garantir que o número está sendo enviado
            });
            console.log("✅ Status alterado com sucesso para:", novoStatus);

            // Atualizar estado local do solípede
            setSolipede(prev => ({
              ...prev,
              status: novoStatus
            }));
          } catch (statusError) {
            console.error("❌ Erro ao alterar status:", statusError);
            setMensagem({
              tipo: "warning",
              texto: "⚠️ Registro atualizado, mas erro ao alterar status",
            });
          }
        }

        // Recarregar histórico
        console.log("🔄 Recarregando histórico...");
        const historicoAtualizado = await api.listarProntuario(numero);
        console.log("📦 Histórico atualizado recebido:", historicoAtualizado);
        console.log("📊 Total após atualização:", historicoAtualizado?.length);
        setHistorico(historicoAtualizado);

        setMensagem({
          tipo: "success",
          texto: novoStatus ? "✅ Registro e status atualizados com sucesso!" : "✅ Registro atualizado com sucesso!",
        });

        handleFecharEdicao();
        setTimeout(() => setMensagem(""), 3000);
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar registro:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao atualizar registro",
      });
    }
  };

  // Função para salvar edição de Restrição
  const handleSalvarEdicaoRestricao = async () => {
    if (!observacaoEdicaoRestricao.trim()) {
      setMensagem({
        tipo: "warning",
        texto: "A observação não pode estar vazia!",
      });
      return;
    }

    try {
      const dadosAtualizacao = {
        observacao: observacaoEdicaoRestricao,
        data_validade: dataValidadeEdicaoRestricao && dataValidadeEdicaoRestricao.trim() !== ""
          ? dataValidadeEdicaoRestricao
          : null,
      };

      const response = await api.atualizarProntuario(registroEditando.id, dadosAtualizacao);

      if (response.success) {
        const historicoAtualizado = await api.listarProntuario(numero);
        setHistorico(historicoAtualizado);
        setMensagem({
          tipo: "success",
          texto: "✅ Restrição atualizada com sucesso!",
        });
        handleFecharEdicaoRestricao();
        setTimeout(() => setMensagem(""), 3000);
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar restrição:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao atualizar restrição",
      });
    }
  };

  // Função para salvar edição de Dieta
  const handleSalvarEdicaoDieta = async () => {
    const dietasSelecionadas = [];
    if (dietaEdicao.fenoSoFeno) dietasSelecionadas.push("🌾 Feno (só feno)");
    if (dietaEdicao.umQuintoRacao) dietasSelecionadas.push("🌾 1/2 ração");
    if (dietaEdicao.fenoMolhado) dietasSelecionadas.push("💧 Feno molhado");
    if (dietaEdicao.jejum) dietasSelecionadas.push("🚫 Jejum");

    if (dietasSelecionadas.length === 0 && !observacaoEdicaoDieta.trim()) {
      setMensagem({
        tipo: "warning",
        texto: "Selecione pelo menos uma opção de dieta ou adicione uma observação!",
      });
      return;
    }

    try {
      let observacaoFinal = "";
      if (dietasSelecionadas.length > 0) {
        observacaoFinal = "Dieta prescrita:\n" + dietasSelecionadas.join("\n");
      }
      if (observacaoEdicaoDieta.trim()) {
        observacaoFinal += (observacaoFinal ? "\n\nObservações adicionais:\n" : "") + observacaoEdicaoDieta;
      }

      const dadosAtualizacao = {
        observacao: observacaoFinal,
      };

      const response = await api.atualizarProntuario(registroEditando.id, dadosAtualizacao);

      if (response.success) {
        const historicoAtualizado = await api.listarProntuario(numero);
        setHistorico(historicoAtualizado);
        setMensagem({
          tipo: "success",
          texto: "✅ Dieta atualizada com sucesso!",
        });
        handleFecharEdicaoDieta();
        setTimeout(() => setMensagem(""), 3000);
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar dieta:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao atualizar dieta",
      });
    }
  };

  // Função para salvar edição de Suplementação
  const handleSalvarEdicaoSuplementacao = async () => {
    if (!suplementacaoEdicao.produto.trim() || !suplementacaoEdicao.dose.trim() || !suplementacaoEdicao.frequencia.trim()) {
      setMensagem({
        tipo: "warning",
        texto: "Preencha todos os campos obrigatórios (Produto, Dose e Frequência)!",
      });
      return;
    }

    try {
      let observacaoFinal = `💊 Suplementação Prescrita:\n\nProduto: ${suplementacaoEdicao.produto}\nDose: ${suplementacaoEdicao.dose}\nFrequência: ${suplementacaoEdicao.frequencia}`;

      if (observacaoEdicaoSuplementacao.trim()) {
        observacaoFinal += `\n\nObservações adicionais:\n${observacaoEdicaoSuplementacao}`;
      }

      const dadosAtualizacao = {
        observacao: observacaoFinal,
        data_validade: dataValidadeEdicaoSuplementacao && dataValidadeEdicaoSuplementacao.trim() !== ""
          ? dataValidadeEdicaoSuplementacao
          : null,
      };

      const response = await api.atualizarProntuario(registroEditando.id, dadosAtualizacao);

      if (response.success) {
        const historicoAtualizado = await api.listarProntuario(numero);
        setHistorico(historicoAtualizado);
        setMensagem({
          tipo: "success",
          texto: "✅ Suplementação atualizada com sucesso!",
        });
        handleFecharEdicaoSuplementacao();
        setTimeout(() => setMensagem(""), 3000);
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar suplementação:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao atualizar suplementação",
      });
    }
  };

  // Função para verificar se restrição está expirada (usa data_validade)
  const isRestricaoExpirada = (dataValidade) => {
    if (!dataValidade) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = new Date(dataValidade);
    validade.setHours(0, 0, 0, 0);
    return validade < hoje;
  };

  // Função para fechar modal de alteração de status
  const handleFecharModalAlterarStatus = () => {
    setShowModalAlterarStatus(false);
    setNovoStatus("");
    setErroAlterarStatus("");
  };

  // Função para confirmar alteração de status
  const handleConfirmarAlterarStatus = async () => {
    if (!novoStatus) {
      setErroAlterarStatus("Selecione um status");
      return;
    }

    setAlterandoStatus(true);
    setErroAlterarStatus("");

    try {
      console.log("🔄 Alterando status do solípede:", numero, "para:", novoStatus);

      const response = await api.atualizarStatusSolipede(numero, novoStatus);

      if (response.success) {
        // Recarregar dados do solípede
        const dadosAtualizados = await api.obterSolipede(numero);
        setSolipede(dadosAtualizados);

        // Exibir mensagem com informações de auditoria
        const mensagemDetalhada = response.usuario
          ? `✅ ${response.message}\nAlterado por: ${response.usuario}\nEm: ${new Date(response.dataAtualizacao).toLocaleString('pt-BR')}`
          : `✅ ${response.message}`;

        setMensagem({
          tipo: "success",
          texto: mensagemDetalhada,
        });

        handleFecharModalAlterarStatus();
        setTimeout(() => setMensagem(""), 5000);
      } else {
        setErroAlterarStatus("Erro ao alterar status");
      }
    } catch (error) {
      console.error("❌ Erro ao alterar status:", error);
      setErroAlterarStatus("Erro ao alterar status do solípede");
    } finally {
      setAlterandoStatus(false);
    }
  };

  // Função para abrir modal de conclusão manual
  const handleAbrirModalConclusaoRegistro = (registroId) => {
    setRegistroIdConcluir(registroId);
    setSenhaConclusaoRegistro("");
    setShowModalConclusaoRegistro(true);
    setErroConclusaoRegistro("");
  };

  // Função para fechar modal de conclusão manual
  const handleFecharModalConclusaoRegistro = () => {
    setShowModalConclusaoRegistro(false);
    setRegistroIdConcluir(null);
    setEmailConclusaoRegistro("");
    setSenhaConclusaoRegistro("");
    setErroConclusaoRegistro("");
  };

  // Função para abrir modal de exclusão
  const handleAbrirModalExclusao = (registro) => {
    setRegistroParaExcluir(registro);
    setSenhaExclusao("");
    setShowModalExclusao(true);
    setErroExclusao("");
  };

  // Função para fechar modal de exclusão
  const handleFecharModalExclusao = () => {
    setShowModalExclusao(false);
    setRegistroParaExcluir(null);
    setSenhaExclusao("");
    setErroExclusao("");
  };

  // Função para excluir registro
  const handleExcluirRegistro = async (e) => {
    e.preventDefault();
    setExcluindo(true);
    setErroExclusao("");

    console.log("🗑️ Iniciando exclusão de registro:", registroParaExcluir?.id);

    try {
      const response = await api.excluirRegistroProntuario(registroParaExcluir.id, senhaExclusao);

      console.log("📦 Resposta da exclusão:", response);

      if (response.success) {
        console.log("✅ REGISTRO EXCLUÍDO COM SUCESSO");
        alert("✅ Registro excluído com sucesso!");

        // Fechar modal
        handleFecharModalExclusao();

        // Recarregar histórico
        const historicoAtualizado = await api.listarProntuario(numero);
        setHistorico(Array.isArray(historicoAtualizado) ? historicoAtualizado : []);

        // Recarregar dados do solípede (caso o status tenha mudado)
        const solipedeAtualizado = await api.obterSolipede(numero);
        if (solipedeAtualizado && !solipedeAtualizado.error) {
          setSolipede(solipedeAtualizado);
        }

        // Recarregar contadores
        const baixas = await api.contarBaixasPendentes(numero);
        setBaixasPendentes(baixas.total || 0);
        const tratamentos = await api.contarTratamentosEmAndamento(numero);
        setTratamentosEmAndamento(tratamentos.total || 0);

        setMensagem({
          tipo: "success",
          texto: "Registro excluído com sucesso!",
        });
      } else {
        console.log("❌ ERRO AO EXCLUIR");
        let erroMsg = response.error || "Erro ao excluir registro";

        if (response.error === "Senha inválida") {
          erroMsg = "🔒 Senha incorreta. Por favor, tente novamente.";
        } else if (response.error === "Registro não encontrado") {
          erroMsg = "❌ Registro não encontrado no sistema.";
        } else if (response.error === "Usuário não autenticado") {
          erroMsg = "🔐 Sua sessão expirou. Por favor, faça login novamente.";
        }

        console.log("📝 Mensagem de erro:", erroMsg);
        setErroExclusao(erroMsg);
      }
    } catch (error) {
      console.error("💥 EXCEÇÃO CAPTURADA:", error);
      setErroExclusao("Erro ao conectar com o servidor");
    } finally {
      setExcluindo(false);
    }
  };

  // Função para concluir registro manualmente
  const handleConcluirRegistro = async (e) => {
    e.preventDefault();
    setConcluindoRegistro(true);
    setErroConclusaoRegistro("");

    console.log("🚀 Iniciando conclusão de registro:", registroIdConcluir);

    try {
      const response = await api.concluirRegistro(registroIdConcluir, senhaConclusaoRegistro);

      console.log("📦 Resposta completa:", response);
      console.log("✅ response.success:", response.success);
      console.log("❌ response.error:", response.error);
      console.log("🔖 response.code:", response.code);

      if (response.success) {
        console.log("✅ SUCESSO CONFIRMADO - Recarregando dados...");
        alert("✅ Registro concluído com sucesso!");

        // Fechar modal e recarregar dados
        handleFecharModalConclusaoRegistro();

        // Recarregar histórico e dados do solípede
        const historicoAtualizado = await api.listarProntuario(numero);
        setHistorico(Array.isArray(historicoAtualizado) ? historicoAtualizado : []);

        // Recarregar dados do solípede
        const solipedeAtualizado = await api.obterSolipede(numero);
        if (solipedeAtualizado && !solipedeAtualizado.error) {
          setSolipede(solipedeAtualizado);
        }
      } else {
        console.log("❌ ERRO DETECTADO");
        // Tratamento de erros específicos
        let erroMsg = response.error || "Erro ao concluir registro";

        if (response.code === "ALREADY_CONCLUDED") {
          erroMsg = "⚠️ Este registro já foi concluído anteriormente.";
        } else if (response.error === "Senha inválida") {
          erroMsg = "🔒 Senha incorreta. Por favor, tente novamente.";
        } else if (response.error === "Registro não encontrado") {
          erroMsg = "❌ Registro não encontrado no sistema.";
        } else if (response.error === "Usuário não autenticado") {
          erroMsg = "🔐 Sua sessão expirou. Por favor, faça login novamente.";
        }

        console.log("📝 Mensagem de erro:", erroMsg);
        setErroConclusaoRegistro(erroMsg);
      }
    } catch (error) {
      console.error("💥 EXCEÇÃO CAPTURADA:", error);
      setErroConclusaoRegistro("Erro ao conectar com o servidor");
    } finally {
      setConcluindoRegistro(false);
    }
  };

  // Função para fechar modal de movimentação
  const handleFecharModalMovimentacao = () => {
    setSenhaMovimentacao("");
    setErroMovimentacao("");
    setShowModalMovimentacao(false);
  };

  // Função para confirmar movimentação com senha
  const handleConfirmarMovimentacao = async (e) => {
    e.preventDefault();
    setErroMovimentacao("");
    setRealizandoMovimentacao(true);

    console.log("🔄 Iniciando movimentação...");
    console.log("   - numero:", numero);
    console.log("   - novaAlocacao:", novaAlocacao);
    console.log("   - observacao:", observacao);

    try {
      // 1️⃣ PRIMEIRO: Salvar o registro de Movimentação no prontuário
      console.log("📝 Salvando registro de movimentação no prontuário...");
      const responseProntuario = await api.salvarProntuario({
        numero_solipede: numero,
        tipo: "Movimentação",
        observacao: observacao || `Alocação alterada de "${solipede.alocacao}" para "${novaAlocacao}"`,
        recomendacoes: null,
        origem: solipede.alocacao,
        destino: novaAlocacao,
      });

      console.log("✅ Registro no prontuário criado:", responseProntuario);

      // 2️⃣ SEGUNDO: Executar a movimentação (atualizar alocação + histórico de movimentação)
      const response = await api.movimentacaoBulk({
        numeros: [numero],
        novaAlocacao: novaAlocacao,
        observacao: observacao || null,
        senha: senhaMovimentacao,
      });

      console.log("✅ Resposta da API movimentação:", response);

      if (response && response.success) {
        console.log("🔄 Atualizando dados do solípede...");

        // Aguarda um pouco para garantir que o banco salvou tudo
        await new Promise(resolve => setTimeout(resolve, 500));

        // Atualizar dados do solípede
        const solipedeAtualizado = await api.obterSolipede(numero);
        console.log("✅ Solípede atualizado:", solipedeAtualizado);
        setSolipede(solipedeAtualizado);

        console.log("🔄 Atualizando histórico...");
        // Atualizar histórico
        const historicoAtualizado = await api.listarProntuario(numero);
        console.log("✅ Histórico atualizado:", historicoAtualizado);
        console.log("   - Total de registros:", historicoAtualizado.length);
        console.log("   - Último registro:", historicoAtualizado[0]);
        setHistorico(historicoAtualizado);

        setMensagem({
          tipo: "success",
          texto: `Movimentação realizada com sucesso! Alocação alterada de "${solipede.alocacao}" para "${novaAlocacao}".`,
        });

        // Limpar formulário e fechar modal
        setObservacao("");
        setNovaAlocacao("");
        handleFecharModalMovimentacao();

        console.log("✅ Movimentação concluída com sucesso!");
      } else {
        console.error("❌ Resposta sem sucesso:", response);
        setErroMovimentacao("Erro ao processar movimentação");
      }
    } catch (error) {
      console.error("❌ Erro ao realizar movimentação:", error);
      setErroMovimentacao(error.message || "Senha incorreta ou erro ao realizar movimentação.");
    } finally {
      setRealizandoMovimentacao(false);
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "N/A";
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesNasc = nascimento.getMonth();
    const mesHoje = hoje.getMonth();

    if (
      mesHoje < mesNasc ||
      (mesHoje === mesNasc && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
    }
    return idade;
  };

  const statusBg = (status) => {
    if (!status) return "secondary";
    const s = status.toLowerCase();
    if (s.includes("ativo")) return "success";
    if (s.includes("baix")) return "danger";
    return "warning";
  };

  // useEffect para gerar documento formatado

  const handleAbrirModalConclusao = (prontuarioId) => {
    setProntuarioIdConcluir(prontuarioId);
    setEmailConclusao("");
    setSenhaConclusao("");
    setErroConclusao("");
    setShowModalConclusao(true);
  };

  const handleFecharModalConclusao = () => {
    setShowModalConclusao(false);
    setProntuarioIdConcluir(null);
    setEmailConclusao("");
    setSenhaConclusao("");
    setErroConclusao("");
  };

  const handleConcluirTratamento = async (e) => {
    e.preventDefault();
    setErroConclusao("");
    setConcluindo(true);

    console.log("📝 Tentando concluir tratamento:", {
      prontuarioId: prontuarioIdConcluir,
      usuario: usuarioLogado?.nome
    });

    try {
      const response = await api.concluirTratamento(
        prontuarioIdConcluir,
        senhaConclusao
      );

      console.log("📦 Resposta da API:", response);
      console.log("✅ response.success:", response.success);
      console.log("❌ response.error:", response.error);
      console.log("🔖 response.code:", response.code);

      if (response.success) {
        console.log("✅ SUCESSO CONFIRMADO - Recarregando página...");
        // Mensagem com informações sobre tratamentos restantes
        let mensagemTexto = `✅ ${response.message}\n\nConcluído por: ${response.usuario_conclusao.nome}`;
        if (response.tratamentosRestantes > 0) {
          mensagemTexto += `\n⚠️ O solípede continuará com status "Baixado" até que todos os ${response.tratamentosRestantes} tratamento(s) sejam concluídos.`;
        }

        alert(mensagemTexto);

        // Fechar modal e recarregar dados
        handleFecharModalConclusao();

        // Recarregar histórico e dados do solípede
        const historicoAtualizado = await api.listarProntuario(numero);
        setHistorico(Array.isArray(historicoAtualizado) ? historicoAtualizado : []);

        // Recarregar dados do solípede para atualizar status
        const solipedeAtualizado = await api.obterSolipede(numero);
        if (solipedeAtualizado && !solipedeAtualizado.error) {
          setSolipede(solipedeAtualizado);
        }

        // Recarregar contadores
        const baixas = await api.contarBaixasPendentes(numero);
        setBaixasPendentes(baixas.total || 0);
        const tratamentos = await api.contarTratamentosEmAndamento(numero);
        setTratamentosEmAndamento(tratamentos.total || 0);
      } else {
        console.log("❌ ERRO DETECTADO");
        // Tratamento de erros específicos
        let erroMsg = response.error || "Erro ao concluir tratamento";

        if (response.code === "ALREADY_CONCLUDED") {
          erroMsg = "⚠️ Este tratamento já foi concluído anteriormente.";
        } else if (response.error === "Senha inválida") {
          erroMsg = "🔒 Senha incorreta. Por favor, tente novamente.";
        } else if (response.error === "Tratamento não encontrado") {
          erroMsg = "❌ Tratamento não encontrado no sistema.";
        } else if (response.error === "Usuário não autenticado") {
          erroMsg = "🔐 Sua sessão expirou. Por favor, faça login novamente.";
        }

        console.error("❌ Erro na resposta:", erroMsg);
        console.log("📝 Mensagem de erro:", erroMsg);
        setErroConclusao(erroMsg);
      }
    } catch (error) {
      console.error("💥 EXCEÇÃO CAPTURADA:", error);
      setErroConclusao("❌ Erro ao conectar com o servidor. Verifique sua conexão.");
    } finally {
      setConcluindo(false);
    }
  };

  return (
    <div className={`container-fluid mt-4 mb-5 ${readonlyMode ? 'readonly-mode' : ''}`}>
      {/* Estilo para desabilitar todos os botões em modo readonly */}
      {readonlyMode && (
        <style>{`
          .readonly-mode button:not(.btn-danger):not(.btn-primary):not(.btn-outline-primary):not([data-allow]),
          .readonly-mode .btn-outline-secondary,
          .readonly-mode .btn-success,
          .readonly-mode .btn-warning {
            opacity: 0.5;
            pointer-events: none;
            cursor: not-allowed;
          }
        `}</style>
      )}

      {/* Banner de modo somente leitura */}
      {readonlyMode && (
        <Alert variant="warning" className="d-flex align-items-center shadow-sm mb-4">
          <BsArchive className="me-3" size={24} />
          <div>
            <strong>📋 Prontuário Arquivado - Modo Somente Leitura</strong>
            <p className="mb-0 mt-1">
              Este solípede foi excluído do sistema. Você está visualizando um histórico completo,
              mas não é possível fazer novos lançamentos ou edições.
            </p>
          </div>
        </Alert>
      )}

      {/* Cabeçalho */}
      <Row className="mb-4">
        <Col>
          <h3 className="fw-bold mb-1">📘 Prontuário Veterinário {readonlyMode && "(Arquivado)"}</h3>
          <small className="text-muted">
            Histórico clínico e evolução do solípede
          </small>
        </Col>
      </Row>

      <Row className="g-4">
        {/* COLUNA ESQUERDA */}
        <Col lg={4}>
          {/* Card Principal */}
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body className="text-center pt-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "#e9ecef",
                  fontSize: "50px"
                }}
              >
                🐴
              </div>
              <h5 className="fw-bold mb-1">{solipede.nome || "N/A"}</h5>
              <p className="text-muted mb-3">Nº {solipede.numero}</p>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Badge
                  bg={statusBg(solipede.status)}
                  className="mb-3"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  <BsCheckCircle className="me-1" />
                  {solipede.status || "N/A"}
                </Badge>
                {tratamentosEmAndamento > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-14px",
                      backgroundColor: "#ff8c00",
                      color: "white",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "bold",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      cursor: "help"
                    }}
                    title="Tratamento em aberto"
                  >
                    {tratamentosEmAndamento}
                  </div>
                )}
              </div>

              {baixasPendentes > 0 && (
                <div className="mt-2">
                  <Badge
                    bg="warning"
                    text="dark"
                    className="w-100"
                    style={{ fontSize: "11px", padding: "8px" }}
                  >
                    <BsExclamationTriangle className="me-1" />
                    {baixasPendentes} {baixasPendentes === 1 ? "baixa pendente" : "baixas pendentes"}
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* RESTRIÇÕES LANÇADAS APARECE NO PERFIL DO SOLÍPEDE */}
          {historico.filter(reg => reg.tipo === "Restrições").length > 0 ? (
            <Card className="shadow-sm border-0 mb-3">
              <Card.Header className="bg-warning text-dark border-0 fw-semibold d-flex align-items-center gap-2 opacity-90">
                <LuTriangleAlert size={18} />
                <span>Restrições</span>
              </Card.Header>

              <ListGroup variant="flush">
                {historico
                  .filter(reg => reg.tipo === "Restrições")
                  .map((reg, index) => (
                    <ListGroup.Item key={index} className="py-3">
                      <small className="text-muted d-block mb-1">
                        {reg.descricao || "Restrição registrada"}
                      </small>
                      <span className="fw-semibold">
                        {reg.observacao || "Ativa"}
                      </span>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Card>
          ) : null}




          {/* Dados Pessoais */}
          <Card className="shadow-sm border-0 mb-3">
            <Card.Header className="bg-light border-0 fw-bold">
              📋 Informações Pessoais
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <small className="text-muted d-block">Sexo</small>
                <strong>{solipede.sexo || "N/A"}</strong>
              </ListGroup.Item>
              <ListGroup.Item>
                <small className="text-muted d-block">Data de Nascimento</small>
                <strong>
                  {solipede.DataNascimento
                    ? new Date(solipede.DataNascimento).toLocaleDateString(
                      "pt-BR"
                    )
                    : "N/A"}
                </strong>
              </ListGroup.Item>
              <ListGroup.Item>
                <small className="text-muted d-block">Idade</small>
                <strong>{calcularIdade(solipede.DataNascimento)} anos</strong>
              </ListGroup.Item>
              <ListGroup.Item>
                <small className="text-muted d-block">Pelagem</small>
                <strong>{solipede.pelagem || "N/A"}</strong>
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* Alocação e Esquadrão */}
          <Card className="shadow-sm border-0 mb-3">
            <Card.Header className="bg-light border-0 fw-bold">
              🏢 Alocação
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <small className="text-muted d-block">Unidade</small>
                <strong>{solipede.alocacao || "N/A"}</strong>
              </ListGroup.Item>
              <ListGroup.Item>
                <small className="text-muted d-block">Esquadrão</small>
                <strong>{solipede.esquadrao || "N/A"}</strong>
              </ListGroup.Item>
              <ListGroup.Item>
                <small className="text-muted d-block">Origem</small>
                <strong>{solipede.origem || "N/A"}</strong>
              </ListGroup.Item>

            </ListGroup>
          </Card>


        </Col>

        {/* COLUNA DIREITA */}
        <Col lg={8}>
          <Tab.Container defaultActiveKey="visaoGeral">
            <Nav variant="pills" className="mb-3 border-bottom">
              <Nav.Item>
                <Nav.Link eventKey="visaoGeral" className="fw-bold">
                  📘 Visão Geral
                </Nav.Link>
              </Nav.Item>
              {!readonlyMode && (
                <Nav.Item>
                  <Nav.Link eventKey="novo" className="fw-bold">
                    <BsPlusCircle className="me-2" />
                    Novo Registro
                  </Nav.Link>
                </Nav.Item>
              )}
              <Nav.Item>
                <Nav.Link eventKey="historico" className="fw-bold">
                  <BsClockHistory className="me-2" />
                  Histórico ({historico.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="porTipo" className="fw-bold">
                  📊 Registros por Tipo
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {mensagem && (
                <Alert
                  variant={mensagem.tipo}
                  dismissible
                  onClose={() => setMensagem("")}
                  className="mb-3"
                >
                  {mensagem.texto}
                </Alert>
              )}

              {/* TAB: VISÃO GERAL */}
              <Tab.Pane eventKey="visaoGeral">
                {loadingHistorico ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <>
                    {/* Botões de Exportação */}
                    <div className="d-flex gap-2 mb-3">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={exportarPDF}
                        disabled={!historico || historico.length === 0}
                        data-allow="true"
                      >
                        <BsFilePdf className="me-2" />
                        Exportar PDF
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={exportarWord}
                        disabled={!historico || historico.length === 0}
                        data-allow="true"
                      >
                        <BsFileWord className="me-2" />
                        Exportar Word
                      </Button>
                    </div>

                    <Card className="shadow-sm border-0">
                      <Card.Body style={{ backgroundColor: '#f8f9fa' }}>
                        <div
                          dangerouslySetInnerHTML={{ __html: visaoGeralTexto }}
                          style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '5px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />

                        {/* Navegação de Páginas */}
                        {historico && historico.length > 0 && totalPaginas > 1 && (
                          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                              disabled={paginaAtual === 1}
                              style={{ minWidth: '120px' }}
                            >
                              ← Página Anterior
                            </Button>

                            <div className="text-center">
                              <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                                Página {paginaAtual} de {totalPaginas}
                              </Badge>
                            </div>

                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                              disabled={paginaAtual === totalPaginas}
                              style={{ minWidth: '120px' }}
                            >
                              Próxima Página →
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </>
                )}
              </Tab.Pane>

              {/* TAB: NOVO REGISTRO */}
              {!readonlyMode && (
                <Tab.Pane eventKey="novo">
                  <Card className="shadow-sm border-0">
                    <Card.Header className="bg-light border-0 fw-bold">
                      Adicionar Observação Clínica
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Tipo de Observação
                          </Form.Label>
                          <Form.Select
                            size="sm"
                            value={tipoObservacao}
                            onChange={(e) => setTipoObservacao(e.target.value)}
                          >
                            {/* <option>Consulta Clínica</option> */}
                            <option>Tratamento</option>
                            <option>Restrições</option>
                            <option>Dieta</option>
                            <option>Suplementação</option>
                            <option>Movimentação</option>
                            {/* <option>Exame</option>
                            <option>Vacinação</option>
                          <option>Vermifugação</option>
                          <option>Exames AIE / Mormo</option>
                          <option>Observações Comportamentais</option> */}
                          </Form.Select>
                        </Form.Group>

                            {tipoObservacao === "Tratamento" && <ProntuarioTratamento />}
                            {tipoObservacao === "Restrições" && <ProntuarioRestricao />}
                            {tipoObservacao === "Dieta" && <ProntuarioDieta />}
                            {tipoObservacao === "Suplementação" && <ProntuarioSuplementacao />}
                            {tipoObservacao === "Movimentação" && <ProntuarioMovimentacao />}
                      </Form>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              )}

              {/* TAB: HISTÓRICO */}
              <Tab.Pane eventKey="historico">
                 <HistoricoProntuarioRestricoes /> 
                 <HistoricoProntuarioTratamento />
                 <HistoricoProntuarioDieta />
                 <HistoricoProntuarioSuplementacao />
                 <HistoricoProntuarioMovimentacao />
              </Tab.Pane>

              {/* TAB: REGISTROS POR TIPO */}
              <Tab.Pane eventKey="porTipo">
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Tab.Container defaultActiveKey="vacinacao">
                      <Nav variant="pills" className="mb-3">
                        {/* <Nav.Item>
                          <Nav.Link eventKey="consulta" className="me-2">
                            🩺 Consulta Clínica
                          </Nav.Link>
                        </Nav.Item> */}
                        <Nav.Item>
                          <Nav.Link eventKey="tratamento" className="me-2">
                            💊 Tratamento
                          </Nav.Link>
                        </Nav.Item>
                        {/* <Nav.Item>
                          <Nav.Link eventKey="exame" className="me-2">
                            🔬 Exame
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                        <Nav.Link eventKey="vermifugacao" className="me-2">
                        💊 Vermifugação
                        </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                        <Nav.Link eventKey="aie" className="me-2">
                        🧪 Exames AIE/Mormo
                        </Nav.Link>
                        </Nav.Item> */}
                        <Nav.Item>
                          <Nav.Link eventKey="vacinacao" className="me-2">
                            💉 Vacinação
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="restricoes">
                            ⚠️ Restrições
                          </Nav.Link>
                        </Nav.Item>
                        {/*Menu navegavel registro por tipos Dieta*/}
                        <Nav.Item>
                          <Nav.Link eventKey="dieta">
                            Dieta
                          </Nav.Link>
                        </Nav.Item>
                        {/* Menu navegavel registro por tipos Suplementação */}
                        <Nav.Item>
                          <Nav.Link eventKey="suplementacao">
                            Suplementação
                          </Nav.Link>
                        </Nav.Item>
                        {/* Menu navegavel registro por tipos Movimentações */}
                        <Nav.Item>
                          <Nav.Link eventKey="movimentacao">
                            🔄 Movimentações
                          </Nav.Link>
                        </Nav.Item>

                      </Nav>

                      {/* Controles de paginação dos Registros por Tipo */}
                      <div className="d-flex justify-content-between align-items-center my-3 p-3 bg-light rounded">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold" style={{ fontSize: '14px' }}>Registros por página:</span>
                          <Form.Select
                            size="sm"
                            value={itensPorPaginaRegistros}
                            onChange={(e) => {
                              setItensPorPaginaRegistros(Number(e.target.value));
                              setPaginaRegistrosPorTipo(1);
                            }}
                            style={{ width: '80px' }}
                          >
                            <option value={4}>4</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={99999}>Todos</option>
                          </Form.Select>
                        </div>
                      </div>

                      <Tab.Content>
                        {/* SUB-TAB: CONSULTA CLÍNICA */}
                        <Tab.Pane eventKey="consulta">
                          {historico.filter(reg => reg.tipo === "Consulta Clínica").length === 0 ? (
                            <Alert variant="info" className="text-center">
                              🩺 Nenhum registro de consulta clínica adicionado ainda
                            </Alert>
                          ) : (
                            historico.filter(reg => reg.tipo === "Consulta Clínica").map((registro) => {
                              const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                              const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                              const isConcluido = registro.status_conclusao === 'concluido';

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-primary">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="primary" className="mb-2">🩺 Consulta Clínica</Badge>
                                        {isConcluido && (
                                          <Badge bg="success" className="mb-2 ms-2">
                                            <BsCheckCircle className="me-1" />
                                            Concluída
                                          </Badge>
                                        )}
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
                                        {isConcluido && registro.usuario_conclusao_nome && (
                                          <p className="text-success mb-0" style={{ fontSize: "11px" }}>
                                            ✅ Concluído por: <strong>{registro.usuario_conclusao_nome}</strong> ({registro.usuario_conclusao_registro})
                                            <br />
                                            📅 {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                          </p>
                                        )}
                                      </Col>
                                      <Col xs="auto">
                                        <div className="d-flex gap-2">
                                          {!isConcluido && (
                                            <Button
                                              size="sm"
                                              variant="outline-success"
                                              onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                            >
                                              <BsCheckCircle className="me-1" />
                                              Concluir
                                            </Button>
                                          )}
                                          <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => handleAbrirEdicao(registro)}
                                          >
                                            <BsPlusCircle className="me-1" />
                                            Editar
                                          </Button>
                                        </div>
                                      </Col>
                                    </Row>
                                    <hr />
                                    <p style={{
                                      fontSize: "14px",
                                      lineHeight: "1.6",
                                      textDecoration: isConcluido ? "none" : "none",
                                      color: isConcluido ? "#999" : "inherit"
                                    }}>
                                      {registro.observacao}
                                    </p>
                                    {registro.recomendacoes && (
                                      <div className="bg-warning bg-opacity-10 p-2 rounded border-start border-warning">
                                        <small className="text-muted">
                                          <strong>📌 Recomendação:</strong>{" "}
                                          <span style={{
                                            textDecoration: isConcluido ? "none" : "none"
                                          }}>
                                            {registro.recomendacoes}
                                          </span>
                                        </small>
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              );
                            })
                          )}
                        </Tab.Pane>

                        {/* SUB-TAB: TRATAMENTO */}
                        <Tab.Pane eventKey="tratamento">
                          {(() => {
                            const registrosFiltrados = historico.filter(reg => reg.tipo === "Tratamento");
                            if (registrosFiltrados.length === 0) {
                              return (
                                <Alert variant="info" className="text-center">
                                  💊 Nenhum registro de tratamento adicionado ainda
                                </Alert>
                              );
                            }

                            const inicio = (paginaRegistrosPorTipo - 1) * itensPorPaginaRegistros;
                            const fim = inicio + itensPorPaginaRegistros;
                            const registrosPaginados = registrosFiltrados.slice(inicio, fim);
                            const totalPaginasRegistros = Math.ceil(registrosFiltrados.length / itensPorPaginaRegistros);

                            return (
                              <>
                                <div className="mb-3">
                                  <Badge bg="info" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                    Total: {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                {registrosPaginados.map((registro) => {
                                  const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                                  const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                                  const isConcluido = registro.status_conclusao === 'concluido';
                                  const mostrarBotaoConcluir = !isConcluido;

                                  return (
                                    <Card
                                      key={registro.id}
                                      className="shadow-sm border-0 mb-3 border-start border-4 border-danger"
                                      style={{
                                        backgroundColor: registro.precisa_baixar === "sim" ? "#fff5f5" : "white"
                                      }}
                                    >
                                      <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                          <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                              <Badge
                                                bg="danger"
                                                className="bg-opacity-10"
                                                text="danger"
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "600",
                                                  textTransform: "uppercase",
                                                  letterSpacing: "0.5px"
                                                }}
                                              >
                                                Tratamento
                                              </Badge>

                                              {isConcluido && (
                                                <Badge
                                                  bg="success"
                                                  className="bg-opacity-10"
                                                  text="success"
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  <BsCheckCircle className="me-1" style={{ fontSize: "10px" }} />
                                                  Concluída
                                                </Badge>
                                              )}

                                              {registro.precisa_baixar === "sim" && !isConcluido && (
                                                <Badge
                                                  bg="danger"
                                                  className="bg-opacity-10"
                                                  text="danger"
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  ⚠️ Baixou solípede
                                                </Badge>
                                              )}

                                              {registro.precisa_baixar === "nao" && !isConcluido && (
                                                <Badge
                                                  bg="secondary"
                                                  className="bg-opacity-10"
                                                  text="secondary"
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  ✓ Sem baixa
                                                </Badge>
                                              )}
                                            </div>

                                            <div className="text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                              <BsClockHistory className="me-1" style={{ fontSize: "11px" }} />
                                              {dataBR} às {horaBR}
                                            </div>
                                          </div>

                                          {!isConcluido && (
                                            <div className="d-flex gap-2">
                                              {mostrarBotaoConcluir && (
                                                <Button
                                                  size="sm"
                                                  variant="outline-success"
                                                  onClick={() => handleAbrirModalConclusao(registro.id)}
                                                  style={{
                                                    fontSize: "11px",
                                                    padding: "4px 10px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  <BsCheckCircle className="me-1" />
                                                  Concluir
                                                </Button>
                                              )}
                                              <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => handleAbrirEdicao(registro)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsPencilSquare className="me-1" />
                                                Editar
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleAbrirModalExclusao(registro)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsArchive className="me-1" />
                                                Excluir
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline-info"
                                                onClick={() => gerarReceituarioPDFHandler(registro)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsPrinter className="me-1" />
                                                Receituário
                                              </Button>
                                            </div>
                                          )}
                                        </div>

                                        <div className="bg-light p-3 rounded mb-3">
                                          <p
                                            className="mb-0"
                                            style={{
                                              fontSize: "14px",
                                              lineHeight: "1.8",
                                              whiteSpace: "pre-line",
                                              color: isConcluido ? "#999" : "#333"
                                            }}
                                          >
                                            {registro.observacao}
                                          </p>
                                        </div>

                                        {registro.recomendacoes && (
                                          <Alert variant="warning" className="mb-3">
                                            <strong>📌 Recomendações:</strong>
                                            <div className="mt-2" style={{ fontSize: "14px" }}>
                                              {registro.recomendacoes}
                                            </div>
                                          </Alert>
                                        )}

                                        {isConcluido && registro.usuario_conclusao_nome && (
                                          <div className="mb-3 p-2 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                            <small className="text-muted d-block">Concluído por</small>
                                            <span style={{ fontSize: "13px", fontWeight: "500" }}>
                                              {registro.usuario_conclusao_nome}
                                              {registro.usuario_conclusao_registro && <> (RE: {registro.usuario_conclusao_registro})</>}
                                            </span>
                                            {registro.data_conclusao && (
                                              <>
                                                <br />
                                                <small className="text-muted">
                                                  {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                                </small>
                                              </>
                                            )}
                                          </div>
                                        )}

                                        <div className="mt-3 pt-3 border-top">
                                          <Row>
                                            <Col md={6}>
                                              <small className="text-muted d-block mb-1">Responsável</small>
                                              <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                                                {registro.usuario_nome || "Sistema"}
                                                {registro.usuario_registro && (
                                                  <small className="text-muted ms-2">RE: {registro.usuario_registro}</small>
                                                )}
                                              </p>
                                            </Col>
                                          </Row>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  );
                                })}

                                {/* Navegação de páginas */}
                                {totalPaginasRegistros > 1 && (
                                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.max(1, prev - 1))}
                                      disabled={paginaRegistrosPorTipo === 1}
                                      style={{ minWidth: '120px' }}
                                    >
                                      ← Anterior
                                    </Button>

                                    <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                                      Página {paginaRegistrosPorTipo} de {totalPaginasRegistros}
                                    </Badge>

                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.min(totalPaginasRegistros, prev + 1))}
                                      disabled={paginaRegistrosPorTipo === totalPaginasRegistros}
                                      style={{ minWidth: '120px' }}
                                    >
                                      Próxima →
                                    </Button>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </Tab.Pane>

                        {/* SUB-TAB: EXAME */}
                        <Tab.Pane eventKey="exame">
                          {historico.filter(reg => reg.tipo === "Exame").length === 0 ? (
                            <Alert variant="info" className="text-center">
                              🔬 Nenhum registro de exame adicionado ainda
                            </Alert>
                          ) : (
                            historico.filter(reg => reg.tipo === "Exame").map((registro) => {
                              const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                              const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                              const isConcluido = registro.status_conclusao === 'concluido';
                              const mostrarBotaoConcluir = !isConcluido;

                              return (
                                <Card
                                  key={registro.id}
                                  className="shadow-sm border-0 mb-3 border-start border-4 border-secondary"
                                >
                                  <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                          <Badge
                                            bg="secondary"
                                            className="bg-opacity-10"
                                            text="secondary"
                                            style={{
                                              fontSize: "11px",
                                              padding: "4px 10px",
                                              fontWeight: "600",
                                              textTransform: "uppercase",
                                              letterSpacing: "0.5px"
                                            }}
                                          >
                                            Exame
                                          </Badge>

                                          {isConcluido && (
                                            <Badge
                                              bg="success"
                                              className="bg-opacity-10"
                                              text="success"
                                              style={{
                                                fontSize: "10px",
                                                padding: "4px 8px",
                                                fontWeight: "500"
                                              }}
                                            >
                                              <BsCheckCircle className="me-1" style={{ fontSize: "10px" }} />
                                              Concluído
                                            </Badge>
                                          )}
                                        </div>

                                        <div className="text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                          <BsClockHistory className="me-1" style={{ fontSize: "11px" }} />
                                          {dataBR} às {horaBR}
                                        </div>
                                      </div>

                                      <div className="d-flex gap-2">
                                        {mostrarBotaoConcluir && (
                                          <Button
                                            size="sm"
                                            variant="outline-success"
                                            onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                            style={{
                                              fontSize: "11px",
                                              padding: "4px 10px",
                                              fontWeight: "500"
                                            }}
                                          >
                                            <BsCheckCircle className="me-1" />
                                            Concluir
                                          </Button>
                                        )}
                                        {!isConcluido && (
                                          <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            onClick={() => handleAbrirEdicao(registro)}
                                            style={{
                                              fontSize: "11px",
                                              padding: "4px 10px",
                                              fontWeight: "500"
                                            }}
                                          >
                                            <BsPencilSquare className="me-1" />
                                            Editar
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-light p-3 rounded mb-3">
                                      <p
                                        className="mb-0"
                                        style={{
                                          fontSize: "14px",
                                          lineHeight: "1.8",
                                          whiteSpace: "pre-line",
                                          color: isConcluido ? "#999" : "#333"
                                        }}
                                      >
                                        {registro.observacao}
                                      </p>
                                    </div>

                                    {registro.recomendacoes && (
                                      <Alert variant="warning" className="mb-3">
                                        <strong>📌 Recomendações:</strong>
                                        <div className="mt-2" style={{ fontSize: "14px" }}>
                                          {registro.recomendacoes}
                                        </div>
                                      </Alert>
                                    )}

                                    {isConcluido && registro.usuario_conclusao_nome && (
                                      <div className="mb-3 p-2 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                        <small className="text-muted d-block">Concluído por</small>
                                        <span style={{ fontSize: "13px", fontWeight: "500" }}>
                                          {registro.usuario_conclusao_nome}
                                          {registro.usuario_conclusao_registro && <> (RE: {registro.usuario_conclusao_registro})</>}
                                        </span>
                                        {registro.data_conclusao && (
                                          <>
                                            <br />
                                            <small className="text-muted">
                                              {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                            </small>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    <div className="mt-3 pt-3 border-top">
                                      <Row>
                                        <Col md={6}>
                                          <small className="text-muted d-block mb-1">Responsável</small>
                                          <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                                            {registro.usuario_nome || "Sistema"}
                                            {registro.usuario_registro && (
                                              <small className="text-muted ms-2">RE: {registro.usuario_registro}</small>
                                            )}
                                          </p>
                                        </Col>
                                      </Row>
                                    </div>
                                  </Card.Body>
                                </Card>
                              );
                            })
                          )}
                        </Tab.Pane>

                        {/* SUB-TAB: VACINAÇÃO */}
                        <Tab.Pane eventKey="vacinacao">
                          {historico.filter(reg => reg.tipo === "Vacinação").length === 0 ? (
                            <Alert variant="info" className="text-center">
                              💉 Nenhum registro de vacinação adicionado ainda
                            </Alert>
                          ) : (
                            historico.filter(reg => reg.tipo === "Vacinação").map((registro) => {
                              const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                              const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                              const isConcluido = registro.status_conclusao === 'concluido';
                              const mostrarBotaoConcluir = !isConcluido;

                              return (
                                <Card
                                  key={registro.id}
                                  className="shadow-sm border-0 mb-3 border-start border-4 border-success"
                                >
                                  <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                          <Badge
                                            bg="success"
                                            className="bg-opacity-10"
                                            text="success"
                                            style={{
                                              fontSize: "11px",
                                              padding: "4px 10px",
                                              fontWeight: "600",
                                              textTransform: "uppercase",
                                              letterSpacing: "0.5px"
                                            }}
                                          >
                                            Vacinação
                                          </Badge>

                                          {isConcluido && (
                                            <Badge
                                              bg="success"
                                              className="bg-opacity-10"
                                              text="success"
                                              style={{
                                                fontSize: "10px",
                                                padding: "4px 8px",
                                                fontWeight: "500"
                                              }}
                                            >
                                              <BsCheckCircle className="me-1" style={{ fontSize: "10px" }} />
                                              Concluída
                                            </Badge>
                                          )}
                                        </div>

                                        <div className="text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                          <BsClockHistory className="me-1" style={{ fontSize: "11px" }} />
                                          {dataBR} às {horaBR}
                                        </div>
                                      </div>

                                      {!isConcluido && (
                                        <div className="d-flex gap-2">
                                          {mostrarBotaoConcluir && (
                                            <Button
                                              size="sm"
                                              variant="outline-success"
                                              onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                              style={{
                                                fontSize: "11px",
                                                padding: "4px 10px",
                                                fontWeight: "500"
                                              }}
                                            >
                                              <BsCheckCircle className="me-1" />
                                              Concluir
                                            </Button>
                                          )}
                                          <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            onClick={() => handleAbrirEdicao(registro)}
                                            style={{
                                              fontSize: "11px",
                                              padding: "4px 10px",
                                              fontWeight: "500"
                                            }}
                                          >
                                            <BsPencilSquare className="me-1" />
                                            Editar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleAbrirModalExclusao(registro)}
                                            style={{
                                              fontSize: "11px",
                                              padding: "4px 10px",
                                              fontWeight: "500"
                                            }}
                                          >
                                            <BsArchive className="me-1" />
                                            Excluir
                                          </Button>
                                        </div>
                                      )}
                                    </div>

                                    <div className="bg-light p-3 rounded mb-3">
                                      <p
                                        className="mb-0"
                                        style={{
                                          fontSize: "14px",
                                          lineHeight: "1.8",
                                          whiteSpace: "pre-line",
                                          color: isConcluido ? "#999" : "#333"
                                        }}
                                      >
                                        {registro.observacao}
                                      </p>
                                    </div>

                                    {registro.recomendacoes && (
                                      <Alert variant="warning" className="mb-3">
                                        <strong>📌 Recomendações:</strong>
                                        <div className="mt-2" style={{ fontSize: "14px" }}>
                                          {registro.recomendacoes}
                                        </div>
                                      </Alert>
                                    )}

                                    {isConcluido && registro.usuario_conclusao_nome && (
                                      <div className="mb-3 p-2 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                        <small className="text-muted d-block">Concluído por</small>
                                        <span style={{ fontSize: "13px", fontWeight: "500" }}>
                                          {registro.usuario_conclusao_nome}
                                          {registro.usuario_conclusao_registro && <> (RE: {registro.usuario_conclusao_registro})</>}
                                        </span>
                                        {registro.data_conclusao && (
                                          <>
                                            <br />
                                            <small className="text-muted">
                                              {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                            </small>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    <div className="mt-3 pt-3 border-top">
                                      <Row>
                                        <Col md={6}>
                                          <small className="text-muted d-block mb-1">Responsável</small>
                                          <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                                            {registro.usuario_nome || "Sistema"}
                                            {registro.usuario_registro && (
                                              <small className="text-muted ms-2">RE: {registro.usuario_registro}</small>
                                            )}
                                          </p>
                                        </Col>
                                      </Row>
                                    </div>
                                  </Card.Body>
                                </Card>
                              );
                            })
                          )}
                        </Tab.Pane>

                        {/* SUB-TAB: VERMIFUGAÇÃO */}
                        <Tab.Pane eventKey="vermifugacao">
                          {historico.filter(reg => reg.tipo === "Vermifugação").length === 0 ? (
                            <Alert variant="info" className="text-center">
                              💊 Nenhum registro de vermifugação adicionado ainda
                            </Alert>
                          ) : (
                            historico.filter(reg => reg.tipo === "Vermifugação").map((registro) => {
                              const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                              const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                              const isConcluido = registro.status_conclusao === 'concluido';

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-info">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="info" className="mb-2">💊 Vermifugação</Badge>
                                        {isConcluido && (
                                          <Badge bg="success" className="mb-2 ms-2">
                                            <BsCheckCircle className="me-1" />
                                            Concluída
                                          </Badge>
                                        )}
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
                                        {isConcluido && registro.usuario_conclusao_nome && (
                                          <p className="text-success mb-0" style={{ fontSize: "11px" }}>
                                            ✅ Concluído por: <strong>{registro.usuario_conclusao_nome}</strong> ({registro.usuario_conclusao_registro})
                                            <br />
                                            📅 {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                          </p>
                                        )}
                                      </Col>
                                      <Col xs="auto">
                                        <div className="d-flex gap-2">
                                          {!isConcluido && (
                                            <Button
                                              size="sm"
                                              variant="outline-success"
                                              onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                            >
                                              <BsCheckCircle className="me-1" />
                                              Concluir
                                            </Button>
                                          )}
                                          <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => handleAbrirEdicao(registro)}
                                          >
                                            <BsPlusCircle className="me-1" />
                                            Editar
                                          </Button>
                                        </div>
                                      </Col>
                                    </Row>
                                    <hr />
                                    <p style={{
                                      fontSize: "14px",
                                      lineHeight: "1.6",
                                      textDecoration: isConcluido ? "none" : "none",
                                      color: isConcluido ? "#999" : "inherit"
                                    }}>
                                      {registro.observacao}
                                    </p>
                                    {registro.recomendacoes && (
                                      <div className="bg-warning bg-opacity-10 p-2 rounded border-start border-warning">
                                        <small className="text-muted">
                                          <strong>📌 Recomendação:</strong>{" "}
                                          <span style={{
                                            textDecoration: isConcluido ? "none" : "none"
                                          }}>
                                            {registro.recomendacoes}
                                          </span>
                                        </small>
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              );
                            })
                          )}
                        </Tab.Pane>

                        {/* SUB-TAB: EXAMES AIE/MORMO */}
                        <Tab.Pane eventKey="aie">
                          {historico.filter(reg => reg.tipo === "Exames AIE / Mormo").length === 0 ? (
                            <Alert variant="info" className="text-center">
                              🧪 Nenhum registro de exames AIE/Mormo adicionado ainda
                            </Alert>
                          ) : (
                            historico.filter(reg => reg.tipo === "Exames AIE / Mormo").map((registro) => {
                              const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                              const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                              const isConcluido = registro.status_conclusao === 'concluido';

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-warning">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="warning" className="mb-2">🧪 Exames AIE / Mormo</Badge>
                                        {isConcluido && (
                                          <Badge bg="success" className="mb-2 ms-2">
                                            <BsCheckCircle className="me-1" />
                                            Concluído
                                          </Badge>
                                        )}
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
                                        {isConcluido && registro.usuario_conclusao_nome && (
                                          <p className="text-success mb-0" style={{ fontSize: "11px" }}>
                                            ✅ Concluído por: <strong>{registro.usuario_conclusao_nome}</strong> ({registro.usuario_conclusao_registro})
                                            <br />
                                            📅 {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                          </p>
                                        )}
                                      </Col>
                                      <Col xs="auto">
                                        <div className="d-flex gap-2">
                                          {!isConcluido && (
                                            <Button
                                              size="sm"
                                              variant="outline-success"
                                              onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                            >
                                              <BsCheckCircle className="me-1" />
                                              Concluir
                                            </Button>
                                          )}
                                          <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => handleAbrirEdicao(registro)}
                                          >
                                            <BsPlusCircle className="me-1" />
                                            Editar
                                          </Button>
                                        </div>
                                      </Col>
                                    </Row>
                                    <hr />
                                    <p style={{
                                      fontSize: "14px",
                                      lineHeight: "1.6",
                                      textDecoration: isConcluido ? "none" : "none",
                                      color: isConcluido ? "#999" : "inherit"
                                    }}>
                                      {registro.observacao}
                                    </p>
                                    {registro.recomendacoes && (
                                      <div className="bg-warning bg-opacity-10 p-2 rounded border-start border-warning">
                                        <small className="text-muted">
                                          <strong>📌 Recomendação:</strong>{" "}
                                          <span style={{
                                            textDecoration: isConcluido ? "none" : "none"
                                          }}>
                                            {registro.recomendacoes}
                                          </span>
                                        </small>
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              );
                            })
                          )}
                        </Tab.Pane>

                        {/* SUB-TAB: RESTRIÇÕES */}
                        <Tab.Pane eventKey="restricoes">
                          {(() => {
                            const registrosFiltrados = historico.filter(reg => reg.tipo === "Restrições");
                            if (registrosFiltrados.length === 0) {
                              return (
                                <Alert variant="info" className="text-center">
                                  ⚠️ Nenhum registro de restrições adicionado ainda
                                </Alert>
                              );
                            }

                            const inicio = (paginaRegistrosPorTipo - 1) * itensPorPaginaRegistros;
                            const fim = inicio + itensPorPaginaRegistros;
                            const registrosPaginados = registrosFiltrados.slice(inicio, fim);
                            const totalPaginasRegistros = Math.ceil(registrosFiltrados.length / itensPorPaginaRegistros);

                            return (
                              <>
                                <div className="mb-3">
                                  <Badge bg="info" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                    Total: {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                {registrosPaginados.map((registro) => {
                                  const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                                  const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                                  const isRestricaoExpiradaReg = isRestricaoExpirada(registro.data_validade);
                                  const isConcluido = registro.status_conclusao === 'concluido';
                                  const mostrarBotaoConcluir = !isConcluido && !isRestricaoExpiradaReg;

                                  return (
                                    <Card
                                      key={registro.id}
                                      className="shadow-sm border-0 mb-3 border-start border-4 border-warning"
                                    >
                                      <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                          <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                              <Badge
                                                bg="warning"
                                                className="bg-opacity-10"
                                                text="warning"
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "600",
                                                  textTransform: "uppercase",
                                                  letterSpacing: "0.5px"
                                                }}
                                              >
                                                Restrições
                                              </Badge>

                                              {(isRestricaoExpiradaReg || isConcluido) && (
                                                <Badge
                                                  bg="success"
                                                  className="bg-opacity-10"
                                                  text="success"
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  <BsCheckCircle className="me-1" style={{ fontSize: "10px" }} />
                                                  Concluída
                                                </Badge>
                                              )}

                                              {registro.data_validade && (
                                                <Badge
                                                  bg={isRestricaoExpiradaReg ? "danger" : "info"}
                                                  className="bg-opacity-10"
                                                  text={isRestricaoExpiradaReg ? "danger" : "info"}
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  📅 Validade: {registro.data_validade && registro.data_validade !== null && registro.data_validade !== "" 
                                                    ? new Date(registro.data_validade).toLocaleDateString('pt-BR')
                                                    : "-"}
                                                  {isRestricaoExpiradaReg && " (Expirada)"}
                                                </Badge>
                                              )}
                                            </div>

                                            <div className="text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                              <BsClockHistory className="me-1" style={{ fontSize: "11px" }} />
                                              {dataBR} às {horaBR}
                                            </div>
                                          </div>

                                          <div className="d-flex gap-2">
                                            {mostrarBotaoConcluir && (
                                              <Button
                                                size="sm"
                                                variant="outline-success"
                                                onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsCheckCircle className="me-1" />
                                                Concluir
                                              </Button>
                                            )}
                                            {!isConcluido && (
                                              <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => handleAbrirEdicao(registro)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsPencilSquare className="me-1" />
                                                Editar
                                              </Button>
                                            )}
                                          </div>
                                        </div>

                                        <div className="bg-light p-3 rounded mb-3">
                                          <p
                                            className="mb-0"
                                            style={{
                                              fontSize: "14px",
                                              lineHeight: "1.8",
                                              whiteSpace: "pre-line",
                                              color: (isRestricaoExpiradaReg || isConcluido) ? "#999" : "#333"
                                            }}
                                          >
                                            {registro.observacao}
                                          </p>
                                        </div>

                                        {registro.recomendacoes && (
                                          <Alert variant="warning" className="mb-3">
                                            <strong>📌 Recomendações:</strong>
                                            <div className="mt-2" style={{ fontSize: "14px" }}>
                                              {registro.recomendacoes}
                                            </div>
                                          </Alert>
                                        )}

                                        {isConcluido && registro.usuario_conclusao_nome && (
                                          <div className="mb-3 p-2 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                            <small className="text-muted d-block">Concluído por</small>
                                            <span style={{ fontSize: "13px", fontWeight: "500" }}>
                                              {registro.usuario_conclusao_nome}
                                              {registro.usuario_conclusao_registro && <> (RE: {registro.usuario_conclusao_registro})</>}
                                            </span>
                                            {registro.data_conclusao && (
                                              <>
                                                <br />
                                                <small className="text-muted">
                                                  {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                                </small>
                                              </>
                                            )}
                                          </div>
                                        )}

                                        <div className="mt-3 pt-3 border-top">
                                          <Row>
                                            <Col md={6}>
                                              <small className="text-muted d-block mb-1">Responsável</small>
                                              <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                                                {registro.usuario_nome || "Sistema"}
                                                {registro.usuario_registro && (
                                                  <small className="text-muted ms-2">RE: {registro.usuario_registro}</small>
                                                )}
                                              </p>
                                            </Col>
                                          </Row>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  );
                                })}

                                {/* Navegação de páginas */}
                                {totalPaginasRegistros > 1 && (
                                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.max(1, prev - 1))}
                                      disabled={paginaRegistrosPorTipo === 1}
                                      style={{ minWidth: '120px' }}
                                    >
                                      ← Anterior
                                    </Button>

                                    <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                                      Página {paginaRegistrosPorTipo} de {totalPaginasRegistros}
                                    </Badge>

                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.min(totalPaginasRegistros, prev + 1))}
                                      disabled={paginaRegistrosPorTipo === totalPaginasRegistros}
                                      style={{ minWidth: '120px' }}
                                    >
                                      Próxima →
                                    </Button>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </Tab.Pane>

                        {/* SUB-TAB: Dieta */}
                        <Tab.Pane eventKey="dieta">
                          {(() => {
                            const registrosFiltrados = historico.filter(reg => reg.tipo === "Dieta");
                            if (registrosFiltrados.length === 0) {
                              return (
                                <Alert variant="info" className="text-center">
                                  🥕 Nenhum registro de dieta adicionado ainda
                                </Alert>
                              );
                            }

                            const inicio = (paginaRegistrosPorTipo - 1) * itensPorPaginaRegistros;
                            const fim = inicio + itensPorPaginaRegistros;
                            const registrosPaginados = registrosFiltrados.slice(inicio, fim);
                            const totalPaginasRegistros = Math.ceil(registrosFiltrados.length / itensPorPaginaRegistros);

                            return (
                              <>
                                <div className="mb-3">
                                  <Badge bg="info" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                    Total: {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                {registrosPaginados.map((registro) => {
                                  const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                                  const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                                  const isConcluido = registro.status_conclusao === 'concluido';
                                  const mostrarBotaoConcluir = !isConcluido;

                                  return (
                                    <Card
                                      key={registro.id}
                                      className="shadow-sm border-0 mb-3 border-start border-4 border-success"
                                    >
                                      <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                          <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                              <Badge
                                                bg="success"
                                                className="bg-opacity-10"
                                                text="success"
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "600",
                                                  textTransform: "uppercase",
                                                  letterSpacing: "0.5px"
                                                }}
                                              >
                                                Dieta
                                              </Badge>

                                              {isConcluido && (
                                                <Badge
                                                  bg="success"
                                                  className="bg-opacity-10"
                                                  text="success"
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  <BsCheckCircle className="me-1" style={{ fontSize: "10px" }} />
                                                  Concluída
                                                </Badge>
                                              )}
                                            </div>

                                            <div className="text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                              <BsClockHistory className="me-1" style={{ fontSize: "11px" }} />
                                              {dataBR} às {horaBR}
                                            </div>
                                          </div>

                                          <div className="d-flex gap-2">
                                            {mostrarBotaoConcluir && (
                                              <Button
                                                size="sm"
                                                variant="outline-success"
                                                onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsCheckCircle className="me-1" />
                                                Concluir
                                              </Button>
                                            )}
                                            {!isConcluido && (
                                              <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => handleAbrirEdicao(registro)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsPencilSquare className="me-1" />
                                                Editar
                                              </Button>
                                            )}
                                          </div>
                                        </div>

                                        <div className="bg-light p-3 rounded mb-3">
                                          <p
                                            className="mb-0"
                                            style={{
                                              fontSize: "14px",
                                              lineHeight: "1.8",
                                              whiteSpace: "pre-line",
                                              color: isConcluido ? "#999" : "#333"
                                            }}
                                          >
                                            {registro.observacao}
                                          </p>
                                        </div>

                                        {registro.recomendacoes && (
                                          <Alert variant="warning" className="mb-3">
                                            <strong>📌 Recomendações:</strong>
                                            <div className="mt-2" style={{ fontSize: "14px" }}>
                                              {registro.recomendacoes}
                                            </div>
                                          </Alert>
                                        )}

                                        {isConcluido && registro.usuario_conclusao_nome && (
                                          <div className="mb-3 p-2 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                            <small className="text-muted d-block">Concluído por</small>
                                            <span style={{ fontSize: "13px", fontWeight: "500" }}>
                                              {registro.usuario_conclusao_nome}
                                              {registro.usuario_conclusao_registro && <> (RE: {registro.usuario_conclusao_registro})</>}
                                            </span>
                                            {registro.data_conclusao && (
                                              <>
                                                <br />
                                                <small className="text-muted">
                                                  {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                                </small>
                                              </>
                                            )}
                                          </div>
                                        )}

                                        <div className="mt-3 pt-3 border-top">
                                          <Row>
                                            <Col md={6}>
                                              <small className="text-muted d-block mb-1">Responsável</small>
                                              <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                                                {registro.usuario_nome || "Sistema"}
                                                {registro.usuario_registro && (
                                                  <small className="text-muted ms-2">RE: {registro.usuario_registro}</small>
                                                )}
                                              </p>
                                            </Col>
                                          </Row>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  );
                                })}

                                {/* Navegação de páginas */}
                                {totalPaginasRegistros > 1 && (
                                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.max(1, prev - 1))}
                                      disabled={paginaRegistrosPorTipo === 1}
                                      style={{ minWidth: '120px' }}
                                    >
                                      ← Anterior
                                    </Button>

                                    <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                                      Página {paginaRegistrosPorTipo} de {totalPaginasRegistros}
                                    </Badge>

                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.min(totalPaginasRegistros, prev + 1))}
                                      disabled={paginaRegistrosPorTipo === totalPaginasRegistros}
                                      style={{ minWidth: '120px' }}
                                    >
                                      Próxima →
                                    </Button>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </Tab.Pane>

                        {/* SUB-TAB: suplementacao */}
                        <Tab.Pane eventKey="suplementacao">
                          {(() => {
                            const registrosFiltrados = historico.filter(reg => reg.tipo === "Suplementação");
                            if (registrosFiltrados.length === 0) {
                              return (
                                <Alert variant="info" className="text-center">
                                  💊 Nenhum registro de suplementação adicionado ainda
                                </Alert>
                              );
                            }

                            const inicio = (paginaRegistrosPorTipo - 1) * itensPorPaginaRegistros;
                            const fim = inicio + itensPorPaginaRegistros;
                            const registrosPaginados = registrosFiltrados.slice(inicio, fim);
                            const totalPaginasRegistros = Math.ceil(registrosFiltrados.length / itensPorPaginaRegistros);

                            return (
                              <>
                                <div className="mb-3">
                                  <Badge bg="info" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                    Total: {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                {registrosPaginados.map((registro) => {
                                  const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                                  const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                                  const isConcluido = registro.status_conclusao === 'concluido';
                                  const mostrarBotaoConcluir = !isConcluido;

                                  return (
                                    <Card
                                      key={registro.id}
                                      className="shadow-sm border-0 mb-3 border-start border-4 border-info"
                                    >
                                      <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                          <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                              <Badge
                                                bg="info"
                                                className="bg-opacity-10"
                                                text="info"
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "600",
                                                  textTransform: "uppercase",
                                                  letterSpacing: "0.5px"
                                                }}
                                              >
                                                Suplementação
                                              </Badge>

                                              {isConcluido && (
                                                <Badge
                                                  bg="success"
                                                  className="bg-opacity-10"
                                                  text="success"
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  <BsCheckCircle className="me-1" style={{ fontSize: "10px" }} />
                                                  Concluída
                                                </Badge>
                                              )}
                                            </div>

                                            {/* Data e hora + validade */}
                                            <div className="text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                              <Row className="align-items-center">
                                                <Col md="auto" className="d-flex align-items-center">
                                                  <BsClockHistory className="me-1" style={{ fontSize: "11px" }} />
                                                  {dataBR} às {horaBR}
                                                </Col>

                                                {registro.tipo === "Suplementação" && (
                                                  <Col md={6}>
                                                    <div className="d-flex align-items-center gap-2">
                                                      <span className="text-muted">Data de Validade Suplementação:</span>
                                                      <Badge bg="primary" style={{ fontSize: "11px" }}>
                                                        {registro.data_validade && registro.data_validade !== null && registro.data_validade !== "" 
                                                          ? new Date(registro.data_validade).toLocaleDateString("pt-BR")
                                                          : "-"}
                                                      </Badge>
                                                    </div>
                                                  </Col>
                                                )}
                                              </Row>
                                            </div>
                                          </div>


                                          <div className="d-flex gap-2">
                                            {mostrarBotaoConcluir && (
                                              <Button
                                                size="sm"
                                                variant="outline-success"
                                                onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsCheckCircle className="me-1" />
                                                Concluir
                                              </Button>
                                            )}
                                            {!isConcluido && (
                                              <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => handleAbrirEdicao(registro)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsPencilSquare className="me-1" />
                                                Editar
                                              </Button>
                                            )}
                                          </div>
                                        </div>

                                        <div className="bg-light p-3 rounded mb-3">
                                          <p
                                            className="mb-0"
                                            style={{
                                              fontSize: "14px",
                                              lineHeight: "1.8",
                                              whiteSpace: "pre-line",
                                              color: isConcluido ? "#999" : "#333"
                                            }}
                                          >
                                            {registro.observacao}
                                          </p>
                                        </div>

                                        {registro.recomendacoes && (
                                          <Alert variant="warning" className="mb-3">
                                            <strong>📌 Recomendações:</strong>
                                            <div className="mt-2" style={{ fontSize: "14px" }}>
                                              {registro.recomendacoes}
                                            </div>
                                          </Alert>
                                        )}

                                        {isConcluido && registro.usuario_conclusao_nome && (
                                          <div className="mb-3 p-2 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                            <small className="text-muted d-block">Concluído por</small>
                                            <span style={{ fontSize: "13px", fontWeight: "500" }}>
                                              {registro.usuario_conclusao_nome}
                                              {registro.usuario_conclusao_registro && <> (RE: {registro.usuario_conclusao_registro})</>}
                                            </span>
                                            {registro.data_conclusao && (
                                              <>
                                                <br />
                                                <small className="text-muted">
                                                  {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                                </small>
                                              </>
                                            )}
                                          </div>
                                        )}

                                        <div className="mt-3 pt-3 border-top">
                                          <Row>
                                            <Col md={6}>
                                              <small className="text-muted d-block mb-1">Responsável</small>
                                              <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                                                {registro.usuario_nome || "Sistema"}
                                                {registro.usuario_registro && (
                                                  <small className="text-muted ms-2">RE: {registro.usuario_registro}</small>
                                                )}
                                              </p>
                                            </Col>
                                          </Row>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  );
                                })}

                                {/* Navegação de páginas */}
                                {totalPaginasRegistros > 1 && (
                                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.max(1, prev - 1))}
                                      disabled={paginaRegistrosPorTipo === 1}
                                      style={{ minWidth: '120px' }}
                                    >
                                      ← Anterior
                                    </Button>

                                    <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                                      Página {paginaRegistrosPorTipo} de {totalPaginasRegistros}
                                    </Badge>

                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.min(totalPaginasRegistros, prev + 1))}
                                      disabled={paginaRegistrosPorTipo === totalPaginasRegistros}
                                      style={{ minWidth: '120px' }}
                                    >
                                      Próxima →
                                    </Button>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </Tab.Pane>

                        {/* SUB-TAB: MOVIMENTAÇÕES */}
                        <Tab.Pane eventKey="movimentacao">
                          {(() => {
                            const registrosFiltrados = historico.filter(reg => reg.tipo === "Movimentação");
                            if (registrosFiltrados.length === 0) {
                              return (
                                <Alert variant="info" className="text-center">
                                  🔄 Nenhum registro de movimentação adicionado ainda
                                </Alert>
                              );
                            }

                            const inicio = (paginaRegistrosPorTipo - 1) * itensPorPaginaRegistros;
                            const fim = inicio + itensPorPaginaRegistros;
                            const registrosPaginados = registrosFiltrados.slice(inicio, fim);
                            const totalPaginasRegistros = Math.ceil(registrosFiltrados.length / itensPorPaginaRegistros);

                            return (
                              <>
                                <div className="mb-3">
                                  <Badge bg="primary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                    Total: {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                {registrosPaginados.map((registro) => {
                                  const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                                  const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');

                                  return (
                                    <Card
                                      key={registro.id}
                                      className="shadow-sm border-0 mb-3 border-start border-4 border-primary"
                                    >
                                      <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                          <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                              <Badge
                                                bg="primary"
                                                className="bg-opacity-10"
                                                text="primary"
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "600",
                                                  textTransform: "uppercase",
                                                  letterSpacing: "0.5px"
                                                }}
                                              >
                                                🔄 Movimentação
                                              </Badge>

                                              {registro.status_conclusao === 'concluido' && (
                                                <Badge
                                                  bg="success"
                                                  className="bg-opacity-10"
                                                  text="success"
                                                  style={{
                                                    fontSize: "10px",
                                                    padding: "4px 8px",
                                                    fontWeight: "500"
                                                  }}
                                                >
                                                  <BsCheckCircle className="me-1" style={{ fontSize: "10px" }} />
                                                  Concluída
                                                </Badge>
                                              )}
                                            </div>

                                            <div className="text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                              <BsClockHistory className="me-1" style={{ fontSize: "11px" }} />
                                              {dataBR} às {horaBR}
                                            </div>
                                          </div>

                                          {/* Botões de ação no topo à direita */}
                                          {!readonlyMode && registro.status_conclusao !== 'concluido' && (
                                            <div className="d-flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline-success"
                                                onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsCheckCircle className="me-1" />
                                                Concluir
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleAbrirModalExclusao(registro)}
                                                style={{
                                                  fontSize: "11px",
                                                  padding: "4px 10px",
                                                  fontWeight: "500"
                                                }}
                                              >
                                                <BsArchive className="me-1" />
                                                Excluir
                                              </Button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Informações de Origem e Destino */}
                                        <div className="mb-3 p-3 bg-primary bg-opacity-10 rounded">
                                          <Row className="align-items-center">
                                            <Col md={5}>
                                              <small className="text-muted d-block mb-1">📍 Origem</small>
                                              <Badge bg="secondary" style={{ fontSize: "12px", padding: "6px 12px" }}>
                                                {registro.origem || "Não definida"}
                                              </Badge>
                                            </Col>
                                            <Col md={2} className="text-center">
                                              <span style={{ fontSize: "16px", fontWeight: "bold" }}>→</span>
                                            </Col>
                                            <Col md={5}>
                                              <small className="text-muted d-block mb-1">📍 Destino</small>
                                              <Badge bg="success" style={{ fontSize: "12px", padding: "6px 12px" }}>
                                                {registro.destino || "Não definida"}
                                              </Badge>
                                            </Col>
                                          </Row>

                                          <Row className="mt-3">
                                            <Col md={12}>
                                              <small className="text-muted d-block mb-1">🔄 Movimentação</small>
                                              <div className="d-flex align-items-center gap-2">
                                                <Badge bg="secondary" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                  {registro.origem || "Não definida"}
                                                </Badge>
                                                <span>→</span>
                                                <Badge bg="success" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                  {registro.destino || "Não definida"}
                                                </Badge>
                                              </div>
                                            </Col>
                                          </Row>

                                          {registro.observacao && (
                                            <div className="mt-3 pt-3 border-top">
                                              <small className="text-muted d-block mb-1">📝 Detalhes da Movimentação</small>
                                              <p className="mb-0" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                                                {registro.observacao}
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        <div className="mt-3 pt-3 border-top">
                                          <Row>
                                            <Col md={6}>
                                              <small className="text-muted d-block mb-1">Responsável</small>
                                              <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                                                {registro.usuario_nome || "Sistema"}
                                                {registro.usuario_registro && (
                                                  <small className="text-muted ms-2">RE: {registro.usuario_registro}</small>
                                                )}
                                              </p>
                                            </Col>
                                            {registro.data_atualizacao && new Date(registro.data_atualizacao).getTime() !== new Date(registro.data_criacao).getTime() && (
                                              <Col md={6}>
                                                <small className="text-muted d-block mb-1">
                                                  <BsPencilSquare className="me-1" />
                                                  Última Atualização
                                                </small>
                                                <p className="mb-0" style={{ fontSize: "13px" }}>
                                                  {new Date(registro.data_atualizacao).toLocaleString('pt-BR')}
                                                  {registro.usuario_atualizacao_nome && (
                                                    <>
                                                      <br />
                                                      <small className="text-muted">
                                                        por {registro.usuario_atualizacao_nome}
                                                        {registro.usuario_atualizacao_registro && <> (RE: {registro.usuario_atualizacao_registro})</>}
                                                      </small>
                                                    </>
                                                  )}
                                                </p>
                                              </Col>
                                            )}
                                          </Row>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  );
                                })}

                                {/* Navegação de páginas */}
                                {totalPaginasRegistros > 1 && (
                                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.max(1, prev - 1))}
                                      disabled={paginaRegistrosPorTipo === 1}
                                      style={{ minWidth: '120px' }}
                                    >
                                      ← Anterior
                                    </Button>

                                    <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                                      Página {paginaRegistrosPorTipo} de {totalPaginasRegistros}
                                    </Badge>

                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPaginaRegistrosPorTipo(prev => Math.min(totalPaginasRegistros, prev + 1))}
                                      disabled={paginaRegistrosPorTipo === totalPaginasRegistros}
                                      style={{ minWidth: '120px' }}
                                    >
                                      Próxima →
                                    </Button>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </Tab.Pane>


                      </Tab.Content>

                    </Tab.Container>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>

      {/* Modal de Conclusão de Tratamento */}
      <Modal show={showModalConclusao} onHide={handleFecharModalConclusao} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔒 Confirmar Conclusão de Tratamento</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleConcluirTratamento}>
          <Modal.Body>
            {usuarioLogado && (
              <Alert variant="info" className="mb-3">
                <strong>👤 Usuário:</strong> {usuarioLogado.nome}<br />
                <strong>📧 Email:</strong> {usuarioLogado.email}<br />
                {usuarioLogado.registro && <><strong>🆔 Registro:</strong> {usuarioLogado.registro}</>}
              </Alert>
            )}

            <p className="text-muted mb-3">
              Para confirmar a conclusão deste tratamento, digite sua senha:
            </p>

            {erroConclusao && (
              <Alert variant="danger" className="py-2">
                {erroConclusao}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>🔑 Senha:</Form.Label>
              <Form.Control
                type="password"
                value={senhaConclusao}
                onChange={(e) => setSenhaConclusao(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalConclusao} disabled={concluindo}>
              Cancelar
            </Button>
            <Button variant="success" type="submit" disabled={concluindo}>
              {concluindo ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Concluindo...
                </>
              ) : (
                <>
                  <BsCheckCircle className="me-2" />
                  Concluir Tratamento
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Conclusão Manual de Registros */}
      <Modal show={showModalConclusaoRegistro} onHide={handleFecharModalConclusaoRegistro} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔒 Confirmar Conclusão de Registro</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleConcluirRegistro}>
          <Modal.Body>
            {usuarioLogado && (
              <Alert variant="info" className="mb-3">
                <strong>👤 Usuário:</strong> {usuarioLogado.nome}<br />
                <strong>📧 Email:</strong> {usuarioLogado.email}<br />
                {usuarioLogado.registro && <><strong>🆔 Registro:</strong> {usuarioLogado.registro}</>}
              </Alert>
            )}

            <p className="text-muted mb-3">
              Para confirmar a conclusão deste registro, digite sua senha:
            </p>

            {erroConclusaoRegistro && (
              <Alert variant="danger" className="py-2">
                {erroConclusaoRegistro}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>🔑 Senha:</Form.Label>
              <Form.Control
                type="password"
                value={senhaConclusaoRegistro}
                onChange={(e) => setSenhaConclusaoRegistro(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalConclusaoRegistro} disabled={concluindoRegistro}>
              Cancelar
            </Button>
            <Button variant="success" type="submit" disabled={concluindoRegistro}>
              {concluindoRegistro ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Concluindo...
                </>
              ) : (
                <>
                  <BsCheckCircle className="me-2" />
                  Confirmar Conclusão
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Edição de Registros */}
      <Modal show={showModalEdicao} onHide={handleFecharEdicao} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>✏️ Editar Registro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {registroEditando && (
            <>
              <Alert variant="info" className="mb-3">
                <strong>Tipo:</strong> {registroEditando.tipo}
                <br />
                <strong>Criado em:</strong> {new Date(registroEditando.data_criacao).toLocaleString('pt-BR')}
              </Alert>

              {registroEditando.tipo === "Tratamento" && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">🔬 Diagnóstico</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={diagnosticoEdicao}
                    onChange={(e) => setDiagnosticoEdicao(e.target.value)}
                    style={{ resize: "vertical" }}
                    placeholder="Descreva o diagnóstico do solípede..."
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Observação</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={observacaoEdicao}
                  onChange={(e) => setObservacaoEdicao(e.target.value)}
                  style={{ resize: "none" }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Recomendações</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={recomendacoesEdicao}
                  onChange={(e) => setRecomendacoesEdicao(e.target.value)}
                  style={{ resize: "none" }}
                />
              </Form.Group>

              {registroEditando.tipo === "Restrições" && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Data de Validade da Restrição (Opcional)</Form.Label>
                  <Form.Control
                    type="date"
                    value={dataValidadeEdicao}
                    onChange={(e) => setDataValidadeEdicao(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Se informada, o registro será marcado como concluído automaticamente após esta data.
                  </Form.Text>
                </Form.Group>
              )}

              <hr className="my-4" />

              <Alert variant="warning" className="mb-3">
                <strong>⚠️ Alterar Status do Solípede</strong>
                <p className="mb-0 mt-2" style={{ fontSize: "13px" }}>
                  Ao salvar esta edição, você também pode alterar o status atual do solípede.
                </p>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Novo Status (Opcional)</Form.Label>
                <Form.Select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value)}
                >

                  <option value=""></option>
                  <option value="Baixado">Baixado</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Se selecionado, o status do solípede será alterado ao salvar.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharEdicao}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvarEdicao}>
            💾 Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Edição de Restrições */}
      <Modal show={showModalEdicaoRestricao} onHide={handleFecharEdicaoRestricao} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Editar Restrição</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {registroEditando && (
            <>
              <Alert variant="info" className="mb-3">
                <strong>Tipo:</strong> {registroEditando.tipo}
                <br />
                <strong>Criado em:</strong> {new Date(registroEditando.data_criacao).toLocaleString('pt-BR')}
              </Alert>

              <Alert variant="primary" className="mb-3">
                <strong>ℹ️ Importante:</strong> As Restrições são utilizadas para alertar a tropa com informações pertinentes ao animal.
                <strong> Recomenda-se utilizar para manter a boa saúde e integridade do cavalo e do policial.</strong>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Observação</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={observacaoEdicaoRestricao}
                  onChange={(e) => setObservacaoEdicaoRestricao(e.target.value)}
                  style={{ resize: "none" }}
                  placeholder="Descreva a restrição..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Data de Validade da Restrição (Opcional)</Form.Label>
                <Form.Control
                  type="date"
                  value={dataValidadeEdicaoRestricao}
                  onChange={(e) => setDataValidadeEdicaoRestricao(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Se informada, o registro será marcado como concluído automaticamente após esta data.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharEdicaoRestricao}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvarEdicaoRestricao}>
            💾 Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Edição de Dieta */}
      <Modal show={showModalEdicaoDieta} onHide={handleFecharEdicaoDieta} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🥕 Editar Dieta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {registroEditando && (
            <>
              <Alert variant="info" className="mb-3">
                <strong>Tipo:</strong> {registroEditando.tipo}
                <br />
                <strong>Criado em:</strong> {new Date(registroEditando.data_criacao).toLocaleString('pt-BR')}
              </Alert>

              <div className="mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                <Form.Label className="fw-bold mb-3">🥕 Selecione a(s) opção(ões) de dieta:</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Feno (só feno)"
                  className="mb-2"
                  checked={dietaEdicao.fenoSoFeno}
                  onChange={(e) => setDietaEdicao({ ...dietaEdicao, fenoSoFeno: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="1/2 ração"
                  className="mb-2"
                  checked={dietaEdicao.umQuintoRacao}
                  onChange={(e) => setDietaEdicao({ ...dietaEdicao, umQuintoRacao: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Feno molhado"
                  className="mb-2"
                  checked={dietaEdicao.fenoMolhado}
                  onChange={(e) => setDietaEdicao({ ...dietaEdicao, fenoMolhado: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Jejum"
                  className="mb-2"
                  checked={dietaEdicao.jejum}
                  onChange={(e) => setDietaEdicao({ ...dietaEdicao, jejum: e.target.checked })}
                />
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Observações Adicionais (Opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={observacaoEdicaoDieta}
                  onChange={(e) => setObservacaoEdicaoDieta(e.target.value)}
                  style={{ resize: "none" }}
                  placeholder="Adicione informações complementares sobre a dieta..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharEdicaoDieta}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvarEdicaoDieta}>
            💾 Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Edição de Suplementação */}
      <Modal show={showModalEdicaoSuplementacao} onHide={handleFecharEdicaoSuplementacao} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>💊 Editar Suplementação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {registroEditando && (
            <>
              <Alert variant="info" className="mb-3">
                <strong>Tipo:</strong> {registroEditando.tipo}
                <br />
                <strong>Criado em:</strong> {new Date(registroEditando.data_criacao).toLocaleString('pt-BR')}
              </Alert>

              <div className="mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                <Form.Label className="fw-bold mb-3">💊 Dados da Suplementação:</Form.Label>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Produto *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nome do produto/suplemento"
                        value={suplementacaoEdicao.produto}
                        onChange={(e) => setSuplementacaoEdicao({ ...suplementacaoEdicao, produto: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Dose *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ex: 50g, 2 comprimidos"
                        value={suplementacaoEdicao.dose}
                        onChange={(e) => setSuplementacaoEdicao({ ...suplementacaoEdicao, dose: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Frequência *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ex: 2x ao dia, a cada 12h"
                        value={suplementacaoEdicao.frequencia}
                        onChange={(e) => setSuplementacaoEdicao({ ...suplementacaoEdicao, frequencia: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Data de Finalização</Form.Label>
                      <Form.Control
                        type="date"
                        value={dataValidadeEdicaoSuplementacao}
                        onChange={(e) => setDataValidadeEdicaoSuplementacao(e.target.value)}
                      />
                      <small className="text-muted d-block">
                        Data de Validade (Opcional)
                      </small>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Observações Adicionais (Opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={observacaoEdicaoSuplementacao}
                  onChange={(e) => setObservacaoEdicaoSuplementacao(e.target.value)}
                  style={{ resize: "none" }}
                  placeholder="Adicione informações complementares sobre a suplementação..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharEdicaoSuplementacao}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvarEdicaoSuplementacao}>
            💾 Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Alteração de Status */}
      <Modal show={showModalAlterarStatus} onHide={handleFecharModalAlterarStatus} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔄 Alterar Status do Solípede</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Solípede: <strong>{solipede?.nome}</strong> (Nº {solipede?.numero})
            <br />
            Status atual: <Badge bg={solipede?.status?.toLowerCase() === "baixado" ? "danger" : "success"}>
              {solipede?.status}
            </Badge>
          </p>

          {erroAlterarStatus && (
            <Alert variant="danger" className="py-2">
              {erroAlterarStatus}
            </Alert>
          )}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharModalAlterarStatus} disabled={alterandoStatus}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmarAlterarStatus} disabled={alterandoStatus}>
            {alterandoStatus ? (
              <>
                <Spinner size="sm" className="me-2" />
                Alterando...
              </>
            ) : (
              "Confirmar Alteração"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmação de Movimentação */}
      <Modal show={showModalMovimentacao} onHide={handleFecharModalMovimentacao} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔒 Confirmar Movimentação</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleConfirmarMovimentacao}>
          <Modal.Body>
            {usuarioLogado && (
              <Alert variant="info" className="mb-3">
                <strong>👤 Usuário:</strong> {usuarioLogado.nome}<br />
                <strong>📧 Email:</strong> {usuarioLogado.email}<br />
                {usuarioLogado.registro && <><strong>🆔 Registro:</strong> {usuarioLogado.registro}</>}
              </Alert>
            )}

            <Alert variant="warning" className="mb-3">
              <strong>🔄 Movimentação:</strong><br />
              <strong>De:</strong> {solipede?.alocacao || "Não definida"}<br />
              <strong>Para:</strong> {novaAlocacao}
            </Alert>

            <p className="text-muted mb-3">
              Para confirmar esta movimentação, digite sua senha:
            </p>

            {erroMovimentacao && (
              <Alert variant="danger" className="py-2">
                {erroMovimentacao}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>🔑 Senha:</Form.Label>
              <Form.Control
                type="password"
                value={senhaMovimentacao}
                onChange={(e) => setSenhaMovimentacao(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalMovimentacao} disabled={realizandoMovimentacao}>
              Cancelar
            </Button>
            <Button variant="success" type="submit" disabled={realizandoMovimentacao}>
              {realizandoMovimentacao ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Realizando...
                </>
              ) : (
                <>
                  <BsCheckCircle className="me-2" />
                  Confirmar Movimentação
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Exclusão de Registro */}
      <Modal show={showModalExclusao} onHide={handleFecharModalExclusao} centered>
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Confirmar Exclusão de Registro</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleExcluirRegistro}>
          <Modal.Body>
            {usuarioLogado && (
              <Alert variant="info" className="mb-3">
                <strong>👤 Usuário:</strong> {usuarioLogado.nome}<br />
                <strong>📧 Email:</strong> {usuarioLogado.email}<br />
                {usuarioLogado.registro && <><strong>🆔 Registro:</strong> {usuarioLogado.registro}</>}
              </Alert>
            )}

            {registroParaExcluir && (
              <Alert variant="danger" className="mb-3">
                <strong>⚠️ Atenção:</strong> Você está prestes a excluir um registro do tipo <strong>{registroParaExcluir.tipo}</strong>.<br />
                <small className="text-muted d-block mt-2">
                  <strong>Data:</strong> {new Date(registroParaExcluir.data_criacao).toLocaleDateString('pt-BR')} às {new Date(registroParaExcluir.data_criacao).toLocaleTimeString('pt-BR')}
                </small>
              </Alert>
            )}

            <p className="text-muted mb-3">
              Esta ação não pode ser desfeita. Para confirmar a exclusão, digite sua senha:
            </p>

            {erroExclusao && (
              <Alert variant="danger" className="py-2">
                {erroExclusao}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>🔑 Senha:</Form.Label>
              <Form.Control
                type="password"
                value={senhaExclusao}
                onChange={(e) => setSenhaExclusao(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalExclusao} disabled={excluindo}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit" disabled={excluindo}>
              {excluindo ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Excluindo...
                </>
              ) : (
                <>
                  <BsArchive className="me-2" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Template do Receituário (hidden) */}
      <div style={{ display: "none" }}>
        <ReceituarioTemplate
          key={tratamentoReceituarioSelecionado?.id || "receituario-sem-id"}
          ref={receituarioRef}
          solipede={solipede}
          tratamento={tratamentoReceituarioSelecionado}
          usuarioLogado={usuarioLogado}
        />
      </div>

    </div>
  );
}