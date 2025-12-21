import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Nav,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  BsPlusCircle,
  BsClockHistory,
  BsFilePdf,
} from "react-icons/bs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { api } from "../../../services/api";

export default function ProntuarioSolipede() {
  const { numero } = useParams();
  const [abaAtiva, setAbaAtiva] = useState("novo");

  const [solipede, setSolipede] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [novoRegistro, setNovoRegistro] = useState({
    tipo: "Consulta",
    observacao: "",
    recomendacoes: "",
  });

  // Buscar dados do solípede
  useEffect(() => {
    const carregarSolipede = async () => {
      if (!numero) {
        console.log("Número não fornecido");
        return;
      }

      try {
        console.log("Carregando dados do solípede:", numero);
        const dadosSolipede = await api.obterSolipede(numero);
        console.log("Dados do solípede carregados:", dadosSolipede);
        setSolipede(dadosSolipede);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar solípede:", err);
        setError("Erro ao carregar dados do solípede");
        setLoading(false);
      }
    };

    carregarSolipede();
  }, [numero]);

  // Buscar histórico de prontuário
  useEffect(() => {
    const carregarHistorico = async () => {
      if (!numero) return;

      try {
        console.log("Carregando histórico para solípede:", numero);
        const dadosHistorico = await api.listarProntuario(numero);
        console.log("Histórico carregado:", dadosHistorico);
        setHistorico(Array.isArray(dadosHistorico) ? dadosHistorico : []);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        setHistorico([]);
        setLoading(false);
      }
    };

    carregarHistorico();
  }, [numero]);

  const salvarRegistro = async () => {
    if (!novoRegistro.observacao.trim()) return;

    try {
      console.log("Salvando registro:", novoRegistro);
      const registro = {
        numero_solipede: numero,
        tipo: novoRegistro.tipo,
        observacao: novoRegistro.observacao,
        recomendacoes: novoRegistro.recomendacoes || null,
      };

      await api.salvarProntuario(registro);
      console.log("Registro salvo com sucesso");

      // Recarregar histórico
      console.log("Recarregando histórico...");
      const dadosHistorico = await api.listarProntuario(numero);
      console.log("Novo histórico:", dadosHistorico);
      setHistorico(dadosHistorico);

      // Limpar formulário
      setNovoRegistro({
        tipo: "Consulta",
        observacao: "",
        recomendacoes: "",
      });

      setAbaAtiva("historico");
    } catch (err) {
      console.error("Erro ao salvar registro:", err);
      setError("Erro ao salvar registro clínico");
    }
  };

  const exportarPDF = async () => {
    const elemento = document.getElementById("documento-prontuario");
    if (!elemento) return;

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const largura = 210;
    const altura = (canvas.height * largura) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, largura, altura);
    pdf.save("prontuario-solipede.pdf");
  };

  return (
    <div className="container-fluid mt-4">
      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
          <p>Carregando prontuário...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* ===== CABEÇALHO ===== */}
          <Row className="mb-4 align-items-center">
            <Col>
              <h4 className="mb-0 fw-semibold">Prontuário do Solípede</h4>
              <small className="text-muted">
                Histórico clínico, informações gerais e evolução veterinária
              </small>
            </Col>

            <Col className="text-end">
              {abaAtiva === "geral" && (
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={exportarPDF}
                >
                  <BsFilePdf className="me-1" />
                  Exportar Prontuário
                </Button>
              )}
            </Col>
          </Row>

          <Row>
            {/* =========================
                COLUNA ESQUERDA – INFO
            ========================= */}
            <Col md={4}>
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <h6 className="mb-3 fw-semibold">Dados do Solípede</h6>

                  <p className="mb-1"><strong>Nº:</strong> {solipede?.numero || "N/A"}</p>
                  <p className="mb-1"><strong>Nome:</strong> {solipede?.nome || "N/A"}</p>
                  <p className="mb-1"><strong>Raça:</strong> {solipede?.pelagem || "N/A"}</p>
                  <p className="mb-1"><strong>Sexo:</strong> {solipede?.sexo || "N/A"}</p>
                  <p className="mb-1"><strong>Idade:</strong> {solipede?.DataNascimento ? new Date().getFullYear() - new Date(solipede.DataNascimento).getFullYear() + " anos" : "N/A"}</p>
                  <p className="mb-1"><strong>Unidade:</strong> {solipede?.alocacao || "N/A"}</p>

                  <Badge pill bg={solipede?.status === "Ativo" ? "success" : "secondary"} className="mt-2">
                    {solipede?.status || "N/A"}
                  </Badge>
                </Card.Body>
              </Card>

              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <h6 className="fw-semibold">Evolução Clínica Geral</h6>
                  <Form.Control as="textarea" rows={4} value={solipede?.restricoes || ""} readOnly />
                </Card.Body>
              </Card>

              <Card className="shadow-sm">
                <Card.Body>
                  <h6 className="fw-semibold">Restrições / Recomendações</h6>
                  <Form.Control as="textarea" rows={3} value={solipede?.movimentacao || ""} readOnly />
                </Card.Body>
              </Card>
            </Col>

        {/* =========================
            COLUNA DIREITA – PRONTUÁRIO
        ========================= */}
        <Col md={8}>
          {/* ===== MENU ===== */}
          <Nav variant="tabs" activeKey={abaAtiva} className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="novo" onClick={() => setAbaAtiva("novo")}>
                Novo Registro
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                eventKey="historico"
                onClick={() => setAbaAtiva("historico")}
              >
                Histórico ({historico.length})
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                eventKey="geral"
                onClick={() => setAbaAtiva("geral")}
              >
                Visão Geral
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* ===== ABA: NOVO REGISTRO ===== */}
          {abaAtiva === "novo" && (
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h6 className="fw-semibold mb-3">Novo Registro Clínico</h6>

                <Form.Group className="mb-2">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    value={novoRegistro.tipo}
                    onChange={(e) =>
                      setNovoRegistro({
                        ...novoRegistro,
                        tipo: e.target.value,
                      })
                    }
                  >
                    <option value="Consulta">Consulta</option>
                    <option value="Exame">Exame</option>
                    <option value="Tratamento">Tratamento</option>
                    <option value="Observação Geral">Observação Geral</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Observação</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={novoRegistro.observacao}
                    onChange={(e) =>
                      setNovoRegistro({
                        ...novoRegistro,
                        observacao: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Recomendações</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={novoRegistro.recomendacoes}
                    onChange={(e) =>
                      setNovoRegistro({
                        ...novoRegistro,
                        recomendacoes: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <div className="text-end mt-3">
                  <Button size="sm" onClick={salvarRegistro} disabled={!novoRegistro.observacao.trim()}>
                    <BsPlusCircle className="me-1" />
                    Salvar Registro
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* ===== ABA: HISTÓRICO ===== */}
          {abaAtiva === "historico" && (
            <Card className="shadow-sm">
              <Card.Body>
                <h6 className="fw-semibold mb-3">
                  <BsClockHistory className="me-1" />
                  Histórico de Atendimentos
                </h6>

                {historico.length === 0 && (
                  <p className="text-muted text-center">
                    Nenhum registro clínico no momento
                  </p>
                )}

                {historico.map((item, index) => (
                  <Card
                    key={item.id || index}
                    className="mb-3 border-start border-4 border-secondary"
                  >
                    <Card.Body>
                      <Row>
                        <Col md={8}>
                          <Badge bg="secondary" className="mb-2">
                            {item.tipo}
                          </Badge>

                          <p className="mb-1">
                            <strong>Observação:</strong> {item.observacao}
                          </p>

                          {item.recomendacoes && (
                            <p className="mb-0">
                              <strong>Recomendações:</strong> {item.recomendacoes}
                            </p>
                          )}
                        </Col>

                        <Col md={4} className="text-end">
                          <small className="text-muted">
                            {new Date(item.data_criacao).toLocaleDateString("pt-BR")}
                          </small>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* ===== ABA: VISÃO GERAL (DOCUMENTO) ===== */}
          {abaAtiva === "geral" && (
            <Card className="shadow-sm">
              <Card.Body id="documento-prontuario">
                <h5 className="fw-semibold text-center mb-4">
                  Prontuário Clínico – Solípede Nº {solipede?.numero || "N/A"}
                </h5>

                {/* Dados do Solípede */}
                <div className="mb-4">
                  <h6 className="fw-semibold">Dados do Solípede</h6>
                  <p className="mb-1"><strong>Nome:</strong> {solipede?.nome || "N/A"}</p>
                  <p className="mb-1"><strong>Raça:</strong> {solipede?.pelagem || "N/A"}</p>
                  <p className="mb-1"><strong>Sexo:</strong> {solipede?.sexo || "N/A"}</p>
                  <p className="mb-1"><strong>Idade:</strong> {solipede?.DataNascimento ? new Date().getFullYear() - new Date(solipede.DataNascimento).getFullYear() + " anos" : "N/A"}</p>
                  <p className="mb-1"><strong>Unidade:</strong> {solipede?.alocacao || "N/A"}</p>
                  <p className="mb-1"><strong>Status:</strong> {solipede?.status || "N/A"}</p>
                  <p className="mb-1"><strong>Restrições:</strong> {solipede?.restricoes || "N/A"}</p>
                  <p className="mb-0"><strong>Movimentação:</strong> {solipede?.movimentacao || "N/A"}</p>
                </div>

                <hr />

                {/* Histórico Encadeado */}
                <h6 className="fw-semibold mb-3">Histórico de Atendimentos</h6>
                {historico.map((item, index) => (
                  <div key={item.id || index} className="mb-4 border-start border-4 border-secondary ps-3">
                    <p className="mb-1">
                      <strong>Data:</strong> {new Date(item.data_criacao).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="mb-1">
                      <strong>Tipo:</strong> {item.tipo}
                    </p>
                    <p className="mb-1">
                      <strong>Observação:</strong> {item.observacao}
                    </p>
                    <p className="mb-0">
                      <strong>Recomendações:</strong> {item.recomendacoes || "-"}
                    </p>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      </>
      )}
    </div>
  );
}
