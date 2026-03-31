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

const HistoricoProntuarioVacinacao = ({ registros = [], prontuarioId = null }) => {
  const [dadosLocais, setDadosLocais] = useState([]);
  const [carregandoRegistros, setCarregandoRegistros] = useState(false);

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
    produto: "",
    partida: "",
    fabricacao: "",
    lote: "",
    dose: "",
    data_inicio: "",
    data_validade: "",
    descricao: "",
  });

  const mapearConsolidado = (item) => {
    if (item.produto !== undefined && item.prontuario_id !== undefined) {
      return item;
    }

    return {
      id: item.vacinacao_id,
      prontuario_id: item.prontuario_id || item.id,
      produto: item.produto || item.vacinacao_produto || "",
      partida: item.partida || item.vacinacao_partida || "",
      fabricacao: item.fabricacao || item.vacinacao_fabricacao || null,
      lote: item.lote || item.vacinacao_lote || "",
      dose: item.dose || item.vacinacao_dose || "",
      data_inicio: item.data_inicio || item.vacinacao_data_inicio || null,
      data_validade: item.data_validade || item.vacinacao_data_validade || null,
      descricao: item.descricao || item.vacinacao_descricao || "",
      status_conclusao: item.vacinacao_status || item.status_conclusao || "",
      usuario_nome: item.vacinacao_usuario_nome || item.usuario_nome || "",
      usuario_registro: item.vacinacao_usuario_registro || item.usuario_registro || "",
      usuario_aplicacao:
        item.usuario_aplicacao ||
        item.vacinacao_usuario_aplicacao ||
        item.vacinacao_usuario_id ||
        null,
      usuario_aplicacao_nome:
        item.usuario_aplicacao_nome ||
        item.vacinacao_usuario_aplicacao_nome ||
        item.vacinacao_usuario_nome ||
        item.usuario_nome ||
        null,
      data_criacao: item.data_criacao || null,
      data_atualizacao: item.vacinacao_data_atualizacao || item.data_atualizacao || null,
      data_fim: item.data_fim || item.vacinacao_data_fim || null,
      tipo: item.tipo || "Vacinacao",
    };
  };

  useEffect(() => {
    let ativo = true;

    const carregarRegistros = async () => {
      const idProntuario = prontuarioId || registros?.[0]?.prontuario_id || registros?.[0]?.id;

      if (!idProntuario) {
        setDadosLocais(
          (Array.isArray(registros) ? registros : []).map(mapearConsolidado)
        );
        return;
      }

      setCarregandoRegistros(true);
      try {
        const response = await api.listarProntuarioVacinacoes(idProntuario);
        if (!ativo) return;

        setDadosLocais((Array.isArray(response) ? response : []).map(mapearConsolidado));
      } catch (error) {
        if (!ativo) return;
        setDadosLocais(
          (Array.isArray(registros) ? registros : []).map(mapearConsolidado)
        );
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
      produto: item.produto || "",
      partida: item.partida || "",
      fabricacao: item.fabricacao ? String(item.fabricacao).slice(0, 10) : "",
      lote: item.lote || "",
      dose: item.dose || "",
      data_inicio: item.data_inicio ? String(item.data_inicio).slice(0, 10) : "",
      data_validade: item.data_validade ? String(item.data_validade).slice(0, 10) : "",
      descricao: item.descricao || "",
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
      const response = await api.concluirRegistro(registroSelecionado.prontuario_id, senhaConclusaoRegistro);
      if (response?.error) {
        setErroConclusaoRegistro(
          buildUserErrorMessage(
            "Falha ao concluir vacinação",
            response,
            "A API rejeitou a conclusão da vacinação"
          )
        );
        return;
      }

      handleFecharModalConclusaoRegistro();
      window.location.reload();
    } catch (error) {
      setErroConclusaoRegistro(
        buildUserErrorMessage(
          "Falha ao concluir vacinação",
          error,
          "Não foi possível concluir o registro de vacinação"
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
        produto: edicao.produto,
        partida: edicao.partida,
        fabricacao: edicao.fabricacao || null,
        lote: edicao.lote,
        dose: edicao.dose,
        data_inicio: edicao.data_inicio || null,
        data_validade: edicao.data_validade || null,
        descricao: edicao.descricao,
      };

      const response = await api.atualizarProntuarioVacinacao(registroSelecionado.id, payload);
      if (response?.error) {
        setErroEdicao(
          buildUserErrorMessage(
            "Falha ao editar vacinação",
            response,
            "A API rejeitou a atualização da vacinação"
          )
        );
        return;
      }

      handleFecharEdicao();
      window.location.reload();
    } catch (error) {
      setErroEdicao(
        buildUserErrorMessage(
          "Falha ao salvar edição de vacinação",
          error,
          "Não foi possível atualizar o registro de vacinação"
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
      const response = await api.excluirProntuarioVacinacao(
        registroSelecionado.id,
        senhaExclusaoRegistro
      );
      if (response?.error || response?.erro) {
        setErroExclusaoRegistro(
          buildUserErrorMessage(
            "Falha ao excluir vacinação",
            response,
            "A API rejeitou a exclusão da vacinação"
          )
        );
        return;
      }

      handleFecharExclusaoRegistro();
      window.location.reload();
    } catch (error) {
      setErroExclusaoRegistro(
        buildUserErrorMessage(
          "Falha ao excluir vacinação",
          error,
          "Não foi possível excluir o registro de vacinação"
        )
      );
    } finally {
      setExcluindoRegistro(false);
    }
  };

  return (
    <div>
      {carregandoRegistros && (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" className="me-2" />
          Carregando registros de vacinação...
        </div>
      )}

      {dadosLocais.map((item) => {
        const isConcluido = String(item.status_conclusao || "").toLowerCase() === "concluido";
        const responsavelAplicacao =
          item.usuario_aplicacao_nome || item.usuario_aplicacao || "-";

        return (
          <Card
            key={item.id}
            className="shadow-sm border-start border-info border-0 mb-3 rounded-3"
          >
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="info" className="me-2 px-3 py-2">
                  {item.tipo || "Vacinacao"}
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
                  Vacinação
                </h6>
                <Row className="mt-3">
                  <Col xl={3} md={4} sm={12}>
                    <p className="mb-1 text-muted">
                      <strong>Produto(Vacina):</strong> {item.produto || "-"}
                    </p>
                  </Col>
                  <Col xl={3} md={4} sm={12}>
                    <p className="mb-1 text-muted">
                      <strong>Partida:</strong> {item.partida || "-"}
                    </p>
                  </Col>
                  <Col xl={3} md={4} sm={12}>
                    <p className="mb-1 text-muted">
                      <strong>Data de Fabricacao:</strong> {formatarData(item.fabricacao)}
                    </p>
                  </Col>
                   <Col xl={3} md={4} sm={12}>
                    <p className="mb-1 text-muted">
                      <strong>Data de Validade:</strong> {formatarData(item.data_validade)}
                    </p>
                  </Col>
                  <Col xl={6} md={6} sm={12}>
                    <p className="mb-1 text-muted">
                      <strong>Data da Aplicacao:</strong> {formatarData(item.data_inicio)}
                    </p>
                  </Col>
                   <Col xl={6} md={6} sm={12}>
                    <p className="mb-1 text-muted">
                      <strong>Responsável Aplicação:</strong> {responsavelAplicacao}
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
                      {formatarData(item.data_fim)}
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
            <Button variant="success" type="submit" disabled={concluindoRegistro}>
              {concluindoRegistro ? <><Spinner size="sm" className="me-2" />Concluindo...</> : <><BsCheckCircle className="me-2" />Confirmar conclusao</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalEdicao} onHide={handleFecharEdicao} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar vacinacao</Modal.Title>
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
              <Form.Label className="fw-bold">Data de Fabricacao</Form.Label>
              <Form.Control type="date" value={edicao.fabricacao} onChange={(e) => setEdicao({ ...edicao, fabricacao: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data de Validade</Form.Label>
              <Form.Control type="date" value={edicao.data_validade} onChange={(e) => setEdicao({ ...edicao, data_validade: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data de Inicio</Form.Label>
              <Form.Control type="date" value={edicao.data_inicio} onChange={(e) => setEdicao({ ...edicao, data_inicio: e.target.value })} />
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
            <Button variant="danger" type="submit" disabled={excluindoRegistro}>
              {excluindoRegistro ? <><Spinner size="sm" className="me-2" />Excluindo...</> : "Confirmar exclusao"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoricoProntuarioVacinacao;
