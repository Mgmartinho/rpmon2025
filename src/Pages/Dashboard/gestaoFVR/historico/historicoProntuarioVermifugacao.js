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

const HistoricoProntuarioVermifugacao = ({ registros = [], prontuarioId = null }) => {
  const [dadosLocais, setDadosLocais] = useState([]);
  const [carregandoRegistros, setCarregandoRegistros] = useState(false);

  const [showModalConclusaoRegistro, setShowModalConclusaoRegistro] = useState(false);
  const [showModalEdicao, setShowModalEdicao] = useState(false);
  const [showModalExclusaoRegistro, setShowModalExclusaoRegistro] = useState(false);

  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  const [concluindoRegistro, setConcluindoRegistro] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindoRegistro, setExcluindoRegistro] = useState(false);

  const [erroConclusaoRegistro, setErroConclusaoRegistro] = useState("");
  const [erroEdicao, setErroEdicao] = useState("");
  const [erroExclusaoRegistro, setErroExclusaoRegistro] = useState("");

  const [edicao, setEdicao] = useState({
    produto: "",
    partida: "",
    fabricacao: "",
    data_inicio: "",
    data_fabricacao: "",
    data_validade: "",
    descricao: "",
    status_conclusao: "em_andamento",
  });

  const mapearConsolidado = (item) => {
    // se já veio do endpoint específico (sem prefixo), usa direto
    if (item.produto !== undefined) return item;
    return {
      id: item.vermifugacao_id,
      prontuario_id: item.id,
      produto: item.vermifugacao_produto,
      partida: item.vermifugacao_partida,
      fabricacao: item.vermifugacao_fabricacao,
      data_inicio: item.vermifugacao_data_inicio,
      data_fabricacao: item.vermifugacao_data_fabricacao,
      data_validade: item.vermifugacao_data_validade,
      descricao: item.vermifugacao_descricao,
      status_conclusao: item.vermifugacao_status || item.status_conclusao,
      usuario_nome: item.vermifugacao_usuario_nome || item.usuario_nome,
      usuario_registro: item.vermifugacao_usuario_registro || item.usuario_registro,
      data_criacao: item.data_criacao,
      data_atualizacao: item.vermifugacao_data_atualizacao || item.data_atualizacao,
    };
  };

  useEffect(() => {
    let ativo = true;

    const carregarRegistros = async () => {
      const idProntuario = prontuarioId || registros?.[0]?.prontuario_id;

      if (!idProntuario) {
        setDadosLocais(
          (Array.isArray(registros) ? registros : []).map(mapearConsolidado)
        );
        return;
      }

      setCarregandoRegistros(true);
      try {
        const response = await api.listarProntuarioVermifugacoes(idProntuario);
        if (!ativo) return;

        setDadosLocais(Array.isArray(response) ? response : []);
      } catch (error) {
        if (!ativo) return;
        setDadosLocais(Array.isArray(registros) ? registros : []);
      } finally {
        if (ativo) {
          setCarregandoRegistros(false);
        }
      }
    };

    carregarRegistros();

    return () => {
      ativo = false;
    };
  }, [prontuarioId, registros]);

  const formatarData = (valor) => {
    if (!valor) return "-";
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? "-" : data.toLocaleDateString("pt-BR");
  };

  const handleAbrirModalConclusaoRegistro = (item) => {
    setRegistroSelecionado(item);
    setErroConclusaoRegistro("");
    setShowModalConclusaoRegistro(true);
  };

  const handleFecharModalConclusaoRegistro = () => {
    setShowModalConclusaoRegistro(false);
    setRegistroSelecionado(null);
    setErroConclusaoRegistro("");
  };

  const handleAbrirEdicao = (item) => {
    setRegistroSelecionado(item);
    setErroEdicao("");
    setEdicao({
      produto: item.produto || "",
      partida: item.partida || "",
      fabricacao: item.fabricacao ? String(item.fabricacao).slice(0, 10) : "",
      data_inicio: item.data_inicio ? String(item.data_inicio).slice(0, 10) : "",
      data_fabricacao: item.data_fabricacao ? String(item.data_fabricacao).slice(0, 10) : "",
      data_validade: item.data_validade ? String(item.data_validade).slice(0, 10) : "",
      descricao: item.descricao || "",
      status_conclusao: item.status_conclusao || "em_andamento",
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
    setErroExclusaoRegistro("");
    setShowModalExclusaoRegistro(true);
  };

  const handleFecharExclusaoRegistro = () => {
    setShowModalExclusaoRegistro(false);
    setRegistroSelecionado(null);
    setErroExclusaoRegistro("");
  };

  const handleConcluirRegistro = async () => {
    if (!registroSelecionado?.id) return;

    setConcluindoRegistro(true);
    setErroConclusaoRegistro("");

    try {
      const response = await api.atualizarProntuarioVermifugacao(registroSelecionado.id, {
        status_conclusao: "concluido",
      });

      const respostaErro = response?.error || response?.erro;
      if (respostaErro) {
        setErroConclusaoRegistro(respostaErro);
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

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!registroSelecionado?.id) return;

    setSalvandoEdicao(true);
    setErroEdicao("");

    try {
      const payload = {
        produto: edicao.produto,
        partida: edicao.partida,
        fabricacao: edicao.fabricacao || null,
        data_inicio: edicao.data_inicio || null,
        data_fabricacao: edicao.data_fabricacao || null,
        data_validade: edicao.data_validade || null,
        descricao: edicao.descricao,
        status_conclusao: edicao.status_conclusao || "em_andamento",
      };

      const response = await api.atualizarProntuarioVermifugacao(registroSelecionado.id, payload);
      const respostaErro = response?.error || response?.erro;
      if (respostaErro) {
        setErroEdicao(respostaErro);
        return;
      }

      handleFecharEdicao();
      window.location.reload();
    } catch (error) {
      setErroEdicao("Erro ao salvar edicao. Tente novamente.");
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleExcluirRegistro = async () => {
    if (!registroSelecionado?.id) return;

    setExcluindoRegistro(true);
    setErroExclusaoRegistro("");

    try {
      const response = await api.excluirProntuarioVermifugacao(registroSelecionado.id);
      const respostaErro = response?.error || response?.erro;
      if (respostaErro) {
        setErroExclusaoRegistro(respostaErro);
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
      {carregandoRegistros && (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" className="me-2" />
          Carregando registros de vermifugação...
        </div>
      )}

      {dadosLocais.map((item) => {
        const isConcluido = String(item.status_conclusao || "").toLowerCase() === "concluido";

        return (
          <Card
            key={item.id}
            className="shadow-sm border-start border-info border-0 mb-3 rounded-3"
          >
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="info" className="me-2 px-3 py-2">
                  {item.tipo || "Vermifugacao"}
                </Badge>
                <small className="text-muted m-2">
                  {formatarData(item.data_criacao)}
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
                <h6 className="text-info mb-1">
                  <BsClipboardCheck className="me-1" />
                  Vermifugação
                </h6>
                <Row className="mt-3">
                  <Col xl={4} md={4} sm={12}>
                    <p className="mb-0 text-muted">
                      <strong>Produto (Vermífugo):</strong> {item.produto || "-"}
                    </p>
                  </Col>
                  <Col xl={4} md={4} sm={12}>
                    <p className="mb-0 text-muted">
                      <strong>Partida:</strong> {item.partida || "-"}
                    </p>
                  </Col>
                  <Col xl={4} md={4} sm={12}>
                    <p className="mb-0 text-muted">
                      <strong>Data de Fabricação:</strong> {formatarData(item.data_fabricacao)}
                    </p>
                  </Col>
                  <Col xl={4} md={4} sm={12}>
                    <p className="mb-0 text-muted">
                      <strong>Data da Aplicação:</strong> {formatarData(item.data_inicio)}
                    </p>
                  </Col>
                  <Col xl={4} md={4} sm={12}>
                    <p className="mb-0 text-muted">
                      <strong>Data de Validade:</strong> {formatarData(item.data_validade)}
                    </p>
                  </Col>
                </Row>
              </div>

              <hr />
            </Card.Body>

            <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
              <div className="border-4 border-warning ps-3 mb-3 w-100">
                <Row>
                  <Col xl={8}>
                    <small className="text-muted">
                      <strong>Criado por:</strong> {item.usuario_nome || "-"} <strong>RE:</strong> {item.usuario_registro || "-"}
                    </small>
                    <br />
                    <small className="text-muted">
                      <strong>Ultima atualizacao:</strong> {formatarData(item.data_atualizacao)}
                    </small>
                  </Col>
                  <Col xl={4}>
                    <p className="mb-0 text-muted">
                      {formatarData(item.data_atualizacao)}
                    </p>
                  </Col>
                </Row>
              </div>
            </Card.Footer>
          </Card>
        );
      })}

      <Modal show={showModalConclusaoRegistro} onHide={handleFecharModalConclusaoRegistro} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar conclusao do registro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">Confirma a conclusão deste registro de vermifugação?</p>
          {erroConclusaoRegistro && <Alert variant="danger" className="py-2">{erroConclusaoRegistro}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharModalConclusaoRegistro} disabled={concluindoRegistro}>Cancelar</Button>
          <Button variant="success" onClick={handleConcluirRegistro} disabled={concluindoRegistro}>
            {concluindoRegistro ? <><Spinner size="sm" className="me-2" />Concluindo...</> : <><BsCheckCircle className="me-2" />Confirmar conclusao</>}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalEdicao} onHide={handleFecharEdicao} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar vermifugacao</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSalvarEdicao}>
          <Modal.Body>
            {erroEdicao && <Alert variant="danger" className="py-2">{erroEdicao}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Produto</Form.Label>
              <Form.Control value={edicao.produto} onChange={(e) => setEdicao({ ...edicao, produto: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Partida</Form.Label>
              <Form.Control value={edicao.partida} onChange={(e) => setEdicao({ ...edicao, partida: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Fabricação</Form.Label>
              <Form.Control type="date" value={edicao.fabricacao} onChange={(e) => setEdicao({ ...edicao, fabricacao: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data de Fabricação</Form.Label>
              <Form.Control type="date" value={edicao.data_fabricacao} onChange={(e) => setEdicao({ ...edicao, data_fabricacao: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data de Inicio</Form.Label>
              <Form.Control type="date" value={edicao.data_inicio} onChange={(e) => setEdicao({ ...edicao, data_inicio: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data de Validade</Form.Label>
              <Form.Control type="date" value={edicao.data_validade} onChange={(e) => setEdicao({ ...edicao, data_validade: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Status</Form.Label>
              <Form.Select value={edicao.status_conclusao} onChange={(e) => setEdicao({ ...edicao, status_conclusao: e.target.value })}>
                <option value="em_andamento">Em andamento</option>
                <option value="concluido">Concluido</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Descricao</Form.Label>
              <Form.Control as="textarea" rows={3} value={edicao.descricao} onChange={(e) => setEdicao({ ...edicao, descricao: e.target.value })} style={{ resize: "vertical" }} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharEdicao} disabled={salvandoEdicao}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={salvandoEdicao}>
              {salvandoEdicao ? <><Spinner size="sm" className="me-2" />Salvando...</> : "Salvar alteracoes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalExclusaoRegistro} onHide={handleFecharExclusaoRegistro} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir registro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">Esta acao nao pode ser desfeita. Confirma a exclusao deste registro?</p>
          {erroExclusaoRegistro && <Alert variant="danger" className="py-2">{erroExclusaoRegistro}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharExclusaoRegistro} disabled={excluindoRegistro}>Cancelar</Button>
          <Button variant="danger" onClick={handleExcluirRegistro} disabled={excluindoRegistro}>
            {excluindoRegistro ? <><Spinner size="sm" className="me-2" />Excluindo...</> : "Confirmar exclusao"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HistoricoProntuarioVermifugacao;
