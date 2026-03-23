import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  BsCheckCircle,
  BsPencilSquare,
  BsClipboardCheck,
  BsTrash,
} from "react-icons/bs";
import { api } from "../../../../services/api";

const HistoricoProntuarioTratamento = ({ registros = [] }) => {
  const [dadosLocais, setDadosLocais] = useState([]);

  const [showModalConclusaoRegistro, setShowModalConclusaoRegistro] = useState(false);
  const [showModalEdicaoTratamento, setShowModalEdicaoTratamento] = useState(false);
  const [showModalExclusaoRegistro, setShowModalExclusaoRegistro] = useState(false);

  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  const [senhaConclusaoRegistro, setSenhaConclusaoRegistro] = useState("");
  const [senhaExclusaoRegistro, setSenhaExclusaoRegistro] = useState("");

  const [concluindoRegistro, setConcluindoRegistro] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindoRegistro, setExcluindoRegistro] = useState(false);

  const [erroConclusaoRegistro, setErroConclusaoRegistro] = useState("");
  const [erroEdicaoTratamento, setErroEdicaoTratamento] = useState("");
  const [erroExclusaoRegistro, setErroExclusaoRegistro] = useState("");

  const [edicaoTratamento, setEdicaoTratamento] = useState({
    diagnostico: "",
    observacao_clinica: "",
    prescricao: "",
  });

  useEffect(() => {
    setDadosLocais(Array.isArray(registros) ? registros : []);
  }, [registros]);

  const handleAbrirModalConclusaoRegistro = (item) => {
    setRegistroSelecionado(item);
    setSenhaConclusaoRegistro("");
    setErroConclusaoRegistro("");
    setShowModalConclusaoRegistro(true);
  };

  const handleFecharModalConclusaoRegistro = () => {
    setShowModalConclusaoRegistro(false);
    setRegistroSelecionado(null);
    setSenhaConclusaoRegistro("");
    setErroConclusaoRegistro("");
  };

  const handleAbrirEdicaoTratamento = (item) => {
    setRegistroSelecionado(item);
    setErroEdicaoTratamento("");
    setEdicaoTratamento({
      diagnostico: item.diagnostico || "",
      observacao_clinica: item.observacao_clinica || "",
      prescricao: item.prescricao || "",
    });
    setShowModalEdicaoTratamento(true);
  };

  const handleFecharEdicaoTratamento = () => {
    setShowModalEdicaoTratamento(false);
    setRegistroSelecionado(null);
    setErroEdicaoTratamento("");
  };

  const handleAbrirExclusaoRegistro = (item) => {
    setRegistroSelecionado(item);
    setSenhaExclusaoRegistro("");
    setErroExclusaoRegistro("");
    setShowModalExclusaoRegistro(true);
  };

  const handleFecharExclusaoRegistro = () => {
    setShowModalExclusaoRegistro(false);
    setRegistroSelecionado(null);
    setSenhaExclusaoRegistro("");
    setErroExclusaoRegistro("");
  };

  const handleConcluirRegistro = async (e) => {
    e.preventDefault();

    if (!registroSelecionado?.id) return;

    setConcluindoRegistro(true);
    setErroConclusaoRegistro("");

    try {
      const response = await api.concluirTratamento(registroSelecionado.id, senhaConclusaoRegistro);

      if (response?.error) {
        setErroConclusaoRegistro(response.error);
        return;
      }

      handleFecharModalConclusaoRegistro();
      window.location.reload();
    } catch (error) {
      setErroConclusaoRegistro("Erro ao concluir registro. Tente novamente.");
    } finally {
      setConcluindoRegistro(false);
    }
  };

  const handleSalvarEdicaoTratamento = async (e) => {
    e.preventDefault();

    if (!registroSelecionado?.id) return;

    setSalvandoEdicao(true);
    setErroEdicaoTratamento("");

    try {
      const payload = {
        diagnosticos: edicaoTratamento.diagnostico,
        observacao: edicaoTratamento.observacao_clinica,
        recomendacoes: edicaoTratamento.prescricao,
      };

      const response = await api.atualizarProntuario(registroSelecionado.id, payload);

      if (response?.error) {
        setErroEdicaoTratamento(response.error);
        return;
      }

      handleFecharEdicaoTratamento();
      window.location.reload();
    } catch (error) {
      setErroEdicaoTratamento("Erro ao salvar edicao. Tente novamente.");
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleExcluirRegistro = async (e) => {
    e.preventDefault();

    if (!registroSelecionado?.id) return;

    setExcluindoRegistro(true);
    setErroExclusaoRegistro("");

    try {
      const response = await api.excluirRegistroProntuario(registroSelecionado.id, senhaExclusaoRegistro);

      if (response?.error) {
        setErroExclusaoRegistro(response.error);
        return;
      }

      handleFecharExclusaoRegistro();
      window.location.reload();
    } catch (error) {
      setErroExclusaoRegistro("Erro ao excluir registro. Tente novamente.");
    } finally {
      setExcluindoRegistro(false);
    }
  };

  return (
    <div>
      {dadosLocais.map((item) => {
        const precisaBaixar = String(
          item.tratamento_precisa_baixar ?? item.precisa_baixar ?? ""
        )
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const statusConclusao = String(item.status_conclusao || "").toLowerCase();
        const isConcluido = statusConclusao === "concluido";
        const dataAtualizacao = item.tratamento_data_atualizacao || item.data_atualizacao;
        const usuarioAtualizacao = item.tratamento_usuario_atualizacao_nome;
        const usuarioAtualizacaoRe = item.tratamento_usuario_atualizacao_registro;

        return (
          <Card
            key={item.id}
            className="shadow-sm border-start border-danger border-0 mb-3 rounded-3"
          >
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Badge bg="danger" className="px-3 py-2">
                    {item.tipo || "Tratamento"}
                  </Badge>

                  <small className="text-muted">
                    {new Date(item.data_criacao).toLocaleDateString("pt-BR")}
                  </small>

                  {isConcluido ? (
                    <Badge bg="success-subtle" text="success" className="px-3 py-2">
                      Concluido
                    </Badge>
                  ) : (
                    <Badge bg="warning-subtle" text="warning" className="px-3 py-2">
                      Em andamento
                    </Badge>
                  )}
                </div>

                <div className="d-flex gap-2">
                  {!isConcluido && (
                    <Button
                      size="sm"
                      variant="light"
                      title="Concluir registro"
                      onClick={() => handleAbrirModalConclusaoRegistro(item)}
                    >
                      <BsCheckCircle />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="light"
                    title="Editar registro"
                    onClick={() => handleAbrirEdicaoTratamento(item)}
                  >
                    <BsPencilSquare />
                  </Button>

                  <Button
                    size="sm"
                    variant="light"
                    title="Excluir registro"
                    onClick={() => handleAbrirExclusaoRegistro(item)}
                  >
                    <BsTrash />
                  </Button>
                </div>
              </div>

              {precisaBaixar === "sim" && (
                <div className="mt-2">
                  <Badge bg="success-subtle" text="danger">
                    Tratamento Baixou o Solipede
                  </Badge>
                </div>
              )}
            </Card.Header>

            <Card.Body>
              <div className="mb-3">
                <h6 className="text-danger mb-1">
                  <BsClipboardCheck className="me-1" />
                  Diagnostico
                </h6>
                <p className="mb-0 text-muted">
                  {item.diagnostico || "-"}
                </p>
              </div>

              <hr />

              <div className="border-4 border-danger ps-3 mb-3">
                <strong className="text-danger">Observacoes Clinicas</strong>
                <p className="mb-0 text-muted">
                  {item.observacao_clinica || "-"}
                </p>
              </div>
            </Card.Body>

            <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
              <div className="border-4 border-warning ps-3 mb-3 w-100">
                <Row>
                  <Col xl={8}>
                    <small className="text-muted">
                      <strong>Criado por:</strong> {item.usuario_nome || "-"} <strong>RE:</strong> {item.usuario_registro || "-"}
                    </small>
                  </Col>
                  <Col xl={2}>
                    <p className="mb-0 text-muted">
                      {item.data_criacao ? new Date(item.data_criacao).toLocaleDateString("pt-BR") : "-"}
                    </p>
                  </Col>
                  <Col xl={2}>
                    <p className="mb-0 text-muted">
                      {item.data_validade ? new Date(item.data_validade).toLocaleDateString("pt-BR") : "-"}
                    </p>
                  </Col>
                </Row>

                {(usuarioAtualizacao || dataAtualizacao) && (
                  <Row className="mt-2">
                    <Col>
                      <small className="text-muted">
                        <strong>Ultima atualizacao:</strong>{" "}
                        {usuarioAtualizacao ? `${usuarioAtualizacao}${usuarioAtualizacaoRe ? ` (RE: ${usuarioAtualizacaoRe})` : ""}` : "-"}
                        {" | "}
                        {dataAtualizacao ? new Date(dataAtualizacao).toLocaleString("pt-BR") : "-"}
                      </small>
                    </Col>
                  </Row>
                )}
              </div>
            </Card.Footer>
          </Card>
        );
      })}

      <Modal show={showModalConclusaoRegistro} onHide={handleFecharModalConclusaoRegistro} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar conclusao do tratamento</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleConcluirRegistro}>
          <Modal.Body>
            <p className="text-muted mb-3">
              Para confirmar a conclusao deste registro, digite sua senha:
            </p>

            {erroConclusaoRegistro && (
              <Alert variant="danger" className="py-2">
                {erroConclusaoRegistro}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                value={senhaConclusaoRegistro}
                onChange={(e) => setSenhaConclusaoRegistro(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalConclusaoRegistro} disabled={concluindoRegistro}>
              Cancelar
            </Button>
            <Button variant="success" type="submit" disabled={concluindoRegistro}>
              {concluindoRegistro ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Concluindo...
                </>
              ) : (
                <>
                  <BsCheckCircle className="me-2" />
                  Confirmar conclusao
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalEdicaoTratamento} onHide={handleFecharEdicaoTratamento} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar tratamento</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSalvarEdicaoTratamento}>
          <Modal.Body>
            {registroSelecionado && (
              <>
                <Alert variant="info" className="mb-3">
                  <strong>Tipo:</strong> {registroSelecionado?.tipo || "Tratamento"}
                  <br />
                  <strong>Criado em:</strong> {registroSelecionado?.data_criacao ? new Date(registroSelecionado.data_criacao).toLocaleString("pt-BR") : "-"}
                </Alert>

                {erroEdicaoTratamento && (
                  <Alert variant="danger" className="py-2">
                    {erroEdicaoTratamento}
                  </Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Diagnostico *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={edicaoTratamento.diagnostico}
                    maxLength={1000}
                    onChange={(e) => setEdicaoTratamento({ ...edicaoTratamento, diagnostico: e.target.value })}
                    style={{ resize: "vertical" }}
                    placeholder="Descreva o diagnostico..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Observacoes clinicas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={edicaoTratamento.observacao_clinica}
                    onChange={(e) => setEdicaoTratamento({ ...edicaoTratamento, observacao_clinica: e.target.value })}
                    style={{ resize: "vertical" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Prescricao</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={edicaoTratamento.prescricao}
                    onChange={(e) => setEdicaoTratamento({ ...edicaoTratamento, prescricao: e.target.value })}
                    style={{ resize: "vertical" }}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharEdicaoTratamento} disabled={salvandoEdicao}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={salvandoEdicao}>
              {salvandoEdicao ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Salvando...
                </>
              ) : (
                "Salvar alteracoes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalExclusaoRegistro} onHide={handleFecharExclusaoRegistro} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir registro</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleExcluirRegistro}>
          <Modal.Body>
            <p className="text-muted mb-3">
              Esta acao nao pode ser desfeita. Informe sua senha para confirmar a exclusao.
            </p>

            {erroExclusaoRegistro && (
              <Alert variant="danger" className="py-2">
                {erroExclusaoRegistro}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                value={senhaExclusaoRegistro}
                onChange={(e) => setSenhaExclusaoRegistro(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharExclusaoRegistro} disabled={excluindoRegistro}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit" disabled={excluindoRegistro}>
              {excluindoRegistro ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Excluindo...
                </>
              ) : (
                "Confirmar exclusao"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoricoProntuarioTratamento;
