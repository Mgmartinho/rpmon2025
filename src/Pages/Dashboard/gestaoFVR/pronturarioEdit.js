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

  // Estados para conclusão de tratamento
  const [showModalConclusao, setShowModalConclusao] = useState(false);
  const [prontuarioIdConcluir, setProntuarioIdConcluir] = useState(null);
  const [emailConclusao, setEmailConclusao] = useState("");
  const [senhaConclusao, setSenhaConclusao] = useState("");
  const [concluindo, setConcluindo] = useState(false);
  const [erroConclusao, setErroConclusao] = useState("");


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

        // Carregar contador de baixas pendentes
        const baixas = await api.contarBaixasPendentes(solipede.numero);
        setBaixasPendentes(baixas.total || 0);
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
        tipo_baixa: tipoObservacao === "Baixa" && tipoBaixa ? tipoBaixa : null,
        data_lancamento: tipoObservacao === "Baixa" && dataLancamento ? dataLancamento : null,
        data_validade: tipoObservacao === "Baixa" && dataValidade ? dataValidade : null,
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

        setObservacao("");
        setRecomendacoes("");
        setDataLancamento("");
        setDataValidade("");
        setTipoBaixa("");
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
      email: emailConclusao
    });

    try {
      const response = await api.concluirTratamento(
        prontuarioIdConcluir,
        emailConclusao,
        senhaConclusao
      );

      console.log("📦 Resposta da API:", response);

      if (response.success) {
        // Recarregar histórico
        const historicoAtualizado = await api.listarProntuario(numero);
        setHistorico(historicoAtualizado);

        setMensagem({
          tipo: "success",
          texto: `✅ Tratamento concluído por ${response.usuario_conclusao.nome}`,
        });

        setTimeout(() => setMensagem(""), 5000);
        handleFecharModalConclusao();
      } else {
        const erroMsg = response.error || "❌ Erro ao concluir tratamento";
        console.error("❌ Erro na resposta:", erroMsg);
        setErroConclusao(erroMsg);
      }
    } catch (error) {
      console.error("❌ Erro ao concluir tratamento:", error);
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
                          <option>Restrições</option>
                        </Form.Select>
                      </Form.Group>

                      {/* Mensagem informativa para Tratamento */}
                      {tipoObservacao === "Tratamento" && (
                        <Alert variant="info" className="mb-3">
                          <strong>ℹ️ Importante:</strong> Ao iniciar um tratamento, o cavalo será automaticamente marcado com status de <strong>baixado</strong>.
                        </Alert>
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
                            setDataAplicacao("");
                            setPartidaLote("");
                            setValidadeProduto("");
                            setNomeProduto("");
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
                              style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-line" }}
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

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-primary">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="primary" className="mb-2">🩺 Consulta Clínica</Badge>
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
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
                                          <p className="text-success mb-0" style={{ fontSize: "12px" }}>
                                            ✅ Concluído por: <strong>{registro.usuario_conclusao_nome}</strong> ({registro.usuario_conclusao_registro})
                                            <br />
                                            📅 {new Date(registro.data_conclusao).toLocaleDateString('pt-BR')} às {new Date(registro.data_conclusao).toLocaleTimeString('pt-BR')}
                                          </p>
                                        )}
                                      </Col>
                                      <Col xs="auto">
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

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-secondary">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="secondary" className="mb-2">🔬 Exame</Badge>
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
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

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-success">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="success" className="mb-2">💉 Vacinação</Badge>
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
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

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-info">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="info" className="mb-2">💊 Vermifugação</Badge>
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
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

                              return (
                                <Card key={registro.id} className="mb-3 border-start border-4 border-warning">
                                  <Card.Body>
                                    <Row className="align-items-start mb-2">
                                      <Col>
                                        <Badge bg="warning" className="mb-2">🧪 Exames AIE / Mormo</Badge>
                                        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                          📅 {dataBR} às {horaBR}
                                        </p>
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
  
                                return (
                                  <Card key={registro.id} className="mb-3 border-start border-4 border-warning">
                                    <Card.Body>
                                      <Row className="align-items-start mb-2">
                                        <Col>
                                          <Badge bg="warning" className="mb-2">⚠️ Restrições</Badge>
                                          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                            📅 {dataBR} às {horaBR}
                                          </p>
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
          <Modal.Title>🔒 Autenticação Necessária</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleConcluirTratamento}>
          <Modal.Body>
            <p className="text-muted mb-3">
              Para concluir este tratamento, confirme sua identidade:
            </p>

            {erroConclusao && (
              <Alert variant="danger" className="py-2">
                {erroConclusao}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>📧 Email:</Form.Label>
              <Form.Control
                type="email"
                value={emailConclusao}
                onChange={(e) => setEmailConclusao(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>🔑 Senha:</Form.Label>
              <Form.Control
                type="password"
                value={senhaConclusao}
                onChange={(e) => setSenhaConclusao(e.target.value)}
                placeholder="Digite sua senha"
                required
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
    </div>
  );
}
