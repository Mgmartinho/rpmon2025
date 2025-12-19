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
} from "react-bootstrap";

import {
  BsPlus,
  BsPencilSquare,
  BsTrash,
  BsClockHistory,
  BsClipboardCheck,
} from "react-icons/bs";

import "./styles.css";

import { FaUserDoctor } from "react-icons/fa6";
import { GiHorseHead } from "react-icons/gi";
import { api } from "../../../services/api";

const GestaoFvr = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===========================
     CONTROLE INDICADORES
  =========================== */
  const [indicador, setIndicador] = useState("TOTAL");

  /* ===========================
     PAGINAÇÃO – TAREFAS
  =========================== */
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

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
     INDICADORES (DADOS REAIS)
  =========================== */
  const total = dados.length;

  const ativos = dados.filter(
    (item) => item.status === "Ativo"
  ).length;

  const baixados = dados.filter(
    (item) => item.status === "Baixado"
  ).length;

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
        const response = await fetch(API_URL);
        const data = await response.json();
        setDados(data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  /* ===========================
     INDICADORES (DADOS REAIS)
     ⚠️ BLOCO ORIGINAL MANTIDO
     ⚠️ COMENTADO PARA EVITAR ERRO
  =========================== */
  /*
  const total = dados.length;

  const ativos = dados.filter(
    (item) => item.status === "Ativo"
  ).length;

  const baixados = dados.filter(
    (item) => item.status === "Baixado"
  ).length;

  const movimentacao = dados.filter(
    (item) =>
      item.movimentacao !== null &&
      item.movimentacao !== "" &&
      item.movimentacao !== undefined
  ).length;
  */

  /* ===========================
     TAREFAS (INALTERADO)
  =========================== */
  const statusVariant = {
    NEW: "info",
    INPROGRESS: "primary",
    PENDING: "warning",
    COMPLETED: "success",
  };

  const priorityVariant = {
    LOW: "success",
    MEDIUM: "warning",
    HIGH: "danger",
  };

  const totalTasks = dados.length;
  const totalPages = Math.ceil(totalTasks / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const tarefasPaginadas = dados.slice(startIndex, endIndex);

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
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* ===========================
     PAGINAÇÃO – SOLÍPEDES
  =========================== */
  const totalSolipedes = solipedesFiltrados.length;
  const totalPagesSolipede =
    itemsPerPage === "all"
      ? 1
      : Math.ceil(totalSolipedes / itemsPerPage);

  const inicio =
    itemsPerPage === "all" ? 0 : (pageSolipede - 1) * itemsPerPage;
  const fim =
    itemsPerPage === "all"
      ? totalSolipedes
      : inicio + itemsPerPage;

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
      <div className="">
       {/* =====================
   GESTÃO DE TAREFAS
===================== */}
<Card className="shadow-sm mb-4">
  <Card.Body>
    <Row className="align-items-center mb-3">
      <Col>
        <h5 className="mb-0">
          <BsClipboardCheck className="me-2" />
          Lista de Tarefas
        </h5>
        <small className="text-muted">
          Acompanhamento operacional
        </small>
      </Col>
    </Row>

    <Table hover responsive size="sm">
      <thead>
        <tr>
          <th>Tarefa</th>
          <th>Status</th>
          <th>Prioridade</th>
          <th className="text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        {tarefasPaginadas.length === 0 && (
          <tr>
            <td colSpan={4} className="text-center text-muted">
              Nenhuma tarefa cadastrada
            </td>
          </tr>
        )}

        {tarefasPaginadas.map((item, index) => (
          <tr key={index}>
            <td>
              <strong>{item.nome || "Sem descrição"}</strong>
            </td>

            <td>
              <Badge bg={statusVariant[item.status] || "secondary"}>
                {item.status || "N/D"}
              </Badge>
            </td>

            <td>
              <Badge
                bg={priorityVariant[item.prioridade] || "secondary"}
              >
                {item.prioridade || "N/D"}
              </Badge>
            </td>

            <td className="text-center">
              <Button
                size="sm"
                variant="outline-primary"
                className="me-1"
              >
                <BsPencilSquare />
              </Button>

              <Button
                size="sm"
                variant="outline-danger"
              >
                <BsTrash />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    {/* PAGINAÇÃO TAREFAS */}
    {totalPages > 1 && (
      <div className="d-flex justify-content-end mt-3">
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Anterior
        </Button>

        <span className="mx-3 small align-self-center">
          Página {currentPage} de {totalPages}
        </span>

        <Button
          size="sm"
          variant="outline-secondary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Próxima
        </Button>
      </div>
    )}
  </Card.Body>
</Card>


        {/* =================================
           GESTÃO VETERINÁRIA – SOLÍPEDES
        ================================= */}
        <Card className="shadow-sm">
          <Card.Body>
            {/* HEADER */}
            <Row className="align-items-center">
              <Col md={8}>
                <h4 className="mb-1">
                  Gestão Veterinária de Solípedes (FVR)
                </h4>
                <small className="text-muted">
                  Controle operacional e histórico clínico
                </small>
              </Col>
              <Col md={4} className="text-end">
                <Link to="/dashboard/gestaofvr/solipede/create">
                  <Button variant="primary" size="sm">
                    <BsPlus className="me-1" /> Criar novo Solípede
                  </Button>
                </Link>
              </Col>
            </Row>

           {/* ===== INDICADORES ===== */}
          <Row className="my-4">
            <Col md={3}>
              <Card
                className="text-center border-0 shadow-sm card-hover total p-2"
                 onClick={() => {
    setIndicador("TOTAL");
    setPageSolipede(1);
  }}
              >
                <Card.Body>
                  <small>Total</small>
                  <h4>{total}</h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card
                className="text-center border-start border-success border-4 shadow-sm card-hover success"
                onClick={() => setIndicador("ATIVOS")}
              >
                <Card.Body>
                  <small>Ativos</small>
                  <h4 className="text-success">{ativos}</h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card
                className="text-center border-start border-danger border-4 shadow-sm card-hover danger"
                onClick={() => {
    setIndicador("BAIXADOS");
    setPageSolipede(1);
  }}
              >
                <Card.Body>
                  <small>Baixados</small>
                  <h4 className="text-danger">{baixados}</h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card
                className="text-center border-start border-warning border-4 shadow-sm card-hover warning"
                onClick={() => setIndicador("MOVIMENTACAO")}
              >
                <Card.Body>
                  <small>Movimentação</small>
                  <h4 className="text-warning">{movimentacao}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>


            {/* FILTROS */}
            <Row className="my-3 g-2">
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
                      e.target.value === "all"
                        ? "all"
                        : Number(e.target.value)
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

            {/* TABELA */}
            <Table striped hover responsive className="align-middle">
              <thead className="table-primary text-center">
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
                      style={{ cursor: "pointer" }}
                      onClick={() => requestSort(key)}
                    >
                      {label}{" "}
                      {sortConfig.key === key &&
                        (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </th>
                  ))}
                  {temMovimentacao && <th>Movimentação</th>}
                  <th>Gestão</th>
                </tr>
              </thead>

              <tbody>
                {solipedesPaginados.map((item) => (
                  <tr key={item.numero} className="text-center">
                    <td className="fw-bold">
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
                        bg={item.status === "Baixado" ? "danger" : "success"}
                      >
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
                    <td>
                      <Button size="sm" variant="info" className="me-1">
                        <BsClockHistory />
                      </Button>
                      <Link
                        to={`/dashboard/gestaofvr/solipede/prontuario/${item.numero}`}
                      >
                        <Button
                          size="sm"
                          variant="success"
                          className="me-1"
                        >
                          <BsClipboardCheck />
                        </Button>
                      </Link>
                      <Link
                        to={`/dashboard/gestaofvr/solipede/edit/${item.numero}`}
                      >
                        <Button size="sm" variant="warning" className="me-1">
                          <BsPencilSquare />
                        </Button>
                      </Link>
                      <Button size="sm" variant="danger">
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* PAGINAÇÃO */}
            {itemsPerPage !== "all" && (
              <div className="d-flex justify-content-between mt-3">
                <Button
                  size="sm"
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
