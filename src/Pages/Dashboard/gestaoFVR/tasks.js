import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Badge,
  Spinner,
  Form,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsClockHistory, BsClipboard2 } from "react-icons/bs";
import { api } from "../../../services/api";

export default function TaskCreatePage() {
  const navigate = useNavigate();
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    carregarLancamentos();
  }, []);

  const carregarLancamentos = async () => {
    try {
      setLoading(true);

      console.log("🔄 Iniciando carregamento de lançamentos...");
      const data = await api.listarTodosProntuarios();

      console.log("📦 Dados retornados:", data);
      console.log("📊 Tipo dos dados:", typeof data);
      console.log("📊 É array?", Array.isArray(data));
      console.log("📊 Quantidade:", Array.isArray(data) ? data.length : "não é array");

      if (Array.isArray(data)) {
        console.log("✅ Setando lançamentos:", data.length, "registros");
        setLancamentos(data);
      } else {
        console.log("⚠️ Dados não são array, setando vazio");
        setLancamentos([]);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar lançamentos:", err);
      setLancamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo) => {
    const cores = {
      // "Consulta Clínica": "primary",
      "Tratamento": "danger",
      "Restrições": "warning",
      "Dieta": "success",
      "Suplementação": "info",
      "Movimentações": "primary",
      //"Exame": "secondary",
      // "Vacinação": "success",
      // "Vermifugação": "info",
      // "Exames AIE / Mormo": "warning",
    };
    return cores[tipo] || "secondary";
  };

  const lancamentosFiltrados =
    filtroTipo === "Todos"
      ? lancamentos
      : lancamentos.filter((l) => l.tipo === filtroTipo);

  // Cálculos de paginação
  const totalPages = itemsPerPage === "Todos"
    ? 1
    : Math.ceil(lancamentosFiltrados.length / itemsPerPage);

  const indexOfLastItem = itemsPerPage === "Todos"
    ? lancamentosFiltrados.length
    : currentPage * itemsPerPage;

  const indexOfFirstItem = itemsPerPage === "Todos"
    ? 0
    : indexOfLastItem - itemsPerPage;

  const currentItems = lancamentosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  // Reset da página ao mudar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroTipo, itemsPerPage]);

  const tiposDisponiveis = ["Todos", "Tratamento", "Restrições", "Dieta", "Suplementação", "Movimentação"];

  const contagemPorTipo = lancamentos.reduce((acc, l) => {
    acc[l.tipo] = (acc[l.tipo] || 0) + 1;
    return acc;
  }, {});

  const abrirProntuario = (numeroSolipede) => {
    navigate(`/dashboard/gestaofvr/solipede/prontuario/edit/${numeroSolipede}`);
  };

  const mostrarSomenteEmAndamento = true;

  const registrosFiltrados = mostrarSomenteEmAndamento
    ? currentItems.filter(
      (registro) => registro.status_conclusao === "em_andamento"
    )
    : currentItems;


  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Carregando lançamentos...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* TÍTULO */}
      <Row className="mb-4">
        <Col>
          <h5 className="fw-semibold">
            <BsClipboard2 className="me-2" />
            Lançamentos de Prontuário
          </h5>
          <small className="text-muted">
            Histórico completo de todos os lançamentos veterinários
          </small>
        </Col>
      </Row>

      <Row className="g-4">
        {/* COLUNA ESQUERDA - Filtros e Estatísticas */}
        <Col xl={3} lg={4}>
          {/* FILTRO POR TIPO */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <h6 className="mb-3">Filtrar por Tipo</h6>
              <Form.Select
                size="sm"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                {tiposDisponiveis.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo} {tipo !== "Todos" && contagemPorTipo[tipo] ? `(${contagemPorTipo[tipo]})` : ""}
                  </option>
                ))}
              </Form.Select>
            </Card.Body>
          </Card>

          {/* ESTATÍSTICAS */}
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Estatísticas</h6>
              <div className="d-flex flex-column gap-2">
                <div>
                  <strong>Total de Lançamentos:</strong>
                  <Badge bg="primary" className="ms-2">
                    {lancamentos.length}
                  </Badge>
                </div>
                <hr className="my-2" />
                {Object.entries(contagemPorTipo).map(([tipo, qtd]) => (
                  <div
                    key={tipo}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <Badge bg={getTipoColor(tipo)}>{tipo}</Badge>
                    <span className="text-muted">{qtd}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUNA DIREITA - Lista de Lançamentos */}
        <Col xl={9} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <Row className="align-items-center">
                <Col md={6}>
                  <h6 className="mb-0">
                    {filtroTipo !== "Todos" ? `Lançamentos: ${filtroTipo}` : "Todos os Lançamentos"}
                    <Badge bg="secondary" className="ms-2">
                      {lancamentosFiltrados.length}
                    </Badge>
                  </h6>
                </Col>
                <Col md={6} className="text-end">
                  <div className="d-flex align-items-center justify-content-end gap-2">
                    <small className="text-muted">Exibir:</small>
                    <Form.Select
                      size="sm"
                      style={{ width: "100px" }}
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(e.target.value === "Todos" ? "Todos" : Number(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value="Todos">Todos</option>
                    </Form.Select>
                  </div>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {registrosFiltrados.length === 0 ? (
                <Card className="shadow-sm border-0">
                  <Card.Body className="text-center py-5">
                    <p className="text-muted mb-0">
                      <BsClockHistory style={{ fontSize: "30px", marginBottom: "10px" }} />
                      <br />
                      Nenhum lançamento encontrado para o filtro selecionado
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                registrosFiltrados.map((registro) => {
                  // Proteção contra dados inválidos
                  if (!registro || !registro.id) {
                    console.warn("⚠️ Registro inválido encontrado:", registro);
                    return null;
                  }

                  const dataBR = registro.data_criacao
                    ? new Date(registro.data_criacao).toLocaleDateString("pt-BR")
                    : "Data não disponível";
                  const horaBR = registro.data_criacao
                    ? new Date(registro.data_criacao).toLocaleTimeString("pt-BR")
                    : "Hora não disponível";

                  return (
                    <Card
                      key={registro.id}
                      className="shadow-sm border-0 mb-3 border-start border-4"
                      style={{
                        borderLeftColor: `var(--bs-${getTipoColor(registro.tipo || "Observação Geral")})`,
                        cursor: "pointer",
                      }}
                      onClick={() => abrirProntuario(registro.numero_solipede)}
                    >
                      <Card.Body>
                        <Row className="align-items-start mb-2">
                          <Col md={6}>
                            <Badge bg={getTipoColor(registro.tipo)} className="mb-2">
                              {registro.tipo}
                            </Badge>
                            <p
                              className="mb-1"
                              style={{ fontSize: "12px", color: "#999" }}
                            >
                              <BsClockHistory className="me-1" />
                              <strong>{dataBR}</strong> às {horaBR}
                            </p>
                            <p className="mb-0" style={{ fontSize: "13px" }}>
                              <strong>🐴 {registro.solipede_nome || "N/A"}</strong> - Nº{" "}
                              {registro.numero_solipede}
                              {registro.solipede_esquadrao && (
                                <Badge bg="light" text="dark" className="ms-2">
                                  {registro.solipede_esquadrao}
                                </Badge>
                              )}
                            </p>
                          </Col>
                          <Col md={6} className="text-end">
                            <div style={{ fontSize: "13px" }}>
                              <p className="mb-1">
                                <strong>{registro.usuario_nome || "Sistema"}</strong>
                              </p>
                              <small className="text-muted d-block">
                                {registro.usuario_registro &&
                                  `Registro: ${registro.usuario_registro}`}
                              </small>
                              <Badge bg="secondary" style={{ fontSize: "11px" }}>
                                {registro.usuario_perfil || "Desconhecido"}
                              </Badge>
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
                            }}
                          >
                            {registro.observacao}
                          </p>
                        </div>
                        {registro.recomendacoes && (
                          <div className="bg-warning bg-opacity-10 p-2 rounded border-start border-warning">
                            <small className="text-muted">
                              <strong>📌 Recomendação:</strong>{" "}
                              {registro.recomendacoes}
                            </small>
                          </div>
                        )}
                        <div className="text-end mt-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirProntuario(registro.numero_solipede);
                            }}
                          >
                            Ver Prontuário Completo
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })
              )}
            </Card.Body>


            {/* Paginação */}
            {itemsPerPage !== "Todos" && totalPages > 1 && (
              <Card.Footer className="bg-white border-top">
                <Row className="align-items-center">
                  <Col md={6}>
                    <small className="text-muted">
                      Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, lancamentosFiltrados.length)} de {lancamentosFiltrados.length} registros
                    </small>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex justify-content-end align-items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        ← Anterior
                      </Button>
                      <Badge bg="primary" className="px-3">
                        Página {currentPage} de {totalPages}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Próxima →
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
