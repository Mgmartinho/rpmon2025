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

const HistoricoProntuarioCirurgia = ({ registros = [], prontuarioId = null }) => {
  const [dadosLocais, setDadosLocais] = useState([]);
  const [carregandoRegistros, setCarregandoRegistros] = useState(false);

  const [showModalEdicao, setShowModalEdicao] = useState(false);
  const [showModalExclusaoRegistro, setShowModalExclusaoRegistro] = useState(false);

  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindoRegistro, setExcluindoRegistro] = useState(false);
  const [concluindoRegistroId, setConcluindoRegistroId] = useState(null);

  const [erroEdicao, setErroEdicao] = useState("");
  const [erroExclusaoRegistro, setErroExclusaoRegistro] = useState("");
  const [erroConclusaoRegistro, setErroConclusaoRegistro] = useState("");

  const [edicao, setEdicao] = useState({
    procedimento: "",
    descricao_procedimento: "",
    data_procedimento: "",
    status_conclusao: "em_andamento",
  });

  const mapearConsolidado = (item) => {
    if (item.procedimento !== undefined && item.prontuario_id !== undefined) {
      return item;
    }

    return {
      id: item.cirurgia_id || item.id,
      prontuario_id: item.prontuario_id || item.id,
      procedimento: item.procedimento || item.cirurgia_procedimento || "",
      descricao_procedimento:
        item.descricao_procedimento || item.cirurgia_descricao_procedimento || "",
      data_procedimento:
        item.data_procedimento || item.cirurgia_data_procedimento || null,
      status_conclusao: item.cirurgia_status || item.status_conclusao || "em_andamento",
      usuario_nome: item.cirurgia_usuario_nome || item.usuario_nome || "",
      usuario_registro: item.cirurgia_usuario_registro || item.usuario_registro || "",
      usuario_atualizacao_nome:
        item.cirurgia_usuario_atualizacao_nome || item.usuario_atualizacao_nome || "",
      usuario_atualizacao_registro:
        item.cirurgia_usuario_atualizacao_registro || item.usuario_atualizacao_registro || "",
      cirurgiao_principal_nome:
        item.cirurgiao_principal_nome || item.cirurgia_cirurgiao_principal_nome || "",
      cirurgiao_principal_registro:
        item.cirurgiao_principal_registro || item.cirurgia_cirurgiao_principal_registro || "",
      cirurgiao_anestesista_nome:
        item.cirurgiao_anestesista_nome || item.cirurgia_cirurgiao_anestesista_nome || "",
      cirurgiao_anestesista_registro:
        item.cirurgiao_anestesista_registro || item.cirurgia_cirurgiao_anestesista_registro || "",
      cirurgiao_auxiliar_nome:
        item.cirurgiao_auxiliar_nome || item.cirurgia_cirurgiao_auxiliar_nome || "",
      cirurgiao_auxiliar_registro:
        item.cirurgiao_auxiliar_registro || item.cirurgia_cirurgiao_auxiliar_registro || "",
      auxiliar_nome: item.auxiliar_nome || item.cirurgia_auxiliar_nome || "",
      auxiliar_registro: item.auxiliar_registro || item.cirurgia_auxiliar_registro || "",
      data_criacao: item.data_criacao || null,
      data_atualizacao: item.cirurgia_data_atualizacao || item.data_atualizacao || null,
      tipo: item.tipo || "Cirurgia",
    };
  };

  useEffect(() => {
    let ativo = true;

    const carregarRegistros = async () => {
      const idProntuario = prontuarioId || registros?.[0]?.prontuario_id || registros?.[0]?.id;

      if (!idProntuario) {
        setDadosLocais((Array.isArray(registros) ? registros : []).map(mapearConsolidado));
        return;
      }

      setCarregandoRegistros(true);
      try {
        const response = await api.listarProntuarioCirurgias(idProntuario);
        if (!ativo) return;

        setDadosLocais((Array.isArray(response) ? response : []).map(mapearConsolidado));
      } catch (error) {
        if (!ativo) return;
        setDadosLocais((Array.isArray(registros) ? registros : []).map(mapearConsolidado));
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

  const handleAbrirEdicao = (item) => {
    setRegistroSelecionado(item);
    setEdicao({
      procedimento: item.procedimento || "",
      descricao_procedimento: item.descricao_procedimento || "",
      data_procedimento: item.data_procedimento ? String(item.data_procedimento).slice(0, 10) : "",
      status_conclusao: item.status_conclusao || "em_andamento",
    });
    setErroEdicao("");
    setShowModalEdicao(true);
  };

  const handleFecharEdicao = () => {
    setShowModalEdicao(false);
    setRegistroSelecionado(null);
    setEdicao({
      procedimento: "",
      descricao_procedimento: "",
      data_procedimento: "",
      status_conclusao: "em_andamento",
    });
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

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    if (!registroSelecionado?.id) {
      setErroEdicao("Nenhum registro selecionado.");
      return;
    }

    if (!edicao.procedimento?.trim()) {
      setErroEdicao("Procedimento é obrigatório.");
      return;
    }

    if (!edicao.descricao_procedimento?.trim()) {
      setErroEdicao("Descrição do procedimento é obrigatória.");
      return;
    }

    setSalvandoEdicao(true);

    const payload = {
      procedimento: edicao.procedimento.trim(),
      descricao_procedimento: edicao.descricao_procedimento.trim(),
      data_procedimento: edicao.data_procedimento || null,
      status_conclusao: edicao.status_conclusao,
    };

    try {
      const response = await api.atualizarProntuarioCirurgia(registroSelecionado.id, payload);

      if (response?.error || response?.erro) {
        setErroEdicao(response.error || response.erro);
        return;
      }

      setDadosLocais((prev) =>
        prev.map((r) =>
          r.id === registroSelecionado.id
            ? {
                ...r,
                ...payload,
                data_atualizacao: new Date().toISOString(),
              }
            : r
        )
      );

      handleFecharEdicao();
    } catch (error) {
      setErroEdicao(error.message || "Erro ao atualizar cirurgia");
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleExcluirRegistro = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!registroSelecionado?.id) {
      setErroExclusaoRegistro("Nenhum registro selecionado.");
      return;
    }

    setExcluindoRegistro(true);

    try {
      const response = await api.excluirProntuarioCirurgia(registroSelecionado.id);

      if (response?.error || response?.erro) {
        setErroExclusaoRegistro(response.error || response.erro);
        return;
      }

      setDadosLocais((prev) => prev.filter((r) => r.id !== registroSelecionado.id));
      handleFecharExclusaoRegistro();
    } catch (error) {
      setErroExclusaoRegistro(error.message || "Erro ao excluir cirurgia");
    } finally {
      setExcluindoRegistro(false);
    }
  };

  const handleConcluirRegistro = async (item) => {
    if (!item?.id) return;

    setErroConclusaoRegistro("");
    setConcluindoRegistroId(item.id);

    try {
      const response = await api.concluirProntuarioCirurgia(item.id);

      if (response?.error || response?.erro) {
        setErroConclusaoRegistro(response.error || response.erro);
        return;
      }

      setDadosLocais((prev) =>
        prev.map((registro) =>
          registro.id === item.id
            ? {
                ...registro,
                status_conclusao: "concluido",
                data_atualizacao: new Date().toISOString(),
              }
            : registro
        )
      );
    } catch (error) {
      setErroConclusaoRegistro(error.message || "Erro ao concluir cirurgia");
    } finally {
      setConcluindoRegistroId(null);
    }
  };

  if (carregandoRegistros) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p className="mt-2 mb-0">Carregando registros...</p>
      </div>
    );
  }

  if (!dadosLocais || dadosLocais.length === 0) {
    return (
      <Alert variant="info" className="py-2 px-3 mb-0">
        <small>Nenhum registro de cirurgia encontrado.</small>
      </Alert>
    );
  }

  return (
    <div>
      {erroConclusaoRegistro && (
        <Alert variant="danger" className="py-2 mb-3">
          {erroConclusaoRegistro}
        </Alert>
      )}

      {dadosLocais.map((item) => {
        const isConcluido = String(item.status_conclusao || "").toLowerCase() === "concluido";
        const concluindoAtual = concluindoRegistroId === item.id;

        return (
          <Card
            key={item.id}
            className="shadow-sm border-start border-primary border-0 mb-3 rounded-3"
          >
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="primary" className="me-2 px-3 py-2">
                  Cirurgia
                </Badge>
                <small className="text-muted m-2">
                  {item.data_criacao
                    ? new Date(item.data_criacao).toLocaleDateString("pt-BR")
                    : "-"}
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
                    onClick={() => handleConcluirRegistro(item)}
                    disabled={concluindoAtual}
                  >
                    {concluindoAtual ? <Spinner size="sm" animation="border" /> : <BsCheckCircle />}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="light"
                  title="Editar registro"
                  onClick={() => handleAbrirEdicao(item)}
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
            </Card.Header>

            <Card.Body>
              <div className="mb-3">
                <h6 className="text-primary mb-1">
                  <BsClipboardCheck className="me-1" />Detalhes do Procedimento
                </h6>
                <p className="mb-1 text-muted">
                  <strong>Data do procedimento:</strong> {formatarData(item.data_procedimento)}
                </p>
                <p className="mb-1 text-muted">
                  <strong>Procedimento:</strong> {item.procedimento || "-"}
                </p>
              </div>

              {(item.descricao_procedimento || "").trim().length > 0 && (
                <div className="border-4 border-primary ps-3 mb-3">
                  <strong className="text-primary">Descrição do procedimento</strong>
                  <p className="mb-0 text-muted">{item.descricao_procedimento}</p>
                </div>
              )}

              <hr />

              <Row>
                <Col md={6}>
                  <p className="mb-1 text-muted">
                    <strong>Cirurgião principal:</strong>{" "}
                    {item.cirurgiao_principal_nome || "-"}
                    {item.cirurgiao_principal_registro ? ` (RE ${item.cirurgiao_principal_registro})` : ""}
                  </p>
                  <p className="mb-1 text-muted">
                    <strong>Cirurgião anestesista:</strong>{" "}
                    {item.cirurgiao_anestesista_nome || "-"}
                    {item.cirurgiao_anestesista_registro ? ` (RE ${item.cirurgiao_anestesista_registro})` : ""}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-1 text-muted">
                    <strong>Cirurgião auxiliar:</strong>{" "}
                    {item.cirurgiao_auxiliar_nome || "-"}
                    {item.cirurgiao_auxiliar_registro ? ` (RE ${item.cirurgiao_auxiliar_registro})` : ""}
                  </p>
                  <p className="mb-1 text-muted">
                    <strong>Auxiliar:</strong> {item.auxiliar_nome || "-"}
                    {item.auxiliar_registro ? ` (RE ${item.auxiliar_registro})` : ""}
                  </p>
                </Col>
              </Row>
            </Card.Body>

            <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
              <div className="border-4 border-warning ps-3 mb-3 w-100">
                <Row>
                  <Col xl={8}>
                    <small className="text-muted">
                      <strong>Criado por:</strong> {item.usuario_nome || "-"} <strong>RE:</strong>{" "}
                      {item.usuario_registro || "-"}
                    </small>
                    <br />
                    <small className="text-muted">
                      <strong>Última atualização:</strong>{" "}
                      {item.usuario_atualizacao_nome || item.usuario_nome || "-"} <strong>RE:</strong>{" "}
                      {item.usuario_atualizacao_registro || item.usuario_registro || "-"}
                    </small>
                  </Col>
                  <Col xl={2}>
                    <p className="mb-0 text-muted">
                      {item.data_criacao
                        ? new Date(item.data_criacao).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </Col>
                  <Col xl={2}>
                    <p className="mb-0 text-muted">
                      {item.data_atualizacao
                        ? new Date(item.data_atualizacao).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </div>
            </Card.Footer>
          </Card>
        );
      })}

      <Modal show={showModalEdicao} onHide={handleFecharEdicao} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cirurgia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erroEdicao && <Alert variant="danger" className="mb-2">{erroEdicao}</Alert>}
          <Form onSubmit={handleSalvarEdicao}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data do procedimento</Form.Label>
              <Form.Control
                type="date"
                value={edicao.data_procedimento}
                onChange={(e) => setEdicao({ ...edicao, data_procedimento: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Procedimento</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={edicao.procedimento}
                onChange={(e) => setEdicao({ ...edicao, procedimento: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Status</Form.Label>
              <Form.Select
                value={edicao.status_conclusao}
                onChange={(e) => setEdicao({ ...edicao, status_conclusao: e.target.value })}
              >
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Descrição do procedimento</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                maxLength={10000}
                value={edicao.descricao_procedimento}
                onChange={(e) => setEdicao({ ...edicao, descricao_procedimento: e.target.value })}
              />
              <small className="text-muted">{edicao.descricao_procedimento.length}/10000 caracteres</small>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharEdicao} disabled={salvandoEdicao}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvarEdicao} disabled={salvandoEdicao}>
            {salvandoEdicao ? "Salvando..." : "Salvar"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalExclusaoRegistro} onHide={handleFecharExclusaoRegistro} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir Cirurgia</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleExcluirRegistro}>
          <Modal.Body>
            {erroExclusaoRegistro && <Alert variant="danger" className="mb-2">{erroExclusaoRegistro}</Alert>}
            <p>Tem certeza que deseja excluir este registro?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleFecharExclusaoRegistro} disabled={excluindoRegistro}>
              Cancelar
            </Button>
            <Button variant="danger" type="submit" disabled={excluindoRegistro}>
              {excluindoRegistro ? "Excluindo..." : "Excluir"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoricoProntuarioCirurgia;
