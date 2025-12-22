import { useEffect, useState } from "react";
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
} from "react-bootstrap";

import {
  BsPlus,
  BsPencilSquare,
  BsTrash,
  BsClockHistory,
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

import { FaUserDoctor } from "react-icons/fa6";
import { GiHorseHead } from "react-icons/gi";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../../../services/api";

const GestaoFvr = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

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
      MODAL – MOVIMENTAÇÃO EM LOTE
    =========================== */
  const [showMovModal, setShowMovModal] = useState(false);
  const [selecionados, setSelecionados] = useState([]);
  const [novaMovimentacao, setNovaMovimentacao] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [movLoading, setMovLoading] = useState(false);
  const [movErro, setMovErro] = useState("");
  const [movSucesso, setMovSucesso] = useState("");
  const [filtroModal, setFiltroModal] = useState("");

  const opcoesMovimentacao = [
    "Colina",
    "RPMon",
    "Barro Branco",
    "Hospital Veterinario",
    "Escola de Equitação do Exército",
    "Representação",
    "Destacamento Montado de Campinas",
    "Destacamento Montado de Santos",
    "Destacamento Montado de Taubaté",
    "Destacamento Montado de Mauá",
    "Destacamento Montado de São Bernardo do Campo",
    "Destacamento Montado de Presidente Prudente",
    "Destacamento Montado de São José do Rio Preto",
    "Destacamento Montado de Barretos",
    "Destacamento Montado de Ribeirão Preto",
    "Destacamento Montado de Bauru",
    "Destacamento Montado de Marília",
    "Destacamento Montado de Avaré",
    "Destacamento Montado de Itapetininga",
    "Destacamento Montado de Sorocaba",
  ];

  /* ===========================
     INDICADORES (DADOS REAIS)
  =========================== */
  const total = dados.length;

  const ativos = dados.filter((item) => item.status === "Ativo").length;

  const baixados = dados.filter((item) => item.status === "Baixado").length;

  const movimentacao = dados.filter(
    (item) =>
      item.movimentacao !== null &&
      item.movimentacao !== "" &&
      item.movimentacao !== undefined
  ).length;

  /* ===========================
     BUSCA DADOS
  =========================== */
  useEffect(() => {
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

    carregarDados();
  }, []);

  const exportExcel = () => {
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
      Movimentacao: item.movimentacao || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Solipedes");

    XLSX.writeFile(workbook, "solipedes_fvr.xlsx");
  };

  const exportPDF = () => {
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
      item.movimentacao || "",
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
  };

  // mostrar tabela de movimentação se houver algum registro com movimentação
  const temMovimentacao = dados.some(
    (item) => item.movimentacao !== null && item.movimentacao !== ""
  );

  /* ===========================
     FILTRAGEM – SOLÍPEDES
  =========================== */
  /* ===========================
   FILTRAGEM – SOLÍPEDES
=========================== */
  let solipedesFiltrados = dados.filter((item) => {
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
  /* ===========================
     ORDENAÇÃO – SOLÍPEDES
  =========================== */
  if (sortConfig.key) {
    solipedesFiltrados.sort((a, b) => {
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
  }

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* ===========================
     PAGINAÇÃO – SOLÍPEDES
  =========================== */
  const totalSolipedes = solipedesFiltrados.length;
  const totalPagesSolipede =
    itemsPerPage === "all" ? 1 : Math.ceil(totalSolipedes / itemsPerPage);

  const inicio = itemsPerPage === "all" ? 0 : (pageSolipede - 1) * itemsPerPage;
  const fim = itemsPerPage === "all" ? totalSolipedes : inicio + itemsPerPage;

  const solipedesPaginados = solipedesFiltrados.slice(inicio, fim);

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
                    <Card.Body className="d-flex flex-column justify-content-center">
                      <BsPlus size={22} className="mb-2" />
                      <small className="fw-semibold">Novo Solípede</small>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>

              <Col md={2}>
                <Card
                  className="h-100 text-center shadow-sm border-start"
                  onClick={() => setShowMovModal(true)}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <BsArrowRepeat size={22} className="mb-2" />
                    <small className="fw-semibold">Gerar movimentação</small>
                  </Card.Body>
                </Card>
              </Col>

              {/* EXPORTAR EXCEL */}
              <Col md={1}>
                <Card
                  className="h-100 text-center shadow-sm border-start"
                  onClick={exportExcel}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <BsFileEarmarkExcel size={22} className="mb-2" />
                    <small className="fw-semibold">Exportar Excel</small>
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
                  <Card.Body className="d-flex flex-column justify-content-center">
                    <BsFileEarmarkPdf size={22} className="mb-2" />
                    <small className="fw-semibold">Exportar PDF</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ===== INDICADORES ===== */}
            <Row className="my-4 g-3">
              <Col md={3}>
                <Card
                  className="indicator-card indicator-total"
                  role="button"
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
                  className="indicator-card indicator-success"
                  role="button"
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
                  className="indicator-card indicator-danger"
                  role="button"
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
                  className="indicator-card indicator-warning"
                  role="button"
                  onClick={() => {
                    setIndicador("MOVIMENTACAO");
                    setPageSolipede(1);
                  }}
                >
                  <Card.Body>
                    <div className="indicator-icon">
                      <BsArrowRepeat />
                    </div>
                    <small>Movimentação</small>
                    <h4>{movimentacao}</h4>
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
                      ["DataNascimento", "Ano"],
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
                </thead>

                <tbody className="text-center">
                  {solipedesPaginados.map((item) => (
                    <tr key={item.numero}>
                      <td className="fw-semibold">
                        <Link
                          to={`/dashboard/gestaofvr/solipede/edit/${item.numero}`}
                        >
                          {item.numero}
                        </Link>
                      </td>

                      <td>{item.nome}</td>
                      <td>{new Date(item.DataNascimento).getFullYear()}</td>
                      <td>{item.sexo}</td>
                      <td>{item.pelagem}</td>
                      <td>{item.alocacao}</td>
                      <td>{item.origem}</td>
                      <td>{item.esquadrao}</td>

                      <td>
                        <Badge
                          pill
                          bg={item.status === "Baixado" ? "danger" : "success"}
                          className="bg-opacity-50 text-dark d-inline-flex align-items-center gap-1"
                        >
                          {item.status === "Baixado" ? "● " : "✔ "}
                          {item.status}
                        </Badge>
                      </td>

                      {temMovimentacao && (
                        <td>
                          {item.movimentacao && (
                            <Badge bg="warning" text="dark">
                              {item.movimentacao}
                            </Badge>
                          )}
                        </td>
                      )}

                      <td className="text-nowrap">
                        <Button
                          size="sm"
                          variant="light"
                          className="me-1 border"
                        >
                          <BsClockHistory />
                        </Button>

                        <Link
                          to={`/dashboard/gestaofvr/solipede/prontuario/edit/${item.numero}`}
                          className="me-1"
                        >
                          <Button size="sm" variant="light" className="border">
                            <BsClipboardCheck />
                          </Button>
                        </Link>

                        <Link
                          to={`/dashboard/gestaofvr/solipede/edit/${item.numero}`}
                          className="me-1"
                        >
                          <Button size="sm" variant="light" className="border">
                            <BsPencilSquare />
                          </Button>
                        </Link>

                        <Button size="sm" variant="light" className="border">
                          <BsTrash />
                        </Button>
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

        {/* ===== MODAL MOVIMENTAÇÃO EM LOTE ===== */}
        <Modal
          show={showMovModal}
          onHide={() => setShowMovModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Gerar Movimentação em Lote</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Movimentação (coluna movimentacao)</Form.Label>
                  <Form.Select
                    value={novaMovimentacao}
                    onChange={(e) => setNovaMovimentacao(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {opcoesMovimentacao.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Senha do Usuário</Form.Label>
                  <Form.Control
                    type="password"
                    value={senhaConfirmacao}
                    onChange={(e) => setSenhaConfirmacao(e.target.value)}
                    placeholder="Confirme sua senha"
                  />
                </Form.Group>
              </Col>
            </Row>

            {(() => {
              const termo = filtroModal.toLowerCase();
              const modalFiltrados = solipedesFiltrados.filter((s) => {
                return (
                  s.nome?.toLowerCase().includes(termo) ||
                  s.numero?.toString().includes(termo) ||
                  (s.movimentacao || "").toLowerCase().includes(termo) ||
                  (s.alocacao || "").toLowerCase().includes(termo)
                );
              });

              const todosSelecionados =
                modalFiltrados.length > 0 &&
                modalFiltrados.every((s) => selecionados.includes(s.numero));

              return (
                <div className="border rounded p-2 mb-3" style={{ maxHeight: 360, overflowY: "auto" }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Selecionar Solípedes</strong>
                    <div className="d-flex gap-2">
                      <Form.Control
                        size="sm"
                        placeholder="Filtrar por nº, nome, status ou mov."
                        value={filtroModal}
                        onChange={(e) => setFiltroModal(e.target.value)}
                        style={{ width: 260 }}
                      />
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => {
                          if (todosSelecionados) {
                            const restantes = selecionados.filter((n) => !modalFiltrados.some((s) => s.numero === n));
                            setSelecionados(restantes);
                          } else {
                            const novos = modalFiltrados.map((s) => s.numero);
                            const merge = Array.from(new Set([...selecionados, ...novos]));
                            setSelecionados(merge);
                          }
                        }}
                      >
                        {todosSelecionados ? "Limpar seleção" : "Selecionar todos"}
                      </Button>
                    </div>
                  </div>

                  <Table size="sm" hover className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 40 }}></th>
                        <th>Nº</th>
                        <th>Nome / Alocação</th>
                        <th>Movimentação Atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalFiltrados.map((s) => {
                        const checked = selecionados.includes(s.numero);
                        return (
                          <tr key={s.numero}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setSelecionados((prev) => {
                                    if (e.target.checked) return [...prev, s.numero];
                                    return prev.filter((n) => n !== s.numero);
                                  });
                                }}
                              />
                            </td>
                            <td className="fw-semibold">{s.numero}</td>
                            <td>
                              <div className="fw-semibold">{s.nome}</div>
                              <div className="text-muted small">{s.alocacao || "-"}</div>
                            </td>
                            <td>{s.movimentacao || "-"}</td>
                          </tr>
                        );
                      })}
                      {modalFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-muted py-3">
                            Nenhum solípede encontrado com esse filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              );
            })()}

            {movErro && <Alert variant="danger">{movErro}</Alert>}
            {movSucesso && <Alert variant="success">{movSucesso}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMovModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={
                movLoading ||
                !novaMovimentacao ||
                !senhaConfirmacao ||
                selecionados.length === 0
              }
              onClick={async () => {
                try {
                  setMovErro("");
                  setMovSucesso("");
                  setMovLoading(true);
                  const resp = await api.movimentacaoBulk({
                    numeros: selecionados,
                    novoStatus: novaMovimentacao,
                    senha: senhaConfirmacao,
                  });
                  if (resp && resp.success) {
                    // Atualiza os dados locais
                    setDados((prev) =>
                      prev.map((d) =>
                        selecionados.includes(d.numero)
                          ? { ...d, movimentacao: novaMovimentacao, status: novaMovimentacao }
                          : d
                      )
                    );
                    setMovSucesso(
                      `Movimentação aplicada a ${resp.count} solípedes.`
                    );
                    setSelecionados([]);
                    setSenhaConfirmacao("");
                    setNovaMovimentacao("");
                  } else {
                    setMovErro(resp?.error || "Falha ao aplicar movimentação");
                  }
                } catch (e) {
                  setMovErro(e.message || "Erro inesperado");
                } finally {
                  setMovLoading(false);
                }
              }}
            >
              {movLoading ? "Aplicando..." : "Confirmar Movimentação"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default GestaoFvr;
