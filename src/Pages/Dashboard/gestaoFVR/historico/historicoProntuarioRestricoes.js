import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Modal,
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
import { buildUserErrorMessage } from "../../../../utils/errorHandling";

const HistoricoProntuarioRestricoes = ({ registros = [] }) => {
  const [dadosLocais, setDadosLocais] = useState([]);

  const [showModalConclusaoRegistro, setShowModalConclusaoRegistro] = useState(false);
  const [showModalEdicao, setShowModalEdicao] = useState(false);
  const [showModalExclusaoRegistro, setShowModalExclusaoRegistro] = useState(false);

  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  const [senhaConclusaoRegistro, setSenhaConclusaoRegistro] = useState("");
  const [senhaExclusaoRegistro, setSenhaExclusaoRegistro] = useState("");

  const [concluindoRegistro, setConcluindoRegistro] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindoRegistro, setExcluindoRegistro] = useState(false);

  const [erroConclusaoRegistro, setErroConclusaoRegistro] = useState("");
  const [erroEdicao, setErroEdicao] = useState("");
  const [erroExclusaoRegistro, setErroExclusaoRegistro] = useState("");

  const [edicao, setEdicao] = useState({
    observacao: "",
    recomendacoes: "",
    data_validade: "",
  });

  useEffect(() => {
    setDadosLocais(Array.isArray(registros) ? registros : []);
  }, [registros]);

  const toInputDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

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

  const handleAbrirEdicao = (item) => {
    setRegistroSelecionado(item);
    setErroEdicao("");
    setEdicao({
      observacao: item.restricao || "",
      recomendacoes: item.recomendacoes || "",
      data_validade: toInputDate(item.data_validade),
    });
    setShowModalEdicao(true);
  };

  const handleFecharEdicao = () => {
    setShowModalEdicao(false);
    setRegistroSelecionado(null);
    setErroEdicao("");
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
      const response = await api.concluirRegistro(registroSelecionado.id, senhaConclusaoRegistro);
      if (response?.error) {
        setErroConclusaoRegistro(
          buildUserErrorMessage(
            "Falha ao concluir restrição",
            response,
            "A API rejeitou a conclusão da restrição"
          )
        );
        return;
      }

      handleFecharModalConclusaoRegistro();
      window.location.reload();
    } catch (error) {
      setErroConclusaoRegistro(
        buildUserErrorMessage(
          "Falha ao concluir restrição",
          error,
          "Não foi possível concluir o registro de restrição"
        )
      );
    } finally {
      setConcluindoRegistro(false);
    }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!registroSelecionado?.id) return;

    setSalvandoEdicao(true);
    setErroEdicao("");

    try {
      const payload = {
        observacao: edicao.observacao,
        recomendacoes: edicao.recomendacoes,
        data_validade: edicao.data_validade || null,
      };

      const response = await api.atualizarProntuario(registroSelecionado.id, payload);
      if (response?.error) {
        setErroEdicao(
          buildUserErrorMessage(
            "Falha ao editar restrição",
            response,
            "A API rejeitou a atualização da restrição"
          )
        );
        return;
      }

      handleFecharEdicao();
      window.location.reload();
    } catch (error) {
      setErroEdicao(
        buildUserErrorMessage(
          "Falha ao salvar edição de restrição",
          error,
          "Não foi possível atualizar o registro de restrição"
        )
      );
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
        setErroExclusaoRegistro(
          buildUserErrorMessage(
            "Falha ao excluir restrição",
            response,
            "A API rejeitou a exclusão da restrição"
          )
        );
        return;
      }

      handleFecharExclusaoRegistro();
      window.location.reload();
    } catch (error) {
      setErroExclusaoRegistro(
        buildUserErrorMessage(
          "Falha ao excluir restrição",
          error,
          "Não foi possível excluir o registro de restrição"
        )
      );
    } finally {
      setExcluindoRegistro(false);
    }
  };

  return (
    <div>
      {dadosLocais.map((item) => {
        const statusAtual = item.restricao_status || item.status_conclusao || "";
        const isConcluido = String(statusAtual).toLowerCase() === "concluido";

        return (
          <Card key={item.id} className="shadow-sm border-start border-warning border-0 mb-3 rounded-3">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="warning" className="me-2 px-3 py-2">{item.tipo || "Restricoes"}</Badge>
                <small className="text-muted m-2">{item.data_criacao ? new Date(item.data_criacao).toLocaleDateString("pt-BR") : "-"}</small>
                {isConcluido ? (
                  <Badge bg="success-subtle" text="success" className="px-3 py-2">Concluido</Badge>
                ) : (
                  <Badge bg="warning-subtle" text="warning" className="px-3 py-2">Em andamento</Badge>
                )}
              </div>

              <div className="d-flex gap-2">
                {!isConcluido && (
                  <Button size="sm" variant="light" title="Concluir registro" onClick={() => handleAbrirModalConclusaoRegistro(item)}>
                    <BsCheckCircle />
                  </Button>
                )}
                <Button size="sm" variant="light" title="Editar registro" onClick={() => handleAbrirEdicao(item)}>
                  <BsPencilSquare />
                </Button>
                <Button size="sm" variant="light" title="Excluir registro" onClick={() => handleAbrirExclusaoRegistro(item)}>
                  <BsTrash />
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              <div className="mb-3">
                <h6 className="text-warning mb-1"><BsClipboardCheck className="me-1" />Restricao</h6>
                <p className="mb-0 text-muted">{item.restricao}</p>
              </div>

              <hr />

              <div className="border-4 border-warning ps-3 mb-3">
                <strong className="text-warning">Recomendacoes</strong>
                <p className="mb-0 text-muted">{item.recomendacoes || item.descricao || "-"}</p>
              </div>
            </Card.Body> 

            <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
              <div className="border-4 border-warning ps-3 mb-3 w-100">
                <Row>
                  <Col xl={8}>
                    <small className="text-muted"><strong>Criado por:</strong> {item.usuario_nome || "-"} <strong>RE:</strong> {item.usuario_registro || "-"}</small>
                    <br />
                    <small className="text-muted"><strong>Última atualização:</strong> {item.restricao_usuario_atualizacao_nome || "-"} <strong>RE:</strong> {item.restricao_usuario_atualizacao_registro || "-"}</small>
                  </Col>
                  <Col xl={2}><p className="mb-0 text-muted">{item.data_criacao ? new Date(item.data_criacao).toLocaleDateString("pt-BR") : "-"}</p></Col>
                  <Col xl={2}><p className="mb-0 text-muted">{item.restricao_data_atualizacao ? new Date(item.restricao_data_atualizacao).toLocaleDateString("pt-BR") : "-"}</p></Col>
                </Row>
              </div>
            </Card.Footer>
          </Card>
        );
      })}

      <Modal show={showModalConclusaoRegistro} onHide={handleFecharModalConclusaoRegistro} centered>
        <Modal.Header closeButton><Modal.Title>Confirmar conclusao do registro</Modal.Title></Modal.Header>
        <Form onSubmit={handleConcluirRegistro}>
          <Modal.Body>
            <p className="text-muted mb-3">Para confirmar a conclusao deste registro, digite sua senha:</p>
            {erroConclusaoRegistro && <Alert variant="danger" className="py-2">{erroConclusaoRegistro}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" value={senhaConclusaoRegistro} onChange={(e) => setSenhaConclusaoRegistro(e.target.value)} placeholder="Digite sua senha" required autoFocus />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharModalConclusaoRegistro} disabled={concluindoRegistro}>Cancelar</Button>
            <Button variant="success" type="submit" disabled={concluindoRegistro}>{concluindoRegistro ? <><Spinner size="sm" className="me-2" />Concluindo...</> : <><BsCheckCircle className="me-2" />Confirmar conclusao</>}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalEdicao} onHide={handleFecharEdicao} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Editar restricao</Modal.Title></Modal.Header>
        <Form onSubmit={handleSalvarEdicao}>
          <Modal.Body>
            {erroEdicao && <Alert variant="danger" className="py-2">{erroEdicao}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Restricao</Form.Label>
              <Form.Control as="textarea" rows={4} value={edicao.observacao} onChange={(e) => setEdicao({ ...edicao, observacao: e.target.value })} style={{ resize: "vertical" }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Recomendacoes</Form.Label>
              <Form.Control as="textarea" rows={3} value={edicao.recomendacoes} onChange={(e) => setEdicao({ ...edicao, recomendacoes: e.target.value })} style={{ resize: "vertical" }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data validade</Form.Label>
              <Form.Control type="date" value={edicao.data_validade} onChange={(e) => setEdicao({ ...edicao, data_validade: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharEdicao} disabled={salvandoEdicao}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={salvandoEdicao}>{salvandoEdicao ? <><Spinner size="sm" className="me-2" />Salvando...</> : "Salvar alteracoes"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalExclusaoRegistro} onHide={handleFecharExclusaoRegistro} centered>
        <Modal.Header closeButton><Modal.Title>Excluir registro</Modal.Title></Modal.Header>
        <Form onSubmit={handleExcluirRegistro}>
          <Modal.Body>
            <p className="text-muted mb-3">Esta acao nao pode ser desfeita. Informe sua senha para confirmar a exclusao.</p>
            {erroExclusaoRegistro && <Alert variant="danger" className="py-2">{erroExclusaoRegistro}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" value={senhaExclusaoRegistro} onChange={(e) => setSenhaExclusaoRegistro(e.target.value)} placeholder="Digite sua senha" required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharExclusaoRegistro} disabled={excluindoRegistro}>Cancelar</Button>
            <Button variant="danger" type="submit" disabled={excluindoRegistro}>{excluindoRegistro ? <><Spinner size="sm" className="me-2" />Excluindo...</> : "Confirmar exclusao"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoricoProntuarioRestricoes;
