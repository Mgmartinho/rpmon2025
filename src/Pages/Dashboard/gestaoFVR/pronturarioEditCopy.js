import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Spinner,
  Container,
  ListGroup,
  Alert,
  TabContainer,
  Tab,
  Nav,
  Form,
} from "react-bootstrap";
import {
  BsCheckCircle,
  BsExclamationTriangle,
  BsArchive,
  BsPersonFill,
  BsGeoAltFill,
  BsClipboard2PulseFill,
  BsCalendar3,
  BsShieldFill,
  BsClockHistory,
  BsPlusCircle,
  BsFilterCircle,
} from "react-icons/bs";

import { LuTriangleAlert, LuShieldAlert } from "react-icons/lu";

import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../../../services/api";
import ProntuarioTratamento from "./prontuario/prontuarioTratamento";
import ProntuarioRestricao from "./prontuario/prontuarioRestricao";
import ProntuarioDieta from "./prontuario/prontuarioDieta";
import ProntuarioSuplementacao from "./prontuario/prontuarioSuplementacao";
import ProntuarioMovimentacao from "./prontuario/prontuarioMovimentacao";
import HistoricoProntuarioDieta from "./historico/historicoProntuarioDieta";
import HistoricoProntuarioRestricoes from "./historico/historicoProntuarioRestricoes";
import HistoricoProntuarioTratamento from "./historico/historicoProntuarioTratamento";
import HistoricoProntuarioSuplementacao from "./historico/historicoProntuarioSuplementacao";
import HistoricoProntuarioMovimentacao from "./historico/historicoProntuarioMovimentacao";

