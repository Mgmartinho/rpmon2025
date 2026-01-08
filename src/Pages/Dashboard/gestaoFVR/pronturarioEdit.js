import { useState, useEffect } from "react";
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
} from "react-icons/bs";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
import html2pdf from 'html2pdf.js';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';

export default function ProntuarioSolipedeEdit() {
  const { numero } = useParams();
  const navigate = useNavigate();
  const [solipede, setSolipede] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [recomendacoes, setRecomendacoes] = useState("");
  const [tipoObservacao, setTipoObservacao] = useState("Consulta Clínica");
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
  const [liberandoBaixa, setLiberandoBaixa] = useState(null);

  // Estados para Vacinação, Vermifugação e AIE
  const [dataAplicacao, setDataAplicacao] = useState("");
  const [partidaLote, setPartidaLote] = useState("");
  const [validadeProduto, setValidadeProduto] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  
  // Estados para edição de registros
  const [registroEditando, setRegistroEditando] = useState(null);
  const [showModalEdicao, setShowModalEdicao] = useState(false);
  const [observacaoEdicao, setObservacaoEdicao] = useState("");
  const [recomendacoesEdicao, setRecomendacoesEdicao] = useState("");
  const [dataValidadeEdicao, setDataValidadeEdicao] = useState("");
  
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
        const data = await api.obterSolipede(numero);
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
  }, [numero]);

  // Função para gerar documento formatado
  const gerarDocumentoFormatado = () => {
    if (!historico || !Array.isArray(historico) || historico.length === 0) return '';

    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    let documento = `
      <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <!-- Cabeçalho Oficial -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">
            REGIMENTO DE POLÍCIA MONTADA
          </h2>
          <h3 style="margin: 5px 0; font-size: 16px; font-weight: bold;">
            SEÇÃO DE SAÚDE VETERINÁRIA
          </h3>
          <p style="margin: 5px 0; font-size: 12px;">PRONTUÁRIO VETERINÁRIO</p>
        </div>

        <hr style="border: 1px solid #000; margin: 20px 0;">

        <!-- Dados do Solípede -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; text-decoration: underline;">
            I - DADOS DO SOLÍPEDE
          </h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr>
              <td style="padding: 5px 0; width: 30%;"><strong>Nome:</strong></td>
              <td style="padding: 5px 0;">${solipede.nome}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Número:</strong></td>
              <td style="padding: 5px 0;">${solipede.numero}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Pelagem:</strong></td>
              <td style="padding: 5px 0;">${solipede.pelagem || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Sexo:</strong></td>
              <td style="padding: 5px 0;">${solipede.sexo || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Data de Nascimento:</strong></td>
              <td style="padding: 5px 0;">${solipede.DataNascimento ? new Date(solipede.DataNascimento).toLocaleDateString('pt-BR') : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Esquadrão:</strong></td>
              <td style="padding: 5px 0;">${solipede.esquadrao || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Status:</strong></td>
              <td style="padding: 5px 0;">${solipede.status || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <hr style="border: 1px solid #000; margin: 20px 0;">

        <!-- Histórico Clínico -->
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; text-decoration: underline;">
            II - HISTÓRICO CLÍNICO E EVOLUÇÃO
          </h4>
          ${historico.map((registro, index) => {
      const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
      const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
      const tipo = registro.tipo ? registro.tipo.toUpperCase() : 'OBSERVAÇÃO GERAL';
      const usuario = registro.usuario_nome || 'N/A';
      const perfil = registro.usuario_perfil || 'N/A';
      const observacao = registro.observacao || 'Sem observação registrada';
      
      return `
              <div style="margin-bottom: 25px; page-break-inside: avoid;">
                <p style="margin: 0 0 8px 0;">
                  <strong>${index + 1}. ${tipo}</strong>
                </p>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">
                  <em>Data: ${dataBR} às ${horaBR}</em>
                  ${registro.usuario_nome ? ` | Responsável: ${usuario} (${perfil})` : ''}
                </p>
                <p style="text-align: justify; line-height: 1.6; margin: 10px 0;">
                  ${observacao}
                </p>
                ${registro.recomendacoes ? `
                  <div style="background-color: #fffbea; border-left: 3px solid #f0ad4e; padding: 10px; margin-top: 10px;">
                    <strong>Recomendações:</strong> ${registro.recomendacoes}
                  </div>
                ` : ''}
              </div>
            `;
    }).join('')}
        </div>

        <hr style="border: 1px solid #000; margin: 30px 0;">

        <!-- Rodapé -->
        <div style="margin-top: 50px; text-align: center; font-size: 11px;">
          <p style="margin: 5px 0;">Documento gerado em: ${dataAtual}</p>
          <p style="margin: 5px 0;">Total de registros: ${historico.length}</p>
        </div>
      </div>
    `;

    return documento;
  };

  // Função para exportar para PDF usando html2pdf
  const exportarPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = gerarDocumentoFormatado();

    const opt = {
      margin: [15, 15],
      filename: `Prontuario_${solipede.nome}_${solipede.numero}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Função para exportar para Word usando html-docx-js
  const exportarWord = () => {
    const conteudo = gerarDocumentoFormatado();
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
          ${conteudo}
        </body>
      </html>
    `;

    const converted = htmlDocx.asBlob(htmlContent);
    saveAs(converted, `Prontuario_${solipede.nome}_${solipede.numero}.docx`);
  };

  useEffect(() => {
    async function carregarProntuario() {
      try {
        console.log("🔍 Carregando prontuário para número:", solipede.numero);
        const response = await api.listarProntuario(solipede.numero);
        console.log("📦 Resposta da API:", response);
        console.log("📊 Total de registros recebidos:", response?.length);
        
        // Debug: verificar campo foi_responsavel_pela_baixa
        if (Array.isArray(response)) {
          response.forEach((reg, index) => {
            if (reg.tipo === "Tratamento") {
              console.log(`🩺 Tratamento ${index}:`, {
                id: reg.id,
                tipo: reg.tipo,
                foi_responsavel_pela_baixa: reg.foi_responsavel_pela_baixa,
                observacao: reg.observacao?.substring(0, 50)
              });
            }
          });
        }
        
        // Garantir que response seja sempre um array
        setHistorico(Array.isArray(response) ? response : []);
        
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
  }, [solipede]);

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

  // Atualizar visão geral quando histórico mudar
  useEffect(() => {
    if (historico && Array.isArray(historico) && historico.length > 0 && solipede) {
      const documentoFormatado = gerarDocumentoFormatado();
      setVisaoGeralTexto(documentoFormatado);
    } else if (solipede) {
      setVisaoGeralTexto(
        `<div style="font-family: 'Times New Roman', serif; padding: 40px; text-align: center;">
          <h3>Nenhum registro clínico encontrado</h3>
          <p>Adicione o primeiro registro na aba "Novo Registro"</p>
        </div>`
      );
    }
  }, [historico, solipede]);

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
      
      const response = await api.salvarProntuario({
        numero_solipede: numero,
        tipo: tipoObservacao,
        observacao,
        recomendacoes: recomendacoes || null,
        tipo_baixa: tipoObservacao === "Baixa" && tipoBaixa ? tipoBaixa : null,
        data_lancamento: tipoObservacao === "Baixa" && dataLancamento ? dataLancamento : null,
        data_validade: (tipoObservacao === "Baixa" && dataValidade) || (tipoObservacao === "Restrições" && dataValidade) ? dataValidade : null,
        precisa_baixar: tipoObservacao === "Tratamento" && precisaBaixar ? precisaBaixar : undefined, // Envia 'sim', 'nao' ou undefined
      });

      console.log("📥 Resposta do servidor:", response);

      if (response.success || response.id) {
        console.log("✅ Prontuário salvo com sucesso! Recarregando histórico...");
        
        // Recarregar o histórico para pegar os dados do usuário
        const historicoAtualizado = await api.listarProntuario(numero);
        console.log("📖 Histórico atualizado:", historicoAtualizado);
        setHistorico(historicoAtualizado);

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

  // Função para abrir modal de edição
  const handleAbrirEdicao = (registro) => {
    setRegistroEditando(registro);
    setObservacaoEdicao(registro.observacao || "");
    setRecomendacoesEdicao(registro.recomendacoes || "");
    setDataValidadeEdicao(registro.data_validade ? registro.data_validade.split('T')[0] : "");
    setShowModalEdicao(true);
  };

  // Função para fechar modal de edição
  const handleFecharEdicao = () => {
    setShowModalEdicao(false);
    setRegistroEditando(null);
    setObservacaoEdicao("");
    setRecomendacoesEdicao("");
    setDataValidadeEdicao("");
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
        // Recarregar histórico
        console.log("🔄 Recarregando histórico...");
        const historicoAtualizado = await api.listarProntuario(numero);
        console.log("📦 Histórico atualizado recebido:", historicoAtualizado);
        console.log("📊 Total após atualização:", historicoAtualizado?.length);
        setHistorico(historicoAtualizado);

        setMensagem({
          tipo: "success",
          texto: "✅ Registro atualizado com sucesso!",
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

  // Função para verificar se restrição está expirada (usa data_validade)
  const isRestricaoExpirada = (dataValidade) => {
    if (!dataValidade) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = new Date(dataValidade);
    validade.setHours(0, 0, 0, 0);
    return validade < hoje;
  };
  
  // Função para abrir modal de alteração de status
  const handleAbrirModalAlterarStatus = () => {
    setNovoStatus(solipede?.status || "Operante");
    setShowModalAlterarStatus(true);
    setErroAlterarStatus("");
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

  const handleLiberarBaixa = async (prontuarioId) => {
    if (!window.confirm("⚠️ Confirma a liberação desta baixa?")) {
      return;
    }

    setLiberandoBaixa(prontuarioId);
    try {
      const response = await api.liberarBaixa(prontuarioId);

      if (response.success) {
        // Recarregar histórico
        const historicoAtualizado = await api.listarProntuario(numero);
        setHistorico(historicoAtualizado);

        // Atualizar contador de baixas pendentes
        setBaixasPendentes(response.baixasPendentes || 0);

        // Recarregar dados do solípede para atualizar status
        const dadosAtualizados = await api.obterSolipede(numero);
        setSolipede(dadosAtualizados);

        setMensagem({
          tipo: "success",
          texto: "✅ Baixa liberada com sucesso!",
        });

        setTimeout(() => setMensagem(""), 3000);
      } else {
        setMensagem({
          tipo: "danger",
          texto: response.error || "❌ Erro ao liberar baixa",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao liberar baixa:", error);
      setMensagem({
        tipo: "danger",
        texto: "❌ Erro ao conectar com o servidor",
      });
    } finally {
      setLiberandoBaixa(null);
    }
  };

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
    <div className="container-fluid mt-4 mb-5">
      {/* Cabeçalho */}
      <Row className="mb-4">
        <Col>
          <h3 className="fw-bold mb-1">📘 Prontuário Veterinário</h3>
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
                <small className="text-muted d-block">Carga Horária</small>
                <strong>
                  {solipede.cargaHoraria ? `${solipede.cargaHoraria}h` : "N/A"}
                </strong>
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* Restrições */}
          <Card className="shadow-sm border-0 border-start border-4 border-warning">
            <Card.Header className="bg-light border-0 fw-bold">
              <BsExclamationTriangle className="me-2 text-warning" />
              Restrições
            </Card.Header>
            <Card.Body>
              <p
                className="mb-0"
                style={{ fontSize: "13px", lineHeight: "1.6" }}
              >
                {solipede.restricoes || "Nenhuma restrição registrada"}
              </p>
            </Card.Body>
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
              <Nav.Item>
                <Nav.Link eventKey="novo" className="fw-bold">
                  <BsPlusCircle className="me-2" />
                  Novo Registro
                </Nav.Link>
              </Nav.Item>
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
                      >
                        <BsFilePdf className="me-2" />
                        Exportar PDF
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={exportarWord}
                        disabled={!historico || historico.length === 0}
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
                      </Card.Body>
                    </Card>
                  </>
                )}
              </Tab.Pane>

              {/* TAB: NOVO REGISTRO */}
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
                          <option>Consulta Clínica</option>
                          <option>Tratamento</option>
                          <option>Exame</option>
                          <option>Vacinação</option>
                          <option>Vermifugação</option>
                          <option>Exames AIE / Mormo</option>
                          <option>Observações Comportamentais</option>
                          <option>Restrições</option>
                        </Form.Select>
                      </Form.Group>

                      {/* Mensagem informativa para Tratamento */}
                      {tipoObservacao === "Tratamento" && (
                        <>
                          <Alert variant="info" className="mb-3">
                            <strong>ℹ️ Importante:</strong> Ao iniciar um tratamento,
                             é opcional baixar o cavalo ou não, porém se houver mais de
                              um tratamento e estiver como baixado, todos deverão ser 
                              concluídos para voltar ao Status <strong>Ativo</strong>.
                          </Alert>
                          {tratamentosEmAndamento > 0 && (
                            <Alert variant="warning" className="mb-3">
                              <strong>⚠️ Atenção:</strong> Este solípede possui <strong>{tratamentosEmAndamento}</strong> tratamento(s) em andamento.
                              {solipede?.status === "Baixado" && (
                                <> Todos os tratamentos devem ser concluídos para que o status retorne a <strong>Ativo</strong>.</>
                              )}
                            </Alert>
                          )}
                        </>
                      )}

                      {/* Mensagem informativa para Restrições */}
                      {tipoObservacao === "Restrições" && (
                        <>
                          <Alert variant="info" className="mb-3">
                            <strong>ℹ️ Importante:</strong> As Restrições são utilizadas para alertar a tropa com informações pertinentes ao animal. 
                            <strong>Recomenda-se utilizar para manter a boa saúde e integridade do cavalo e do policial.</strong>
                          </Alert>
                          
                          <div className="mt-3 mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                            <Form.Group className="mb-0">
                              <Form.Label className="fw-bold">Data de Validade da Restrição (Opcional)</Form.Label>
                              <Form.Control
                                type="date"
                                size="sm"
                                value={dataValidade}
                                onChange={(e) => setDataValidade(e.target.value)}
                              />
                              <Form.Text className="text-muted">
                                Se informada, o registro será marcado como concluído automaticamente após esta data.
                              </Form.Text>
                            </Form.Group>
                          </div>
                        </>
                      )}

                      {/* Campos específicos para Vacinação, Vermifugação e AIE/Mormo */}
                      {(tipoObservacao === "Vacinação" || tipoObservacao === "Vermifugação" || tipoObservacao === "Exames AIE / Mormo") && (
                        <div className="mt-3 mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Data</Form.Label>
                                <Form.Control
                                  type="date"
                                  size="sm"
                                  value={dataAplicacao}
                                  onChange={(e) => setDataAplicacao(e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Partida/Lote</Form.Label>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  placeholder="Número da partida ou lote"
                                  value={partidaLote}
                                  onChange={(e) => setPartidaLote(e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Validade</Form.Label>
                                <Form.Control
                                  type="date"
                                  size="sm"
                                  value={validadeProduto}
                                  onChange={(e) => setValidadeProduto(e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Produto</Form.Label>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  placeholder="Nome do produto"
                                  value={nomeProduto}
                                  onChange={(e) => setNomeProduto(e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Interface completa de exames laboratoriais */}
                      {tipoObservacao === "Exame" && (
                        <div className="mt-3 mb-3">
                          <Alert variant="primary" className="mb-3">
                            <strong>🧪 Solicitação de Exames</strong><br />
                            Selecione os exames laboratoriais que deseja solicitar para este solípede.
                          </Alert>

                          <Accordion defaultActiveKey="0" className="mb-3">
                            {/* 1. HEMATOLOGIA */}
                            <Accordion.Item eventKey="0">
                              <Accordion.Header>
                                🧪 1. Hematologia (Sangue)
                                <small className="text-muted ms-2">
                                  - Avalia estado geral, inflamações, infecções e anemia
                                </small>
                              </Accordion.Header>
                              <Accordion.Body>
                                <div className="mb-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline-primary"
                                    onClick={() => marcarTodosCategoria("hematologia")}
                                  >
                                    Marcar todos
                                  </Button>
                                </div>
                                <Row>
                                  <Col md={6}>
                                    <Form.Check
                                      type="checkbox"
                                      label="Hemograma completo"
                                      checked={examesSelecionados.hemogramaCompleto}
                                      onChange={() => handleCheckboxChange("hemogramaCompleto")}
                                    />
                                    <Form.Check
                                      type="checkbox"
                                      label="Hemácias"
                                      checked={examesSelecionados.hemacias}
                                      onChange={() => handleCheckboxChange("hemacias")}
                                    />
                                    <Form.Check
                                      type="checkbox"
                                      label="Hemoglobina"
                                      checked={examesSelecionados.hemoglobina}
                                      onChange={() => handleCheckboxChange("hemoglobina")}
                                    />
                                    <Form.Check
                                      type="checkbox"
                                      label="Hematócrito"
                                      checked={examesSelecionados.hematocrito}
                                      onChange={() => handleCheckboxChange("hematocrito")}
                                    />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Check
                                      type="checkbox"
                                      label="VCM, HCM, CHCM"
                                      checked={examesSelecionados.indices}
                                      onChange={() => handleCheckboxChange("indices")}
                                    />
                                    <Form.Check
                                      type="checkbox"
                                      label="Leucograma"
                                      checked={examesSelecionados.leucograma}
                                      onChange={() => handleCheckboxChange("leucograma")}
                                    />
                                    <Form.Check
                                      type="checkbox"
                                      label="Plaquetas"
                                      checked={examesSelecionados.plaquetas}
                                      onChange={() => handleCheckboxChange("plaquetas")}
                                    />
                                  </Col>
                                </Row>
                              </Accordion.Body>
                            </Accordion.Item>

                            {/* 2. BIOQUÍMICA */}
                            <Accordion.Item eventKey="1">
                              <Accordion.Header>
                                🧬 2. Bioquímica Sanguínea
                              </Accordion.Header>
                              <Accordion.Body>
                                {/* Função Hepática */}
                                <h6 className="text-primary mt-2">Função Hepática</h6>
                                <Button size="sm" variant="outline-primary" className="mb-2"
                                  onClick={() => marcarTodosCategoria("funcaoHepatica")}>
                                  Marcar todos
                                </Button>
                                <Row className="mb-3">
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="AST (TGO)"
                                      checked={examesSelecionados.ast}
                                      onChange={() => handleCheckboxChange("ast")} />
                                    <Form.Check type="checkbox" label="ALT (TGP)"
                                      checked={examesSelecionados.alt}
                                      onChange={() => handleCheckboxChange("alt")} />
                                    <Form.Check type="checkbox" label="GGT"
                                      checked={examesSelecionados.ggt}
                                      onChange={() => handleCheckboxChange("ggt")} />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="FA (Fosfatase Alcalina)"
                                      checked={examesSelecionados.fosfataseAlcalina}
                                      onChange={() => handleCheckboxChange("fosfataseAlcalina")} />
                                    <Form.Check type="checkbox" label="Bilirrubina total"
                                      checked={examesSelecionados.bilirrubinaTotal}
                                      onChange={() => handleCheckboxChange("bilirrubinaTotal")} />
                                    <Form.Check type="checkbox" label="Bilirrubina direta"
                                      checked={examesSelecionados.bilirrubinaDireta}
                                      onChange={() => handleCheckboxChange("bilirrubinaDireta")} />
                                  </Col>
                                </Row>

                                {/* Função Renal */}
                                <h6 className="text-primary mt-2">Função Renal</h6>
                                <Button size="sm" variant="outline-primary" className="mb-2"
                                  onClick={() => marcarTodosCategoria("funcaoRenal")}>
                                  Marcar todos
                                </Button>
                                <Row className="mb-3">
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="Ureia"
                                      checked={examesSelecionados.ureia}
                                      onChange={() => handleCheckboxChange("ureia")} />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="Creatinina"
                                      checked={examesSelecionados.creatinina}
                                      onChange={() => handleCheckboxChange("creatinina")} />
                                  </Col>
                                </Row>

                                {/* Músculos */}
                                <h6 className="text-primary mt-2">Músculos</h6>
                                <Button size="sm" variant="outline-primary" className="mb-2"
                                  onClick={() => marcarTodosCategoria("musculos")}>
                                  Marcar todos
                                </Button>
                                <Row className="mb-3">
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="CK (Creatina Quinase)"
                                      checked={examesSelecionados.ck}
                                      onChange={() => handleCheckboxChange("ck")} />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="LDH"
                                      checked={examesSelecionados.ldh}
                                      onChange={() => handleCheckboxChange("ldh")} />
                                  </Col>
                                </Row>

                                {/* Eletrólitos */}
                                <h6 className="text-primary mt-2">Eletrólitos</h6>
                                <Button size="sm" variant="outline-primary" className="mb-2"
                                  onClick={() => marcarTodosCategoria("eletrolitos")}>
                                  Marcar todos
                                </Button>
                                <Row>
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="Sódio (Na⁺)"
                                      checked={examesSelecionados.sodio}
                                      onChange={() => handleCheckboxChange("sodio")} />
                                    <Form.Check type="checkbox" label="Potássio (K⁺)"
                                      checked={examesSelecionados.potassio}
                                      onChange={() => handleCheckboxChange("potassio")} />
                                    <Form.Check type="checkbox" label="Cloro (Cl⁻)"
                                      checked={examesSelecionados.cloro}
                                      onChange={() => handleCheckboxChange("cloro")} />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="Cálcio (Ca²⁺)"
                                      checked={examesSelecionados.calcio}
                                      onChange={() => handleCheckboxChange("calcio")} />
                                    <Form.Check type="checkbox" label="Fósforo (P)"
                                      checked={examesSelecionados.fosforo}
                                      onChange={() => handleCheckboxChange("fosforo")} />
                                    <Form.Check type="checkbox" label="Glicose"
                                      checked={examesSelecionados.glicose}
                                      onChange={() => handleCheckboxChange("glicose")} />
                                  </Col>
                                </Row>
                              </Accordion.Body>
                            </Accordion.Item>

                            {/* 3. SOROLOGIA */}
                            <Accordion.Item eventKey="2">
                              <Accordion.Header>
                                🦠 3. Sorologia (Doenças Infecciosas)
                              </Accordion.Header>
                              <Accordion.Body>
                                <Button size="sm" variant="outline-primary" className="mb-2"
                                  onClick={() => marcarTodosCategoria("sorologia")}>
                                  Marcar todos
                                </Button>
                                <Row>
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="AIE (Coggins)"
                                      checked={examesSelecionados.aie}
                                      onChange={() => handleCheckboxChange("aie")} />
                                    <Form.Check type="checkbox" label="Mormo"
                                      checked={examesSelecionados.mormo}
                                      onChange={() => handleCheckboxChange("mormo")} />
                                    <Form.Check type="checkbox" label="Leptospirose"
                                      checked={examesSelecionados.leptospirose}
                                      onChange={() => handleCheckboxChange("leptospirose")} />
                                    <Form.Check type="checkbox" label="Influenza Equina"
                                      checked={examesSelecionados.influenzaEquina}
                                      onChange={() => handleCheckboxChange("influenzaEquina")} />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Check type="checkbox" label="Herpesvírus Equino"
                                      checked={examesSelecionados.herpesvirusEquino}
                                      onChange={() => handleCheckboxChange("herpesvirusEquino")} />
                                    <Form.Check type="checkbox" label="Raiva"
                                      checked={examesSelecionados.raiva}
                                      onChange={() => handleCheckboxChange("raiva")} />
                                    <Form.Check type="checkbox" label="Encefalomielite"
                                      checked={examesSelecionados.encefalomieliteEquina}
                                      onChange={() => handleCheckboxChange("encefalomieliteEquina")} />
                                    <Form.Check type="checkbox" label="Arterite Viral"
                                      checked={examesSelecionados.arteriteViralEquina}
                                      onChange={() => handleCheckboxChange("arteriteViralEquina")} />
                                  </Col>
                                </Row>
                              </Accordion.Body>
                            </Accordion.Item>

                            {/* 4. PARASITOLOGIA */}
                            <Accordion.Item eventKey="3">
                              <Accordion.Header>
                                🧫 4. Parasitologia
                              </Accordion.Header>
                              <Accordion.Body>
                                <Button size="sm" variant="outline-primary" className="mb-2"
                                  onClick={() => marcarTodosCategoria("parasitologia")}>
                                  Marcar todos
                                </Button>
                                <Form.Check type="checkbox" label="Exame coproparasitológico"
                                  checked={examesSelecionados.coproparasitologico}
                                  onChange={() => handleCheckboxChange("coproparasitologico")} />
                                <Form.Check type="checkbox" label="OPG (Ovos Por Grama)"
                                  checked={examesSelecionados.opg}
                                  onChange={() => handleCheckboxChange("opg")} />
                                <Form.Check type="checkbox" label="Coprocultura"
                                  checked={examesSelecionados.coprocultura}
                                  onChange={() => handleCheckboxChange("coprocultura")} />
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </div>
                      )}


                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          {tipoObservacao === "Exame" ? "Observações Adicionais (opcional)" : "Observação"}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          placeholder={
                            tipoObservacao === "Exame"
                              ? "Adicione informações complementares sobre a solicitação de exames (opcional)..."
                              : "Descreva detalhadamente a observação clínica..."
                          }
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          style={{ resize: "none" }}
                          disabled={salvando}
                        />
                        <small className="text-muted d-block mt-1">
                          {observacao.length} caracteres
                          {tipoObservacao === "Exame" && " (opcional - os exames serão automaticamente listados)"}
                        </small>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Recomendações
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Próximas ações, reavaliações..."
                          value={recomendacoes}
                          onChange={(e) => setRecomendacoes(e.target.value)}
                          style={{ resize: "none" }}
                          disabled={salvando}
                        />
                      </Form.Group>

                      {tipoObservacao === "Tratamento" && (
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            🩺 Precisa baixar o solípede para este tratamento?
                          </Form.Label>
                          <Form.Select
                            value={precisaBaixar}
                            onChange={(e) => setPrecisaBaixar(e.target.value)}
                            disabled={salvando}
                          >
                            <option value="">Selecione...</option>
                            <option value="sim">✅ Sim - Baixar o solípede durante este tratamento</option>
                            <option value="nao">❌ Não - Manter status atual do solípede</option>
                          </Form.Select>
                          <Form.Text className="text-muted d-block mt-2">
                            ⚠️ <strong>Importante:</strong> Se escolher "Sim", o solípede será baixado. 
                            Ele só voltará a "Ativo" quando TODOS os tratamentos que baixaram forem concluídos.
                          </Form.Text>
                          {tratamentosEmAndamento > 0 && solipede?.status === "Baixado" && (
                            <Alert variant="warning" className="mt-2 mb-0">
                              <small>
                                <strong>📊 Atenção:</strong> Há {tratamentosEmAndamento} tratamento(s) ativo(s). 
                                Se escolher "Não", este tratamento não influenciará no status do solípede.
                              </small>
                            </Alert>
                          )}
                        </Form.Group>
                      )}

                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          onClick={handleAdicionarObservacao}
                          disabled={
                            salvando || 
                            (tipoObservacao === "Exame" 
                              ? !Object.values(examesSelecionados).some(v => v) && !observacao.trim()
                              : (tipoObservacao === "Tratamento" 
                                  ? !observacao.trim() && !precisaBaixar
                                  : !observacao.trim()
                                )
                            )
                          }
                        >
                          {salvando ? (
                            <>
                              <Spinner
                                size="sm"
                                className="me-2"
                                animation="border"
                              />
                              Salvando...
                            </>
                          ) : (
                            <>💾 Salvar Registro</>
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setObservacao("");
                            setRecomendacoes("");
                            setDataAplicacao("");
                            setPartidaLote("");
                            setValidadeProduto("");
                            setNomeProduto("");
                            setDataValidade("");
                            setDataLancamento("");
                            setPrecisaBaixar(""); // Resetar pergunta de baixa
                            // Resetar checkboxes de exames
                            setExamesSelecionados(Object.keys(examesSelecionados).reduce((acc, key) => {
                              acc[key] = false;
                              return acc;
                            }, {}));
                          }}
                          disabled={salvando}
                        >
                          Limpar
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* TAB: HISTÓRICO */}
              <Tab.Pane eventKey="historico">
                {historico.length === 0 ? (
                  <Card className="shadow-sm border-0">
                    <Card.Body className="text-center py-5">
                      <p className="text-muted mb-0">
                        <BsClockHistory
                          style={{ fontSize: "30px", marginBottom: "10px" }}
                        />
                        <br />
                        Nenhum registro clínico adicionado ainda
                      </p>
                    </Card.Body>
                  </Card>
                ) : (
                  historico.map((registro) => {
                    const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                    const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                    const isRestricaoExpiradaReg = registro.tipo === "Restrições" && isRestricaoExpirada(registro.data_validade);
                    const isConcluido = registro.status_conclusao === 'concluido';
                    const mostrarBotaoConcluir = (registro.tipo === "Restrições" || registro.tipo === "Tratamento") && !isConcluido && !isRestricaoExpiradaReg;

                    return (
                      <Card
                        key={registro.id}
                        className="shadow-sm border-0 mb-3 border-start border-4 border-primary"
                      >
                        <Card.Body>
                          <Row className="align-items-start mb-2">
                            <Col md={6}>
                              <Badge bg="info" className="mb-2">
                                {registro.tipo}
                              </Badge>
                              {registro.tipo === "Tratamento" && registro.foi_responsavel_pela_baixa === 1 && (
                                <Badge 
                                  className="mb-2 ms-2" 
                                  style={{ 
                                    backgroundColor: "#ffcccc", 
                                    color: "#721c24", 
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    padding: "4px 8px"
                                  }}
                                >
                                   Usuário baixou o solipede
                                </Badge>
                              )}
                              {(isRestricaoExpiradaReg || isConcluido) && (
                                <Badge bg="success" className="mb-2 ms-2">
                                  <BsCheckCircle className="me-1" />
                                  Concluída
                                </Badge>
                              )}
                              {registro.tipo === "Restrições" && registro.data_validade && (
                                <p className="mb-1" style={{ fontSize: "11px", color: "#666" }}>
                                  📅 Validade: {new Date(registro.data_validade).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                              {registro.tipo === "Tratamento" && registro.precisa_baixar && (
                                <p className="mb-1 mt-2" style={{ fontSize: "12px", fontWeight: "500", color: registro.precisa_baixar === "sim" ? "#856404" : "#28a745" }}>
                                  {registro.precisa_baixar === "sim" ? (
                                    <>🩺 <strong>Usuário baixou o solípede</strong></>
                                  ) : (
                                    <>✅ <strong>Usuário NÃO baixou o solípede</strong></>
                                  )}
                                </p>
                              )}
                              {isConcluido && registro.usuario_conclusao_nome && (
                                <p className="text-success mb-0" style={{ fontSize: "11px" }}>
                                  ✅ Concluído por: <strong>{registro.usuario_conclusao_nome}</strong> ({registro.usuario_conclusao_registro})
                                  <br />
                                  📅 {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                </p>
                              )}
                              <p
                                className="mb-1"
                                style={{ fontSize: "12px", color: "#999" }}
                              >
                                <BsClockHistory className="me-1" />
                                <strong>{dataBR}</strong> às {horaBR}
                              </p>
                            </Col>
                            <Col md={6} className="text-end">
                              <div className="d-flex gap-2 justify-content-end">
                                {mostrarBotaoConcluir && (
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    className="mb-2"
                                    onClick={() => {
                                      if (registro.tipo === "Tratamento") {
                                        handleAbrirModalConclusao(registro.id);
                                      } else {
                                        handleAbrirModalConclusaoRegistro(registro.id);
                                      }
                                    }}
                                  >
                                    <BsCheckCircle className="me-1" />
                                    Concluir
                                  </Button>
                                )}
                                {!isConcluido && (
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="mb-2"
                                    onClick={() => handleAbrirEdicao(registro)}
                                  >
                                    <BsPlusCircle className="me-1" />
                                    Editar
                                  </Button>
                                )}
                              </div>
                              <div style={{ fontSize: "13px" }}>
                                <p className="mb-1">
                                  <strong>{registro.usuario_nome || "Sistema"}</strong>
                                </p>
                                <small className="text-muted d-block">
                                  {registro.usuario_registro && `Registro: ${registro.usuario_registro}`}
                                </small>
                                <Badge bg="secondary" style={{ fontSize: "11px" }}>
                                  {registro.usuario_perfil || "Desconhecido"}
                                </Badge>
                                {registro.status_anterior && registro.status_novo && (
                                  <div className="mt-2 pt-2 border-top">
                                    <small className="text-info d-block">
                                      🔄 Status alterado: <strong>{registro.status_anterior}</strong> → <strong>{registro.status_novo}</strong>
                                    </small>
                                  </div>
                                )}
                                {registro.data_atualizacao && new Date(registro.data_atualizacao).getTime() !== new Date(registro.data_criacao).getTime() && (
                                  <div className="mt-2 pt-2 border-top">
                                    <small className="text-muted d-block">
                                      <BsPencilSquare className="me-1" />
                                      Atualizado em: {new Date(registro.data_atualizacao).toLocaleString('pt-BR')}
                                      {registro.usuario_atualizacao_nome && (
                                        <> por <strong>{registro.usuario_atualizacao_nome}</strong> ({registro.usuario_atualizacao_registro})</>
                                      )}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                          <div className="bg-light p-2 rounded mb-2">
                            <p
                              className="mb-0"
                              style={{ 
                                fontSize: "14px", 
                                lineHeight: "1.6", 
                                whiteSpace: "pre-line",
                                textDecoration: (isRestricaoExpiradaReg || isConcluido) ? "none" : "none",
                                color: (isRestricaoExpiradaReg || isConcluido) ? "#999" : "inherit"
                              }}
                            >
                              {registro.observacao}
                            </p>
                          </div>
                          {registro.recomendacoes && (
                            <div className="bg-warning bg-opacity-10 p-2 rounded border-start border-warning">
                              <small className="text-muted">
                                <strong>📌 Recomendação:</strong>{" "}
                                <span style={{
                                  textDecoration: (isRestricaoExpiradaReg || isConcluido) ? "none" : "none"
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

              {/* TAB: REGISTROS POR TIPO */}
              <Tab.Pane eventKey="porTipo">
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Tab.Container defaultActiveKey="vacinacao">
                      <Nav variant="pills" className="mb-3">
                        <Nav.Item>
                          <Nav.Link eventKey="consulta" className="me-2">
                            🩺 Consulta Clínica
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="tratamento" className="me-2">
                            💊 Tratamento
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="exame" className="me-2">
                            🔬 Exame
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="vacinacao" className="me-2">
                            💉 Vacinação
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
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="restricoes">
                            ⚠️ Restrições
                          </Nav.Link>
                        </Nav.Item>
                      </Nav>

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
                          {historico.filter(reg => reg.tipo === "Tratamento").length === 0 ? (
                            <Alert variant="info" className="text-center">
                              💊 Nenhum registro de tratamento adicionado ainda
                            </Alert>
                          ) : (
                            historico.filter(reg => reg.tipo === "Tratamento").map((registro) => {
                              const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                              const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                              const isConcluido = registro.status_conclusao === 'concluido';

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-danger">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="danger" className="mb-2">💊 Tratamento</Badge>
                                        {registro.foi_responsavel_pela_baixa === 1 && (
                                          <Badge bg="warning" text="dark" className="mb-2 ms-2">
                                            🩺 Baixou o solípede
                                          </Badge>
                                        )}
                                        {isConcluido && (
                                          <Badge bg="success" className="mb-2 ms-2">
                                            <BsCheckCircle className="me-1" />
                                            Concluído
                                          </Badge>
                                        )}
                                        {registro.precisa_baixar && (
                                          <p className="mb-1 mt-2" style={{ fontSize: "12px", fontWeight: "500", color: registro.precisa_baixar === "sim" ? "#856404" : "#28a745" }}>
                                            {registro.precisa_baixar === "sim" ? (
                                              <>🩺 <strong>Usuário baixou o solípede</strong></>
                                            ) : (
                                              <>✅ <strong>Usuário NÃO baixou o solípede</strong></>
                                            )}
                                          </p>
                                        )}
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
                                        {isConcluido && registro.usuario_conclusao_nome && (
                                          <p className="text-success mb-0" style={{ fontSize: "12px" }}>
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
                                              onClick={() => handleAbrirModalConclusao(registro.id)}
                                            >
                                              <BsCheckCircle className="me-1" />
                                              Concluir
                                            </Button>
                                          )}
                                          {!isConcluido && (
                                            <Button
                                              size="sm"
                                              variant="outline-primary"
                                              onClick={() => handleAbrirEdicao(registro)}
                                            >
                                              <BsPlusCircle className="me-1" />
                                              Editar
                                            </Button>
                                          )}
                                        </div>
                                      </Col>
                                    </Row>
                                    <hr />
                                    <p style={{ fontSize: "14px", lineHeight: "1.6" }}>{registro.observacao}</p>
                                    {registro.recomendacoes && (
                                      <div className="bg-warning bg-opacity-10 p-2 rounded border-start border-warning">
                                        <small className="text-muted">
                                          <strong>📌 Recomendação:</strong> {registro.recomendacoes}
                                        </small>
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              );
                            })
                          )}
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

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-secondary">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="secondary" className="mb-2">🔬 Exame</Badge>
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

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-success">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="success" className="mb-2">💉 Vacinação</Badge>
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
                            {historico.filter(reg => reg.tipo === "Restrições").length === 0 ? (
                              <Alert variant="info" className="text-center">
                                ⚠️ Nenhum registro de restrições adicionado ainda
                              </Alert>
                            ) : (
                              historico.filter(reg => reg.tipo === "Restrições").map((registro) => {
                                const dataBR = new Date(registro.data_criacao).toLocaleDateString('pt-BR');
                                const horaBR = new Date(registro.data_criacao).toLocaleTimeString('pt-BR');
                                const isRestricaoExpiradaReg = isRestricaoExpirada(registro.data_validade);
                                const isConcluido = registro.status_conclusao === 'concluido';
                                const mostrarBotaoConcluir = !isConcluido && !isRestricaoExpiradaReg;
  
                                return (
                                  <Card key={registro.id} className="mb-3 border-start border-4 border-warning">
                                    <Card.Body>
                                      <Row className="align-items-start mb-2">
                                        <Col>
                                          <Badge bg="warning" className="mb-2">⚠️ Restrições</Badge>
                                          {(isRestricaoExpiradaReg || isConcluido) && (
                                            <Badge bg="success" className="mb-2 ms-2">
                                              <BsCheckCircle className="me-1" />
                                              Concluída
                                            </Badge>
                                          )}
                                          {registro.data_validade && (
                                            <p className="mb-1" style={{ fontSize: "11px", color: "#666" }}>
                                              📅 Validade: {new Date(registro.data_validade).toLocaleDateString('pt-BR')}
                                            </p>
                                          )}
                                          {isConcluido && registro.usuario_conclusao_nome && (
                                            <p className="text-success mb-0" style={{ fontSize: "11px" }}>
                                              ✅ Concluído por: <strong>{registro.usuario_conclusao_nome}</strong> ({registro.usuario_conclusao_registro})
                                              <br />
                                              📅 {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                            </p>
                                          )}
                                          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                            📅 {dataBR} às {horaBR}
                                          </p>
                                        </Col>
                                        <Col xs="auto">
                                          <div className="d-flex gap-2">
                                            {mostrarBotaoConcluir && (
                                              <Button
                                                size="sm"
                                                variant="outline-success"
                                                onClick={() => handleAbrirModalConclusaoRegistro(registro.id)}
                                              >
                                                <BsCheckCircle className="me-1" />
                                                Concluir
                                              </Button>
                                            )}
                                            {!isConcluido && (
                                              <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => handleAbrirEdicao(registro)}
                                              >
                                                <BsPlusCircle className="me-1" />
                                                Editar
                                              </Button>
                                            )}
                                          </div>
                                        </Col>
                                      </Row>
                                      <hr />
                                      <p style={{ 
                                        fontSize: "14px", 
                                        lineHeight: "1.6",
                                        textDecoration: (isRestricaoExpiradaReg || isConcluido) ? "none" : "none",
                                        color: (isRestricaoExpiradaReg || isConcluido) ? "#999" : "inherit"
                                      }}>
                                        {registro.observacao}
                                      </p>
                                      {registro.recomendacoes && (
                                        <div className="bg-warning bg-opacity-10 p-2 rounded border-start border-warning">
                                          <small className="text-muted">
                                            <strong>📌 Recomendação:</strong>{" "}
                                            <span style={{
                                              textDecoration: (isRestricaoExpiradaReg || isConcluido) ? "none" : "none"
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

          <Form.Group className="mb-3">
            <Form.Label>Novo Status:</Form.Label>
            <Form.Select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              disabled={alterandoStatus}
            >
              <option value="">Selecione...</option>
              <option value="Operante">Operante</option>
              <option value="Baixado">Baixado</option>
              <option value="Em Tratamento">Em Tratamento</option>
              <option value="Descanso">Descanso</option>
            </Form.Select>
          </Form.Group>
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
    </div>
  );
}
