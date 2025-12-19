import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Badge, Form, Spinner, Container, Nav, Tab, ListGroup, Alert } from "react-bootstrap";
import { BsPlusCircle, BsClockHistory, BsCheckCircle, BsExclamationTriangle } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { api } from "../../../services/api";

export default function ProntuarioSolipedeEdit() {
  const { numero } = useParams();
  const [solipede, setSolipede] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [recomendacoes, setRecomendacoes] = useState("");
  const [tipoObservacao, setTipoObservacao] = useState("Consulta Clínica");
  const [historico, setHistorico] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

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

  const handleAdicionarObservacao = async () => {
    if (!observacao.trim()) {
      setMensagem({ tipo: "warning", texto: "Adicione uma observação antes de salvar!" });
      return;
    }

    setSalvando(true);
    try {
      // Salvar no banco de dados usando a API
      const response = await api.salvarProntuario({
        numero_solipede: numero,
        tipo: tipoObservacao,
        observacao: observacao,
        recomendacoes: recomendacoes || null
      });

      if (response.success || response.id) {
        // Adicionar ao histórico local com ID do servidor
        const novoItem = {
          id: response.id || Date.now(),
          data: new Date().toLocaleDateString("pt-BR"),
          hora: new Date().toLocaleTimeString("pt-BR"),
          tipo: tipoObservacao,
          observacao: observacao,
          recomendacoes: recomendacoes,
          veterinario: "Você"
        };

        setHistorico([novoItem, ...historico]);
        setObservacao("");
        setRecomendacoes("");
        setMensagem({ tipo: "success", texto: "✅ Observação salva com sucesso!" });
        
        setTimeout(() => setMensagem(""), 3000);
      } else {
        setMensagem({ tipo: "danger", texto: "❌ Erro ao salvar observação" });
      }
    } catch (err) {
      console.error("Erro ao salvar observação:", err);
      setMensagem({ tipo: "danger", texto: "❌ Erro ao conectar com o servidor" });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
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
            <p className="text-danger mb-0">❌ {error || "Solípede não encontrado"}</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "N/A";
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesNasc = nascimento.getMonth();
    const mesHoje = hoje.getMonth();
    
    if (mesHoje < mesNasc || (mesHoje === mesNasc && hoje.getDate() < nascimento.getDate())) {
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

  return (
    <div className="container-fluid mt-4 mb-5">
      {/* Cabeçalho */}
      <Row className="mb-4">
        <Col>
          <h3 className="fw-bold mb-1">📘 Prontuário Veterinário</h3>
          <small className="text-muted">Histórico clínico e evolução do solípede</small>
        </Col>
      </Row>

      {/* Layout em duas colunas */}
      <Row className="g-4">
        {/* COLUNA ESQUERDA - INFORMAÇÕES PESSOAIS */}
        <Col lg={4}>
          {/* Card Principal com Foto/Avatar */}
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body className="text-center pt-4">
              {/* Avatar/Foto */}
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

              {/* Nome e Número */}
              <h5 className="fw-bold mb-1">{solipede.nome || "N/A"}</h5>
              <p className="text-muted mb-3">Nº {solipede.numero}</p>

              {/* Status Badge */}
              <Badge bg={statusBg(solipede.status)} className="mb-3" style={{ fontSize: "12px", padding: "6px 12px" }}>
                <BsCheckCircle className="me-1" />
                {solipede.status || "N/A"}
              </Badge>
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
                    ? new Date(solipede.DataNascimento).toLocaleDateString("pt-BR")
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
                <strong>{solipede.cargaHoraria ? `${solipede.cargaHoraria}h` : "N/A"}</strong>
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
              <p className="mb-0" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                {solipede.restricoes || "Nenhuma restrição registrada"}
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUNA DIREITA - FORMULÁRIO E HISTÓRICO */}
        <Col lg={8}>
          <Tab.Container defaultEventKey="novo">
            <Nav variant="pills" className="mb-3 border-bottom">
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
            </Nav>

            <Tab.Content>
              {/* MENSAGEM DE FEEDBACK */}
              {mensagem && (
                <Alert variant={mensagem.tipo} dismissible onClose={() => setMensagem("")} className="mb-3">
                  {mensagem.texto}
                </Alert>
              )}

              {/* TAB: NOVO REGISTRO */}
              <Tab.Pane eventKey="novo">
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-light border-0 fw-bold">
                    Adicionar Observação Clínica
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Tipo de Observação</Form.Label>
                        <Form.Select 
                          size="sm"
                          value={tipoObservacao}
                          onChange={(e) => setTipoObservacao(e.target.value)}
                        >
                          <option>Consulta Clínica</option>
                          <option>Tratamento</option>
                          <option>Exame</option>
                          <option>Vacinação</option>
                          <option>Observação Geral</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Observação</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          placeholder="Descreva detalhadamente a observação clínica, diagnóstico, tratamento ou recomendações..."
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          style={{ resize: "none" }}
                          disabled={salvando}
                        />
                        <small className="text-muted d-block mt-1">
                          {observacao.length} caracteres
                        </small>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Recomendações</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Próximas ações, reavaliações agendadas, etc..."
                          value={recomendacoes}
                          onChange={(e) => setRecomendacoes(e.target.value)}
                          style={{ resize: "none" }}
                          disabled={salvando}
                        />
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          onClick={handleAdicionarObservacao}
                          disabled={!observacao.trim() || salvando}
                        >
                          {salvando ? (
                            <>
                              <Spinner size="sm" className="me-2" animation="border" />
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
                        <BsClockHistory style={{ fontSize: "30px", marginBottom: "10px" }} />
                        <br />
                        Nenhum registro clínico adicionado ainda
                      </p>
                    </Card.Body>
                  </Card>
                ) : (
                  <div>
                    {historico.map((registro) => (
                      <Card key={registro.id} className="shadow-sm border-0 mb-3 border-start border-4 border-primary">
                        <Card.Body>
                          <Row className="align-items-start mb-2">
                            <Col md={6}>
                              <Badge bg="info" className="mb-2">
                                {registro.tipo}
                              </Badge>
                              <p className="mb-1" style={{ fontSize: "12px", color: "#999" }}>
                                <BsClockHistory className="me-1" />
                                <strong>{registro.data}</strong> às {registro.hora}
                              </p>
                            </Col>
                            <Col md={6} className="text-end">
                              <Badge bg="secondary" style={{ fontSize: "11px" }}>
                                {registro.veterinario}
                              </Badge>
                            </Col>
                          </Row>
                          <div className="bg-light p-2 rounded mb-2">
                            <p className="mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                              {registro.observacao}
                            </p>
                          </div>
                          {registro.recomendacoes && (
                            <div className="bg-warning bg-opacity-10 p-2 rounded border-start border-warning">
                              <small className="text-muted">
                                <strong>📌 Recomendação:</strong> {registro.recomendacoes}
                              </small>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </div>
  );
}
