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
} from "react-bootstrap";
import {
  BsPlusCircle,
  BsClockHistory,
  BsCheckCircle,
  BsExclamationTriangle,
  BsFilePdf,
  BsFileWord,
} from "react-icons/bs";
import { useParams } from "react-router-dom";
import { api } from "../../../services/api";
import html2pdf from 'html2pdf.js';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';

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
  const [visaoGeralTexto, setVisaoGeralTexto] = useState(""); // Novo estado para Visão Geral

  const [loadingHistorico, setLoadingHistorico] = useState(true);

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
    if (!historico || historico.length === 0) return '';

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
            return `
              <div style="margin-bottom: 25px; page-break-inside: avoid;">
                <p style="margin: 0 0 8px 0;">
                  <strong>${index + 1}. ${registro.tipo.toUpperCase()}</strong>
                </p>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">
                  <em>Data: ${dataBR} às ${horaBR}</em>
                  ${registro.usuario_nome ? ` | Responsável: ${registro.usuario_nome} (${registro.usuario_perfil})` : ''}
                </p>
                <p style="text-align: justify; line-height: 1.6; margin: 10px 0;">
                  ${registro.observacao}
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
        const response = await api.listarProntuario(solipede.numero);
        setHistorico(response);
      } catch (error) {
        console.error("Erro ao carregar prontuário", error);
      } finally {
        setLoadingHistorico(false);
      }
    }

    if (solipede?.numero) {
      carregarProntuario();
    }
  }, [solipede]);

  // Atualizar visão geral quando histórico mudar
  useEffect(() => {
    if (historico && historico.length > 0 && solipede) {
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

  const handleAdicionarObservacao = async () => {
    if (!observacao.trim()) {
      setMensagem({
        tipo: "warning",
        texto: "Adicione uma observação antes de salvar!",
      });
      return;
    }

    setSalvando(true);
    try {
      console.log("📤 Enviando prontuário para servidor...");
      const response = await api.salvarProntuario({
        numero_solipede: numero,
        tipo: tipoObservacao,
        observacao,
        recomendacoes: recomendacoes || null,
      });

      console.log("📥 Resposta do servidor:", response);

      if (response.success || response.id) {
        console.log("✅ Prontuário salvo com sucesso! Recarregando histórico...");
        // Recarregar o histórico para pegar os dados do usuário
        const historicoAtualizado = await api.listarProntuario(numero);
        console.log("📖 Histórico atualizado:", historicoAtualizado);
        setHistorico(historicoAtualizado);
        
        setObservacao("");
        setRecomendacoes("");
        setMensagem({
          tipo: "success",
          texto: "✅ Observação salva com sucesso!",
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
                  fontSize: "50px",
                }}
              >
                🐴
              </div>
              <h5 className="fw-bold mb-1">{solipede.nome || "N/A"}</h5>
              <p className="text-muted mb-3">Nº {solipede.numero}</p>
              <Badge
                bg={statusBg(solipede.status)}
                className="mb-3"
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
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
                          <option>Observação Geral</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Observação</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          placeholder="Descreva detalhadamente a observação clínica..."
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

                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          onClick={handleAdicionarObservacao}
                          disabled={!observacao.trim() || salvando}
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
                              <p
                                className="mb-1"
                                style={{ fontSize: "12px", color: "#999" }}
                              >
                                <BsClockHistory className="me-1" />
                                <strong>{dataBR}</strong> às {horaBR}
                              </p>
                            </Col>
                            <Col md={6} className="text-end">
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
                              </div>
                            </Col>
                          </Row>
                          <div className="bg-light p-2 rounded mb-2">
                            <p
                              className="mb-0"
                              style={{ fontSize: "14px", lineHeight: "1.6" }}
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
                        </Card.Body>
                      </Card>
                    );
                  })
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </div>
  );
}