export default function ProntuarioSolipedeEditCopy() {


  const { numero } = useParams();
  const [searchParams] = useSearchParams();
  const readonlyMode = searchParams.get("readonly") === "true";

  const [solipede, setSolipede] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [, setLoadingHistorico] = useState(true);
  const [tratamentosEmAndamento, setTratamentosEmAndamento] = useState(0);
  const [baixasPendentes, setBaixasPendentes] = useState(0);

  const [tipoObservacao, setTipoObservacao] = useState("Tratamento");
  const [filtroHistorico, setFiltroHistorico] = useState("Todos");
  const [buscaHistorico, setBuscaHistorico] = useState("");

  // Carrega dados do solípede
  useEffect(() => {
    const fetchSolipede = async () => {
      try {
        const data = readonlyMode
          ? await api.obterSolipedeExcluido(numero)
          : await api.obterSolipede(numero);

        if (data && data.error) {
          setError(data.error);
          setSolipede(null);
        } else if (data) {
          setSolipede(data);
          setError(null);
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

  // Carrega histórico/prontuário
  useEffect(() => {
    async function carregarProntuario() {
      try {
        const response = readonlyMode
          ? await api.listarProntuarioExcluido(solipede.numero)
          : await api.listarProntuario(solipede.numero);

        const historicoFiltrado = Array.isArray(response)
          ? response.filter(reg => reg.tipo !== "Observações Comportamentais")
          : [];
        setHistorico(historicoFiltrado);

        const baixas = await api.contarBaixasPendentes(solipede.numero);
        setBaixasPendentes(baixas.total || 0);

        const tratamentos = await api.contarTratamentosEmAndamento(solipede.numero);
        setTratamentosEmAndamento(tratamentos.total || 0);
      } catch (err) {
        console.error("Erro ao carregar prontuário", err);
        setHistorico([]);
      } finally {
        setLoadingHistorico(false);
      }
    }

    if (solipede?.numero) {
      carregarProntuario();
    }
  }, [solipede, readonlyMode]);

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

  const restricoesAtivas = historico.filter((reg) => reg.tipo === "Restrições");
  const historicoOrdenado = [...historico].sort((a, b) => {
    const dataA = new Date(a.data_criacao || 0).getTime();
    const dataB = new Date(b.data_criacao || 0).getTime();
    return dataB - dataA;
  });

  const tiposDisponiveis = [
    "Todos",
    "Tratamento",
    "Restrições",
    "Dieta",
    "Suplementação",
    "Movimentação",
  ];

  const historicoFiltrado = historicoOrdenado.filter((item) => {
    const matchTipo = filtroHistorico === "Todos" || item.tipo === filtroHistorico;
    const alvo = `${item.tipo || ""} ${item.observacao || ""} ${item.recomendacoes || ""}`.toLowerCase();
    const matchBusca = !buscaHistorico || alvo.includes(buscaHistorico.toLowerCase());
    return matchTipo && matchBusca;
  });

  const getTipoStyle = (tipo) => {
    switch (tipo) {
      case "Tratamento":
        return { bg: "#e3f2fd", color: "#0d47a1", border: "#90caf9" };
      case "Restrições":
        return { bg: "#fff8e1", color: "#795548", border: "#ffe082" };
      case "Dieta":
        return { bg: "#e8f5e9", color: "#1b5e20", border: "#a5d6a7" };
      case "Suplementação":
        return { bg: "#ede7f6", color: "#4527a0", border: "#b39ddb" };
      case "Movimentação":
        return { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" };
      default:
        return { bg: "#eceff1", color: "#37474f", border: "#cfd8dc" };
    }
  };

  return (
    <div className={`container-fluid px-4 py-4 mb-5 ${readonlyMode ? "readonly-mode" : ""}`}
      style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}
    >
      {/* Banner readonly */}
      {readonlyMode && (
        <Alert
          variant="warning"
          className="d-flex align-items-center rounded-3 shadow-sm mb-4 border-0"
          style={{ backgroundColor: "#fff8e1", borderLeft: "4px solid #f9a825" }}
        >
          <BsArchive className="me-3 flex-shrink-0" size={22} style={{ color: "#f9a825" }} />
          <div>
            <strong className="d-block" style={{ color: "#5d4037" }}>
              Prontuário Arquivado — Modo Somente Leitura
            </strong>
            <small className="text-muted">
              Este solípede foi excluído do sistema. Visualização histórica habilitada, edições bloqueadas.
            </small>
          </div>
        </Alert>
      )}

      {/* Cabeçalho da página */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #1565c0, #42a5f5)",
              fontSize: "22px",
            }}
          >
            📘
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: "#1a2b4a" }}>
              Prontuário Veterinário{readonlyMode && (
                <Badge bg="secondary" className="ms-2" style={{ fontSize: "11px" }}>Arquivado</Badge>
              )}
            </h4>
            <small className="text-muted">Histórico clínico e evolução · {solipede.nome} · Nº {solipede.numero}</small>
          </div>
        </div>

        {/* Alertas de cabeçalho */}
        <div className="d-flex gap-2 flex-wrap justify-content-end">
          {tratamentosEmAndamento > 0 && (
            <Badge
              bg="danger"
              className="px-3 py-2 rounded-pill"
              style={{ fontSize: "12px" }}
            >
              <BsClipboard2PulseFill className="me-1" />
              {tratamentosEmAndamento} tratamento{tratamentosEmAndamento > 1 ? "s" : ""} em andamento
            </Badge>
          )}
          {baixasPendentes > 0 && (
            <Badge
              bg="warning"
              text="dark"
              className="px-3 py-2 rounded-pill"
              style={{ fontSize: "12px" }}
            >
              <BsExclamationTriangle className="me-1" />
              {baixasPendentes} baixa{baixasPendentes > 1 ? "s" : ""} pendente{baixasPendentes > 1 ? "s" : ""}
            </Badge>
          )}
          {restricoesAtivas.length > 0 && (
            <Badge
              bg="warning"
              text="dark"
              className="px-3 py-2 rounded-pill"
              style={{ fontSize: "12px" }}
            >
              <LuShieldAlert className="me-1" size={14} />
              {restricoesAtivas.length} restrição{restricoesAtivas.length > 1 ? "ões" : ""} ativa{restricoesAtivas.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      <Row className="g-4 align-items-start">

        {/* ── PRIMEIRA COLUNA — Perfil ── */}
        <Col lg={4}>

          {/* Avatar + status */}
          <Card
            className="border-0 shadow-sm mb-3 overflow-hidden"
            style={{ borderRadius: "16px" }}
          >
            {/* Faixa decorativa superior */}
            <div style={{ height: "6px", background: "linear-gradient(90deg, #1565c0, #42a5f5, #1565c0)" }} />

            <Card.Body className="text-center pt-4 pb-4">
              {/* Avatar */}
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                  fontSize: "46px",
                  boxShadow: "0 4px 12px rgba(21,101,192,0.15)",
                  border: "3px solid #fff",
                }}
              >
                🐴
              </div>

              <h5 className="fw-bold mb-0" style={{ color: "#1a2b4a", fontSize: "18px" }}>
                {solipede.nome || "N/A"}
              </h5>
              <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                Nº {solipede.numero}
              </p>

              {/* Badge de status */}
              <Badge
                bg={statusBg(solipede.status)}
                className="px-3 py-2 rounded-pill"
                style={{ fontSize: "12px", letterSpacing: "0.3px" }}
              >
                <BsCheckCircle className="me-1" size={12} />
                {solipede.status || "N/A"}
              </Badge>
            </Card.Body>
          </Card>

          {/* Restrições ativas */}
          {restricoesAtivas.length > 0 && (
            <Card
              className="border-0 shadow-sm mb-3 overflow-hidden"
              style={{ borderRadius: "16px" }}
            >
              <Card.Header
                className="border-0 d-flex align-items-center gap-2 fw-semibold"
                style={{
                  background: "linear-gradient(135deg, #fff3cd, #ffe082)",
                  color: "#5d4037",
                  padding: "12px 16px",
                }}
              >
                <LuTriangleAlert size={16} />
                <span>Restrições Ativas</span>
                <Badge bg="warning" text="dark" className="ms-auto" style={{ fontSize: "11px" }}>
                  {restricoesAtivas.length}
                </Badge>
              </Card.Header>
              <ListGroup variant="flush">
                {restricoesAtivas.map((reg, index) => (
                  <ListGroup.Item
                    key={index}
                    className="py-3 px-3"
                    style={{ borderLeft: "3px solid #fbc02d" }}
                  >
                    <small className="text-muted d-block mb-1" style={{ fontSize: "11px" }}>
                      {reg.descricao || "Restrição registrada"}
                    </small>
                    <span className="fw-semibold" style={{ fontSize: "13px", color: "#4e342e" }}>
                      {reg.observacao || "Ativa"}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}

          {/* Informações Pessoais */}
          <Card
            className="border-0 shadow-sm mb-3 overflow-hidden"
            style={{ borderRadius: "16px" }}
          >
            <Card.Header
              className="border-0 d-flex align-items-center gap-2 fw-semibold"
              style={{
                background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                color: "#1a2b4a",
                padding: "12px 16px",
              }}
            >
              <BsPersonFill size={15} style={{ color: "#1565c0" }} />
              <span>Informações Pessoais</span>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { label: "Sexo", value: solipede.sexo },
                {
                  label: "Nascimento",
                  value: solipede.DataNascimento
                    ? new Date(solipede.DataNascimento).toLocaleDateString("pt-BR")
                    : null,
                  icon: <BsCalendar3 size={11} className="me-1 text-muted" />,
                },
                { label: "Idade", value: `${calcularIdade(solipede.DataNascimento)} anos` },
                { label: "Pelagem", value: solipede.pelagem },
              ].map(({ label, value, icon }, i) => (
                <ListGroup.Item
                  key={i}
                  className="px-3 py-2 d-flex justify-content-between align-items-center"
                  style={{ fontSize: "13px" }}
                >
                  <span className="text-muted">{label}</span>
                  <strong style={{ color: "#1a2b4a" }}>
                    {icon}{value || "N/A"}
                  </strong>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* Alocação */}
          <Card
            className="border-0 shadow-sm mb-3 overflow-hidden"
            style={{ borderRadius: "16px" }}
          >
            <Card.Header
              className="border-0 d-flex align-items-center gap-2 fw-semibold"
              style={{
                background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                color: "#1a2b4a",
                padding: "12px 16px",
              }}
            >
              <BsGeoAltFill size={15} style={{ color: "#1565c0" }} />
              <span>Alocação</span>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { label: "Unidade", value: solipede.alocacao },
                { label: "Esquadrão", value: solipede.esquadrao },
                { label: "Origem", value: solipede.origem },
              ].map(({ label, value }, i) => (
                <ListGroup.Item
                  key={i}
                  className="px-3 py-2 d-flex justify-content-between align-items-center"
                  style={{ fontSize: "13px" }}
                >
                  <span className="text-muted">{label}</span>
                  <strong style={{ color: "#1a2b4a" }}>{value || "N/A"}</strong>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

        </Col>

        {/* ── SEGUNDA COLUNA — Conteúdo expandido ── */}
        <Col lg={8}>
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: "14px" }}>
                <Card.Body className="py-3">
                  <small className="text-muted d-block">Registros Totais</small>
                  <h4 className="fw-bold mb-0" style={{ color: "#1a2b4a" }}>{historico.length}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: "14px" }}>
                <Card.Body className="py-3">
                  <small className="text-muted d-block">Últimos 30 dias</small>
                  <h4 className="fw-bold mb-0" style={{ color: "#1a2b4a" }}>
                    {
                      historico.filter((reg) => {
                        const data = new Date(reg.data_criacao || 0).getTime();
                        const limite = Date.now() - (30 * 24 * 60 * 60 * 1000);
                        return data >= limite;
                      }).length
                    }
                  </h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm" style={{ borderRadius: "14px" }}>
                <Card.Body className="py-3">
                  <small className="text-muted d-block">Tipos Ativos</small>
                  <h4 className="fw-bold mb-0" style={{ color: "#1a2b4a" }}>
                    {new Set(historico.map((h) => h.tipo).filter(Boolean)).size}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ height: "4px", background: "linear-gradient(90deg, #1565c0, #42a5f5)" }} />

            <TabContainer defaultActiveKey="historico">
              <Card.Header className="bg-white border-0 pb-0">
                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "#1a2b4a" }}>
                      Painel Clínico
                    </h6>
                    <small className="text-muted">Acompanhe histórico e registre novos lançamentos</small>
                  </div>

                  <Nav variant="pills" className="gap-2">
                    <Nav.Item>
                      <Nav.Link
                        eventKey="historico"
                        className="px-3 py-2"
                        style={{ borderRadius: "10px", fontSize: "13px" }}
                      >
                        <BsClockHistory className="me-1" /> Histórico
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        eventKey="lancamentos"
                        className="px-3 py-2"
                        style={{ borderRadius: "10px", fontSize: "13px" }}
                      >
                        <BsPlusCircle className="me-1" /> Novo Lançamento
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
              </Card.Header>

              <Card.Body className="p-3 p-md-4">
                <Tab.Content>
                  <Tab.Pane eventKey="historico">
                    {/* Filtro */}
                    <Row className="g-2 mb-3">
                      <Col md={4}>
                        <Form.Label className="mb-1 text-muted" style={{ fontSize: "12px" }}>
                          <BsFilterCircle className="me-1" /> Tipo
                        </Form.Label>
                        <Form.Select
                          value={filtroHistorico}
                          onChange={(e) => setFiltroHistorico(e.target.value)}
                          style={{ borderRadius: "10px", fontSize: "13px" }}
                        >
                          {tiposDisponiveis.map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={8}>
                        <Form.Label className="mb-1 text-muted" style={{ fontSize: "12px" }}>
                          Buscar observação
                        </Form.Label>
                        <Form.Control
                          value={buscaHistorico}
                          onChange={(e) => setBuscaHistorico(e.target.value)}
                          placeholder="Digite termos para filtrar o histórico..."
                          style={{ borderRadius: "10px", fontSize: "13px" }}
                        />
                      </Col>
                    </Row>

                    <div style={{ maxHeight: "620px", overflowY: "auto", paddingRight: "4px" }}>
                      {historicoFiltrado.length === 0 ? (
                        <Card className="border-0" style={{ backgroundColor: "#f8f9fb", borderRadius: "12px" }}>
                          <Card.Body className="text-center py-5 text-muted">
                            <BsShieldFill size={32} style={{ opacity: 0.2 }} />
                            <p className="mb-0 mt-2">Nenhum registro encontrado com os filtros atuais.</p>
                          </Card.Body>
                        </Card>
                      ) : (
                        historicoFiltrado.map((reg, index) => {
                          const tipoStyle = getTipoStyle(reg.tipo);
                          const dataHora = reg.data_criacao
                            ? new Date(reg.data_criacao).toLocaleString("pt-BR")
                            : "Data não informada";

                          return (
                            <Card
                              key={reg.id || `${reg.tipo || "tipo"}-${reg.data_criacao || index}`}
                              className="border-0 mb-2"
                              style={{
                                borderRadius: "12px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                                borderLeft: `4px solid ${tipoStyle.border}`,
                              }}
                            >
                              <HistoricoProntuarioTratamento />
                              <HistoricoProntuarioRestricoes />
                              <HistoricoProntuarioDieta />
                              <HistoricoProntuarioSuplementacao />
                              <HistoricoProntuarioMovimentacao />
                              
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="lancamentos">
                    <Card className="border-0 mb-3" style={{ backgroundColor: "#f8fbff", borderRadius: "12px" }}>
                      <Card.Body className="py-3">
                        <Form.Label className="fw-semibold mb-1" style={{ color: "#1a2b4a" }}>
                          Tipo de Lançamento
                        </Form.Label>
                        <small className="d-block text-muted mb-2">
                          Selecione o tipo e preencha os dados no formulário abaixo.
                        </small>
                        <Form.Select
                          value={tipoObservacao}
                          onChange={(e) => setTipoObservacao(e.target.value)}
                          style={{ borderRadius: "10px", fontSize: "13px" }}
                        >
                          <option>Tratamento</option>
                          <option>Restrições</option>
                          <option>Dieta</option>
                          <option>Suplementação</option>
                          <option>Movimentação</option>
                        </Form.Select>
                      </Card.Body>
                    </Card>

                    <div
                      className="p-3 p-md-4"
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                        boxShadow: "inset 0 0 0 1px rgba(66,165,245,0.05)",
                      }}
                    >
                      {tipoObservacao === "Tratamento" && <ProntuarioTratamento />}
                      {tipoObservacao === "Restrições" && <ProntuarioRestricao />}
                      {tipoObservacao === "Dieta" && <ProntuarioDieta />}
                      {tipoObservacao === "Suplementação" && <ProntuarioSuplementacao />}
                      {tipoObservacao === "Movimentação" && <ProntuarioMovimentacao />}
                    </div>
                  </Tab.Pane>

                </Tab.Content>
              </Card.Body>
            </TabContainer>
          </Card>
        </Col>

      </Row>
    </div>
  );
}
