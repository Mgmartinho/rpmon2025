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

  const baixadosDetalhados = useMemo(() => {
    const solipedesPorNumero = new Map(
      dados.map((solipede) => [normalizarNumeroSolipede(solipede.numero), solipede])
    );

    const usuariosPorId = new Map();
    dadosProntuario.forEach((registro) => {
      const nome = registro?.usuario_nome;

      if (!nome) return;

      if (registro?.usuarioId !== undefined && registro?.usuarioId !== null) {
        usuariosPorId.set(String(registro.usuarioId), nome);
      }

      if (registro?.usuario_id !== undefined && registro?.usuario_id !== null) {
        usuariosPorId.set(String(registro.usuario_id), nome);
      }

      if (registro?.tratamento_usuario_id !== undefined && registro?.tratamento_usuario_id !== null) {
        usuariosPorId.set(String(registro.tratamento_usuario_id), nome);
      }
    });

    return dadosProntuario
      .filter((registro) => registro?.tipo === "Tratamento")
      .filter((registro) => {
        const numeroNormalizado = normalizarNumeroSolipede(registro.numero_solipede);
        const solipede = solipedesPorNumero.get(numeroNormalizado);
        const statusConclusao = String(
          registro?.status_conclusao || registro?.tratamento_status || ""
        )
          .toLowerCase()
          .trim();

        if (!solipede || solipede.status !== "Baixado") return false;
        if (statusConclusao !== "em_andamento") return false;

        if (!String(solipede.numero ?? "").includes(filtroNumero)) return false;

        if (
          !(solipede.alocacao || "")
            .toLowerCase()
            .includes(filtroAlocacao.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .map((registro) => {
        const numeroNormalizado = normalizarNumeroSolipede(registro.numero_solipede);
        const solipede = solipedesPorNumero.get(numeroNormalizado);
        const numeroSolipede = solipede?.numero ?? registro.numero_solipede ?? "-";
        const nomeSolipede = solipede?.nome ?? registro.solipede_nome ?? "-";
        const dataTratamento = registro.tratamento_data_criacao || registro.data_criacao;
        const responsavelId =
          registro.tratamento_usuario_id ??
          registro.usuario_id ??
          registro.usuarioId ??
          null;
        const responsavelNome =
          registro.tratamento_usuario_nome ||
          registro.usuario_nome ||
          (responsavelId !== null ? usuariosPorId.get(String(responsavelId)) : null) ||
          "-";

        return {
          id: registro.id,
          numeroSolipede,
          dataTratamento,
          tipo: registro.tipo || "Tratamento",
          alocacao: solipede?.alocacao || "-",
          solipe: `${numeroSolipede} - ${nomeSolipede}`,
          diagnostico: registro.diagnostico || "-",
          responsavel: responsavelNome,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.dataTratamento || 0).getTime() -
          new Date(a.dataTratamento || 0).getTime()
      );
  }, [dados, dadosProntuario, filtroAlocacao, filtroNumero, normalizarNumeroSolipede]);

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
    const baseRegistros = indicador === "BAIXADOS" ? baixadosDetalhados : solipeddesOrdenados;
    const total = baseRegistros.length;
    const totalPages = itemsPerPage === "all" ? 1 : Math.ceil(total / itemsPerPage);
    const inicio = itemsPerPage === "all" ? 0 : (pageSolipede - 1) * itemsPerPage;
    const fim = itemsPerPage === "all" ? total : inicio + itemsPerPage;
    const paginados = baseRegistros.slice(inicio, fim);

    return {
      totalPagesSolipede: totalPages,
      solipedesPaginados: paginados,
    };
  }, [solipeddesOrdenados, baixadosDetalhados, indicador, itemsPerPage, pageSolipede]);

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
      microchip: item.microchip,
      PaletaDireita: item.paleta_direita,
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
      "Microchip",
      "Paleta Direita",
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
      item.microchip,
      item.paleta_direita,
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
                  {indicador === "BAIXADOS" ? (
                    <tr>
                      <th>Data do Tratamento</th>
                      <th>Tipo</th>
                      <th>Alocação</th>
                      <th>Solipe</th>
                      <th>Motivo da Baixa</th>
                      <th>Responsável</th>
                    </tr>
                  ) : (
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
                  )}
                </thead>

                <tbody className="text-center">
                  {indicador === "BAIXADOS" ? (
                    solipedesPaginados.length > 0 ? (
                      solipedesPaginados.map((item) => (
                        <tr key={`${item.id}-${item.numeroSolipede}`}>
                          <td>
                            {item.dataTratamento
                              ? new Date(item.dataTratamento).toLocaleDateString("pt-BR")
                              : "-"}
                          </td>
                          <td>{item.tipo}</td>
                          <td>{item.alocacao}</td>
                          <td className="text-start">
                            <Link
                              to={`/dashboard/gestaofvr/solipede/prontuario/edit/${item.numeroSolipede}`}
                            >
                              {item.solipe}
                            </Link>
                          </td>
                          <td className="text-start">{item.diagnostico}</td>
                          <td>{item.responsavel}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-muted py-3">
                          Nenhum registro de baixa por tratamento encontrado.
                        </td>
                      </tr>
                    )
                  ) : (
                    solipedesPaginados.map((item) => (
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
                    ))
                  )}
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

      </div>
    </div>
  );
};

export default GestaoFvr;
