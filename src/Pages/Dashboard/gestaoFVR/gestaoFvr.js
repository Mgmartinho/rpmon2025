import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Spinner,
  Form,
  Modal,
  Alert,
  Accordion,
} from "react-bootstrap";

import {
  BsPlus,
  BsPencilSquare,

  BsClipboardCheck,
} from "react-icons/bs";

import {
  BsCollection,
  BsCheckCircleFill,
  BsXCircleFill,
  BsArrowRepeat,
  BsFileEarmarkExcel,
  BsFileEarmarkPdf,
  BsClipboardPlus,
} from "react-icons/bs";

import "./styles.css";

import { LuTriangleAlert } from "react-icons/lu";


import { GiHorseHead } from "react-icons/gi";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../../../services/api";
import { getUsuarioLogado } from "../../../utils/auth";

const GestaoFvr = () => {
  const [dados, setDados] = useState([]);
  const [dadosProntuario, setDadosProntuario] = useState([]);
  const [loading, setLoading] = useState(true);

  // Autenticação e permissões
  const usuarioLogado = getUsuarioLogado();
  const podeEditarSolipede = usuarioLogado && (usuarioLogado.perfil === "Veterinario Admin" || usuarioLogado.perfil === "Desenvolvedor" || usuarioLogado.perfil === "Veterinario");

  /* ===========================
     CONTROLE INDICADORES
  =========================== */
  const [indicador, setIndicador] = useState("TOTAL");

  /* ===========================
     FILTROS – SOLÍPEDES
  =========================== */
  const [filtroNumero, setFiltroNumero] = useState("");
  const [filtroAlocacao, setFiltroAlocacao] = useState("");

  /* ===========================
     ORDENAÇÃO – SOLÍPEDES
  =========================== */
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* ===========================
     PAGINAÇÃO – SOLÍPEDES
  =========================== */
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageSolipede, setPageSolipede] = useState(1);

  /* ===========================
      MODAL – SOLICITAR EXAMES EM LOTE
    =========================== */
  const [showExamesModal, setShowExamesModal] = useState(false);
  const [selecionadosExames, setSelecionadosExames] = useState([]);
  const [filtroExamesModal, setFiltroExamesModal] = useState("");
  const [observacaoExames, setObservacaoExames] = useState("");
  const [examesLoading, setExamesLoading] = useState(false);
  const [examesErro, setExamesErro] = useState("");
  const [examesSucesso, setExamesSucesso] = useState("");

  // Estados para os exames selecionados
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

  /* ===========================
     INDICADORES (DADOS REAIS) - MEMOIZADOS
  =========================== */
  const total = useMemo(() => dados.length, [dados]);

  const ativos = useMemo(
    () => dados.filter((item) => item.status === "Ativo").length,
    [dados]
  );

  const baixados = useMemo(
    () => dados.filter((item) => item.status === "Baixado").length,
    [dados]
  );

  const normalizarNumeroSolipede = useCallback(
    (numero) => String(numero ?? "").trim(),
    []
  );

  const restricaoEmAndamento = useCallback((item) => {
    const statusConclusao = String(item?.status_conclusao || "").toLowerCase();
    return item?.tipo === "Restrições" && statusConclusao !== "concluido";
  }, []);

  // Consolidar filtragem de restrições em um único useMemo (otimização de performance)
  const { restricoes, numerosComRestricoes } = useMemo(() => {
    const solipedesComRestricoes = dadosProntuario
      .filter(restricaoEmAndamento)
      .map((item) => normalizarNumeroSolipede(item.numero_solipede))
      .filter(Boolean);
    
    const numeros = new Set(solipedesComRestricoes);
    
    return {
      restricoes: numeros.size,
      numerosComRestricoes: numeros
    };
  }, [dadosProntuario, restricaoEmAndamento, normalizarNumeroSolipede]);

  // Função para verificar se um solípede tem restrição
  const temRestricao = useCallback(
    (numeroSolipede) => numerosComRestricoes.has(normalizarNumeroSolipede(numeroSolipede)),
    [numerosComRestricoes, normalizarNumeroSolipede]
  );
  
  /* ===========================
     BUSCA DADOS
  =========================== */
  const carregarDados = async () => {
    try {
      const data = await api.listarSolipedes();
      if (data && data.error) {
        console.warn("Erro na autenticação:", data.error);
        setDados([]);
      } else if (Array.isArray(data)) {
        setDados(data);
      } else {
        setDados([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setDados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);


  /* ===========================
   BUSCA DADOS PRONTUARIO
=========================== */
  const restricoesProntuario = async () => {
    try {
      const data = await api.listarTodosProntuarios();
      if (data && data.error) {
        console.warn("Erro na autenticação:", data.error);
        setDadosProntuario([]);
      } else if (Array.isArray(data)) {
        setDadosProntuario(data);
      } else {
        setDadosProntuario([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setDadosProntuario([]);
    }
  };

  useEffect(() => {
    restricoesProntuario();
  }, []);

  // Verificar se tem movimentação - MEMOIZADO
  const temMovimentacao = useMemo(
    () => dados.some((item) => item.movimentacao !== null && item.movimentacao !== ""),
    [dados]
  );

  /* ===========================
     FILTRAGEM – SOLÍPEDES - MEMOIZADA
  =========================== */
  const solipedesFiltrados = useMemo(() => {
    // Se o indicador for RESTRICOES, busca os solípedes que têm restrições no prontuário
    if (indicador === "RESTRICOES") {
      const numerosComRestricoes = new Set(
        dadosProntuario
          .filter(restricaoEmAndamento)
          .map((item) => normalizarNumeroSolipede(item.numero_solipede))
          .filter(Boolean)
      );

      return dados.filter((item) => {
        // Verifica se o solípede tem restrição
        if (!numerosComRestricoes.has(normalizarNumeroSolipede(item.numero))) return false;

        /* FILTROS MANUAIS */
        if (!item.numero.toString().includes(filtroNumero)) return false;
        if (
          !(item.alocacao || "")
            .toLowerCase()
            .includes(filtroAlocacao.toLowerCase())
        )
          return false;

        return true;
      });
    }

    // Para outros indicadores (ATIVOS, BAIXADOS, MOVIMENTACAO, etc)
    return dados.filter((item) => {
      /* FILTRO POR INDICADOR */
      if (indicador === "ATIVOS" && item.status !== "Ativo") return false;
      if (indicador === "BAIXADOS" && item.status !== "Baixado") return false;
      if (
        indicador === "MOVIMENTACAO" &&
        (item.movimentacao === null ||
          item.movimentacao === "" ||
          item.movimentacao === undefined)
      )
        return false;

      /* FILTROS MANUAIS */
      if (!item.numero.toString().includes(filtroNumero)) return false;
      if (
        !(item.alocacao || "")
          .toLowerCase()
          .includes(filtroAlocacao.toLowerCase())
      )
        return false;

      return true;
    });
  }, [dados, dadosProntuario, indicador, filtroNumero, filtroAlocacao, restricaoEmAndamento, normalizarNumeroSolipede]);

  /* ===========================
     ORDENAÇÃO – SOLÍPEDES - MEMOIZADA
  =========================== */
  const solipeddesOrdenados = useMemo(() => {
    if (!sortConfig.key) return solipedesFiltrados;

    const sorted = [...solipedesFiltrados].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [solipedesFiltrados, sortConfig]);

  const requestSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  /* ===========================
     PAGINAÇÃO – SOLÍPEDES - MEMOIZADA
  =========================== */
  const { totalPagesSolipede, solipedesPaginados } = useMemo(() => {
    const total = solipeddesOrdenados.length;
    const totalPages = itemsPerPage === "all" ? 1 : Math.ceil(total / itemsPerPage);
    const inicio = itemsPerPage === "all" ? 0 : (pageSolipede - 1) * itemsPerPage;
    const fim = itemsPerPage === "all" ? total : inicio + itemsPerPage;
    const paginados = solipeddesOrdenados.slice(inicio, fim);

    return {
      totalPagesSolipede: totalPages,
      solipedesPaginados: paginados,
    };
  }, [solipeddesOrdenados, itemsPerPage, pageSolipede]);

  // Cache de cálculo de idade para evitar recálculos (otimização de performance)
  const cacheIdade = useMemo(() => new Map(), []);
  
  const calcularIdade = useCallback((dataNascimento) => {
    if (!dataNascimento) return 0;
    
    // Verificar cache
    if (cacheIdade.has(dataNascimento)) {
      return cacheIdade.get(dataNascimento);
    }
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    // Armazenar no cache
    cacheIdade.set(dataNascimento, idade);
    return idade;
  }, [cacheIdade]);



  /* ===========================
     FUNÇÕES DE EXPORTAÇÃO - MEMOIZADAS & OTIMIZADAS
  =========================== */
  const exportExcel = useCallback(() => {
    const dadosExportacao = solipedesFiltrados.map((item) => ({
      Numero: item.numero,
      Nome: item.nome,
      AnoNascimento: item.DataNascimento
        ? new Date(item.DataNascimento).getFullYear()
        : "",
      Sexo: item.sexo,
      Pelagem: item.pelagem,
      Alocacao: item.alocacao,
      Origem: item.origem,
      Esquadrao: item.esquadrao,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Solipedes");

    XLSX.writeFile(workbook, "solipedes_fvr.xlsx");
  }, [solipedesFiltrados]);

  const exportPDF = useCallback(() => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(14);
    doc.text("Gestão Veterinária de Solípedes (FVR)", 14, 15);

    doc.setFontSize(10);
    doc.text("Relatório gerado automaticamente", 14, 22);

    const tableColumn = [
      "Nº",
      "Nome",
      "Ano",
      "Sexo",
      "Pelagem",
      "Alocação",
      "Origem",
      "Esquadrão",
      "Status",
      "Movimentação",
    ];

    const tableRows = solipedesFiltrados.map((item) => [
      item.numero,
      item.nome,
      item.DataNascimento ? new Date(item.DataNascimento).getFullYear() : "",
      item.sexo,
      item.pelagem,
      item.alocacao,
      item.origem,
      item.esquadrao,
      item.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [13, 110, 253], // bootstrap primary
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });

    doc.save("solipedes_fvr.pdf");
  }, [solipedesFiltrados]);

  /* ===========================
     FUNÇÕES DE EXAMES EM LOTE
  =========================== */
  const handleCheckboxExame = (exame) => {
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

  const toggleSelecionadoExame = (numero) => {
    setSelecionadosExames((prev) =>
      prev.includes(numero)
        ? prev.filter((n) => n !== numero)
        : [...prev, numero]
    );
  };

  const selecionarTodosExames = () => {
    const todosFiltrados = solipedesFiltrados
      .filter((sol) => {
        if (!filtroExamesModal) return true;
        const filtro = filtroExamesModal.toLowerCase();
        return (
          sol.numero.toString().includes(filtro) ||
          sol.nome.toLowerCase().includes(filtro)
        );
      })
      .map((sol) => sol.numero);
    setSelecionadosExames(todosFiltrados);
  };

  const desselecionarTodosExames = () => {
    setSelecionadosExames([]);
  };

  const confirmarExames = async () => {
    setExamesErro("");
    setExamesSucesso("");

    // Validações
    if (selecionadosExames.length === 0) {
      setExamesErro("Selecione pelo menos um solípede");
      return;
    }

    const algumExameSelecionado = Object.values(examesSelecionados).some((v) => v === true);
    if (!algumExameSelecionado) {
      setExamesErro("Selecione pelo menos um exame");
      return;
    }

    setExamesLoading(true);

    try {
      // Preparar lista de exames formatada
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
      const textoExames = `SOLICITAÇÃO DE EXAMES LABORATORIAIS - LOTE\n\n` +
        `Exames solicitados:\n${examesLista.join("\n")}\n\n` +
        (observacaoExames ? `Observações: ${observacaoExames}\n\n` : "") +
        `Data da solicitação: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}\n` +
        `Solípedes: ${selecionadosExames.length} animal(is) selecionado(s)`;

      // Salvar para cada solípede selecionado
      const promessas = selecionadosExames.map((numero) =>
        api.salvarProntuario({
          numero_solipede: numero,
          tipo: "Exame",
          observacao: textoExames,
          recomendacoes: observacaoExames || null,
        })
      );

      await Promise.all(promessas);

      setExamesSucesso(
        `Exames solicitados com sucesso para ${selecionadosExames.length} solípede(s)!`
      );

      // Limpar seleções após 2 segundos
      setTimeout(() => {
        setShowExamesModal(false);
        setSelecionadosExames([]);
        setObservacaoExames("");
        setFiltroExamesModal("");
        setExamesSucesso("");
        // Resetar checkboxes
        setExamesSelecionados(Object.keys(examesSelecionados).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {}));
      }, 2000);

    } catch (error) {
      console.error("Erro ao solicitar exames:", error);
      setExamesErro("Erro ao solicitar exames em lote");
    } finally {
      setExamesLoading(false);
    }
  };

  /* ===========================
     RENDER
  =========================== */
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Carregando gestão veterinária...</p>
      </div>
    );
  }
  return (
    <div className="container-fluid py-4 d-flex justify-content-center">
      <div className="w-100">
        {/* =================================
          GESTÃO VETERINÁRIA – SOLÍPEDES
      ================================= */}
        <Card className="shadow-sm border-0">
          <Card.Body>
            {/* HEADER */}
            {/* HEADER – ESTILO INDICADORES */}
            <Row className="mb-4 g-3 align-items-stretch">
              {/* TÍTULO */}
              <Col md={6}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="d-flex align-items-center">
                    <GiHorseHead size={36} className="text-primary me-3" />
                    <div>
                      <h4 className="mb-0 fw-semibold">
                        Gestão Veterinária de Solípedes (FVR)
                      </h4>
                      <small className="text-muted">
                        Controle operacional e histórico clínico
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Titulo Gestão FVR e Botões*/}
              <Col md={2}>
                <Link
                  to="/dashboard/gestaofvr/solipede/create"
                  className="text-decoration-none text-reset"
                >
                  <Card className="h-100 text-center shadow-sm border-start">
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                      <BsPlus size={22} className="mb-2" />
                      <small className="fw-semibold">Novo Solípede</small>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>

              <Col md={2}>
                <Link
                  to="/dashboard/gestaofvr/lancamentos-lote"
                  className="text-decoration-none text-reset"
                >
                  <Card className="h-100 text-center shadow-sm border-start">
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                      <BsArrowRepeat size={22} className="mb-2" />
                      <small className="fw-semibold">Lançamentos em Lote</small>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
              
              {/* <Col md={1}>
                <Card
                  className="h-100 text-center shadow-sm border-start"
                  onClick={() => setShowExamesModal(true)}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                    <BsClipboardPlus size={22} className="mb-2" />
                    <small className="fw-semibold">Exames</small>
                  </Card.Body>
                </Card>
              </Col>  */}

              {/* EXPORTAR EXCEL */}
              <Col md={1}>
                <Card
                  className="h-100 text-center shadow-sm border-start"
                  onClick={exportExcel}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                    <BsFileEarmarkExcel size={22} className="mb-2" />
                    <small className="fw-semibold">Excel</small>
                  </Card.Body>
                </Card>
              </Col>

              {/* EXPORTAR PDF */}
              <Col md={1}>
                <Card
                  className="h-100 text-center shadow-sm border-start"
                  onClick={exportPDF}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                    <BsFileEarmarkPdf size={22} className="mb-2" />
                    <small className="fw-semibold">PDF</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ===== INDICADORES ===== */}
            <Row className="my-4 g-3">
              <Col md={3}>
                <Card
                  className="indicator-card"
                  onClick={() => {
                    setIndicador("TOTAL");
                    setPageSolipede(1);
                  }}
                >
                  <Card.Body>
                    <div className="indicator-icon">
                      <BsCollection />
                    </div>
                    <small>Total</small>
                    <h4>{total}</h4>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card
                  className="indicator-card"
                  onClick={() => {
                    setIndicador("ATIVOS");
                    setPageSolipede(1);
                  }}
                >
                  <Card.Body>
                    <div className="indicator-icon">
                      <BsCheckCircleFill />
                    </div>
                    <small>Ativos</small>
                    <h4>{ativos}</h4>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card
                  className="indicator-card"
                  onClick={() => {
                    setIndicador("BAIXADOS");
                    setPageSolipede(1);
                  }}
                >
                  <Card.Body>
                    <div className="indicator-icon">
                      <BsXCircleFill />
                    </div>
                    <small>Baixados</small>
                    <h4>{baixados}</h4>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card
                  className="indicator-card"
                  onClick={() => {
                    setIndicador("RESTRICOES");
                    setPageSolipede(1);
                  }}
                >
                  <Card.Body>
                    <div className="indicator-icon">
                      <LuTriangleAlert />
                    </div>
                    <small>Restrições</small>
                    <h4>{restricoes}</h4>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ===== FILTROS ===== */}
            <Row className="mb-3 g-2 align-items-end">
              <Col md={2}>
                <Form.Control
                  size="sm"
                  placeholder="Filtrar Nº"
                  value={filtroNumero}
                  onChange={(e) => setFiltroNumero(e.target.value)}
                />
              </Col>

              <Col md={3}>
                <Form.Control
                  size="sm"
                  placeholder="Filtrar Alocação"
                  value={filtroAlocacao}
                  onChange={(e) => setFiltroAlocacao(e.target.value)}
                />
              </Col>

              <Col md={2}>
                <Form.Select
                  size="sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(
                      e.target.value === "all" ? "all" : Number(e.target.value)
                    );
                    setPageSolipede(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value="all">Todos</option>
                </Form.Select>
              </Col>
            </Row>

            {/* ===== TABELA ===== */}
            <div className="table-responsive">
              <Table hover striped className="align-middle mb-0 table-sm">
                <thead className="table-light text-center">
                  <tr>
                    {[
                      ["numero", "Nº"],
                      ["nome", "Nome"],
                      ["DataNascimento", "Idade"],
                      ["sexo", "Sexo"],
                      ["pelagem", "Pelagem"],
                      ["alocacao", "Alocação"],
                      ["origem", "Origem"],
                      ["esquadrao", "Esquadrão"],
                      ["baia", "Baia"],
                      ["status", "Status"],
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        role="button"
                        onClick={() => requestSort(key)}
                        className="text-nowrap"
                      >
                        {label}
                        {sortConfig.key === key && (
                          <span className="ms-1">
                            {sortConfig.direction === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </th>
                    ))}

                    {temMovimentacao && <th>Movimentação</th>}
                    <th className="text-nowrap">Gestão</th>
                  </tr>
                </thead>

                <tbody className="text-center">
                  {solipedesPaginados.map((item) => (
                    <tr key={item.numero}>
                      <td className="fw-semibold">
                        <Link
                          to={`/dashboard/gestaofvr/solipede/prontuario/edit/${item.numero}`}
                        >
                          {item.numero}
                        </Link>
                      </td>

                      <td>{item.nome}</td>
                      <td>{calcularIdade(item.DataNascimento)} anos</td>
                      <td>{item.sexo}</td>
                      <td>{item.pelagem}</td>
                      <td>{item.alocacao}</td>
                      <td>{item.origem}</td>
                      <td>{item.esquadrao}</td>
                      <td>{item.baia}</td>
                      <td>
                        <Badge
                          pill
                          className={`bg-opacity-50 text-dark d-inline-flex align-items-center gap-1 ${item.status === "Baixado"
                              ? "bg-danger"
                              : item.status === "Ativo" && temRestricao(item.numero)
                                ? "bg-warning"
                                : "bg-success"
                            }`}
                          title={
                            item.status === "Ativo" && temRestricao(item.numero)
                              ? "Possui restrições"
                              : ""
                          }
                          style={{
                            cursor:
                              item.status === "Ativo" && temRestricao(item.numero)
                                ? "help"
                                : "default",
                          }}
                        >
                          {item.status === "Baixado" ? "● " : "✔ "}
                          {item.status}
                        </Badge>
                      </td>



                      <td className="text-nowrap">
                        <Link
                          to={`/dashboard/gestaofvr/solipede/prontuario/edit/${item.numero}`}
                          className="me-1"
                        >
                          <Button size="sm" variant="light" className="border">
                            <BsClipboardCheck />
                          </Button>
                        </Link>

                        {podeEditarSolipede && (
                          <Link
                            to={`/dashboard/gestaofvr/solipede/edit/${item.numero}`}
                            className="me-1"
                          >
                            <Button size="sm" variant="light" className="border">
                              <BsPencilSquare />
                            </Button>
                          </Link>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* ===== PAGINAÇÃO ===== */}
            {itemsPerPage !== "all" && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={pageSolipede === 1}
                  onClick={() => setPageSolipede((p) => p - 1)}
                >
                  Anterior
                </Button>

                <small className="text-muted">
                  Página {pageSolipede} de {totalPagesSolipede}
                </small>

                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={pageSolipede === totalPagesSolipede}
                  onClick={() => setPageSolipede((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* ==========================================
            MODAL – SOLICITAR EXAMES EM LOTE
        ========================================== */}
        <Modal
          show={showExamesModal}
          onHide={() => {
            setShowExamesModal(false);
            setSelecionadosExames([]);
            setFiltroExamesModal("");
            setObservacaoExames("");
            setExamesErro("");
            setExamesSucesso("");
          }}
          size="xl"
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>🧪 Solicitar Exames em Lote</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {examesErro && <Alert variant="danger">{examesErro}</Alert>}
            {examesSucesso && <Alert variant="success">{examesSucesso}</Alert>}

            <p className="text-muted mb-3">
              Selecione os solípedes e os exames que deseja solicitar
            </p>

            {/* Filtro e Seleção */}
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Filtrar solípedes</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Digite o número ou nome..."
                    value={filtroExamesModal}
                    onChange={(e) => setFiltroExamesModal(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="me-2"
                  onClick={selecionarTodosExames}
                >
                  Selecionar Todos
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={desselecionarTodosExames}
                >
                  Limpar
                </Button>
              </Col>
            </Row>

            {/* Lista de Solípedes com Checkboxes */}
            <Card className="mb-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
              <Card.Body>
                <Form.Label className="fw-bold">
                  Solípedes Selecionados: {selecionadosExames.length}
                </Form.Label>
                {dados
                  .filter((sol) => {
                    if (!filtroExamesModal) return true;
                    const filtro = filtroExamesModal.toLowerCase();
                    return (
                      sol.numero.toString().includes(filtro) ||
                      sol.nome.toLowerCase().includes(filtro)
                    );
                  })
                  .sort((a, b) => a.numero - b.numero)
                  .map((sol) => (
                    <Form.Check
                      key={sol.numero}
                      type="checkbox"
                      label={`Nº ${sol.numero} - ${sol.nome} (${sol.pelagem || "S/P"}) - ${sol.alocacao || "S/A"}`}
                      checked={selecionadosExames.includes(sol.numero)}
                      onChange={() => toggleSelecionadoExame(sol.numero)}
                    />
                  ))}
              </Card.Body>
            </Card>

            {/* Interface de Exames */}
            <h6 className="fw-bold mb-3">Exames a Solicitar</h6>
            <Accordion defaultActiveKey="0" className="mb-3">
              {/* HEMATOLOGIA */}
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  🧪 Hematologia
                </Accordion.Header>
                <Accordion.Body>
                  <Button size="sm" variant="outline-primary" className="mb-2"
                    onClick={() => marcarTodosCategoria("hematologia")}>
                    Marcar todos
                  </Button>
                  <Row>
                    <Col md={6}>
                      <Form.Check type="checkbox" label="Hemograma completo"
                        checked={examesSelecionados.hemogramaCompleto}
                        onChange={() => handleCheckboxExame("hemogramaCompleto")} />
                      <Form.Check type="checkbox" label="Hemácias"
                        checked={examesSelecionados.hemacias}
                        onChange={() => handleCheckboxExame("hemacias")} />
                      <Form.Check type="checkbox" label="Hemoglobina"
                        checked={examesSelecionados.hemoglobina}
                        onChange={() => handleCheckboxExame("hemoglobina")} />
                      <Form.Check type="checkbox" label="Hematócrito"
                        checked={examesSelecionados.hematocrito}
                        onChange={() => handleCheckboxExame("hematocrito")} />
                    </Col>
                    <Col md={6}>
                      <Form.Check type="checkbox" label="VCM, HCM, CHCM"
                        checked={examesSelecionados.indices}
                        onChange={() => handleCheckboxExame("indices")} />
                      <Form.Check type="checkbox" label="Leucograma"
                        checked={examesSelecionados.leucograma}
                        onChange={() => handleCheckboxExame("leucograma")} />
                      <Form.Check type="checkbox" label="Plaquetas"
                        checked={examesSelecionados.plaquetas}
                        onChange={() => handleCheckboxExame("plaquetas")} />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              {/* BIOQUÍMICA */}
              <Accordion.Item eventKey="1">
                <Accordion.Header>🧬 Bioquímica</Accordion.Header>
                <Accordion.Body>
                  <h6 className="text-primary">Função Hepática</h6>
                  <Button size="sm" variant="outline-primary" className="mb-2"
                    onClick={() => marcarTodosCategoria("funcaoHepatica")}>Marcar todos</Button>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Check type="checkbox" label="AST (TGO)"
                        checked={examesSelecionados.ast}
                        onChange={() => handleCheckboxExame("ast")} />
                      <Form.Check type="checkbox" label="GGT"
                        checked={examesSelecionados.ggt}
                        onChange={() => handleCheckboxExame("ggt")} />
                      <Form.Check type="checkbox" label="Bilirrubina total"
                        checked={examesSelecionados.bilirrubinaTotal}
                        onChange={() => handleCheckboxExame("bilirrubinaTotal")} />
                    </Col>
                    <Col md={6}>
                      <Form.Check type="checkbox" label="FA (Fosfatase)"
                        checked={examesSelecionados.fosfataseAlcalina}
                        onChange={() => handleCheckboxExame("fosfataseAlcalina")} />
                      <Form.Check type="checkbox" label="ALT (TGP)"
                        checked={examesSelecionados.alt}
                        onChange={() => handleCheckboxExame("alt")} />
                    </Col>
                  </Row>
                  <h6 className="text-primary">Função Renal</h6>
                  <Button size="sm" variant="outline-primary" className="mb-2"
                    onClick={() => marcarTodosCategoria("funcaoRenal")}>Marcar todos</Button>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Check type="checkbox" label="Ureia"
                        checked={examesSelecionados.ureia}
                        onChange={() => handleCheckboxExame("ureia")} />
                    </Col>
                    <Col md={6}>
                      <Form.Check type="checkbox" label="Creatinina"
                        checked={examesSelecionados.creatinina}
                        onChange={() => handleCheckboxExame("creatinina")} />
                    </Col>
                  </Row>
                  <h6 className="text-primary">Eletrólitos</h6>
                  <Button size="sm" variant="outline-primary" className="mb-2"
                    onClick={() => marcarTodosCategoria("eletrolitos")}>Marcar todos</Button>
                  <Row>
                    <Col md={6}>
                      <Form.Check type="checkbox" label="Sódio (Na⁺)"
                        checked={examesSelecionados.sodio}
                        onChange={() => handleCheckboxExame("sodio")} />
                      <Form.Check type="checkbox" label="Potássio (K⁺)"
                        checked={examesSelecionados.potassio}
                        onChange={() => handleCheckboxExame("potassio")} />
                      <Form.Check type="checkbox" label="Cálcio (Ca²⁺)"
                        checked={examesSelecionados.calcio}
                        onChange={() => handleCheckboxExame("calcio")} />
                    </Col>
                    <Col md={6}>
                      <Form.Check type="checkbox" label="Cloro (Cl⁻)"
                        checked={examesSelecionados.cloro}
                        onChange={() => handleCheckboxExame("cloro")} />
                      <Form.Check type="checkbox" label="Glicose"
                        checked={examesSelecionados.glicose}
                        onChange={() => handleCheckboxExame("glicose")} />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              {/* SOROLOGIA */}
              <Accordion.Item eventKey="2">
                <Accordion.Header>🦠 Sorologia</Accordion.Header>
                <Accordion.Body>
                  <Button size="sm" variant="outline-primary" className="mb-2"
                    onClick={() => marcarTodosCategoria("sorologia")}>Marcar todos</Button>
                  <Row>
                    <Col md={6}>
                      <Form.Check type="checkbox" label="AIE (Coggins)"
                        checked={examesSelecionados.aie}
                        onChange={() => handleCheckboxExame("aie")} />
                      <Form.Check type="checkbox" label="Mormo"
                        checked={examesSelecionados.mormo}
                        onChange={() => handleCheckboxExame("mormo")} />
                      <Form.Check type="checkbox" label="Leptospirose"
                        checked={examesSelecionados.leptospirose}
                        onChange={() => handleCheckboxExame("leptospirose")} />
                      <Form.Check type="checkbox" label="Influenza"
                        checked={examesSelecionados.influenzaEquina}
                        onChange={() => handleCheckboxExame("influenzaEquina")} />
                    </Col>
                    <Col md={6}>
                      <Form.Check type="checkbox" label="Herpesvírus"
                        checked={examesSelecionados.herpesvirusEquino}
                        onChange={() => handleCheckboxExame("herpesvirusEquino")} />
                      <Form.Check type="checkbox" label="Raiva"
                        checked={examesSelecionados.raiva}
                        onChange={() => handleCheckboxExame("raiva")} />
                      <Form.Check type="checkbox" label="Encefalomielite"
                        checked={examesSelecionados.encefalomieliteEquina}
                        onChange={() => handleCheckboxExame("encefalomieliteEquina")} />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              {/* PARASITOLOGIA */}
              <Accordion.Item eventKey="3">
                <Accordion.Header>🧫 Parasitologia</Accordion.Header>
                <Accordion.Body>
                  <Button size="sm" variant="outline-primary" className="mb-2"
                    onClick={() => marcarTodosCategoria("parasitologia")}>Marcar todos</Button>
                  <Form.Check type="checkbox" label="Exame coproparasitológico"
                    checked={examesSelecionados.coproparasitologico}
                    onChange={() => handleCheckboxExame("coproparasitologico")} />
                  <Form.Check type="checkbox" label="OPG (Ovos Por Grama)"
                    checked={examesSelecionados.opg}
                    onChange={() => handleCheckboxExame("opg")} />
                  <Form.Check type="checkbox" label="Coprocultura"
                    checked={examesSelecionados.coprocultura}
                    onChange={() => handleCheckboxExame("coprocultura")} />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            {/* Observações */}
            <Form.Group className="mb-3">
              <Form.Label>Observações (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Informações adicionais sobre a solicitação..."
                value={observacaoExames}
                onChange={(e) => setObservacaoExames(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowExamesModal(false);
                setSelecionadosExames([]);
                setObservacaoExames("");
                setFiltroExamesModal("");
              }}
              disabled={examesLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmarExames}
              disabled={examesLoading || selecionadosExames.length === 0}
            >
              {examesLoading ? (
                <>
                  <Spinner size="sm" className="me-2" animation="border" />
                  Processando...
                </>
              ) : (
                <>
                  <BsClipboardPlus className="me-2" />
                  Confirmar Solicitação ({selecionadosExames.length} solípede{selecionadosExames.length !== 1 ? 's' : ''})
                </>
              )}
            </Button>
          </Modal.Footer>
          
        </Modal>
      </div>
    </div>
  );
};

export default GestaoFvr;
