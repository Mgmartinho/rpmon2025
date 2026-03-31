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

const HistoricoProntuarioAieMormo = ({ registros = [], prontuarioId = null }) => {
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
  const [senhaExclusaoRegistro, setSenhaExclusaoRegistro] = useState("");

  const [edicao, setEdicao] = useState({
    data_exame: "",
    validade: "",
    resultado: "",
    descricao: "",
    status_conclusao: "em_andamento",
  });

  const mapearConsolidado = (item) => {
    if (item.data_exame !== undefined) return item;
    return {
      id: item.aiemormo_id,
      prontuario_id: item.id,
      data_exame: item.aiemormo_data_exame,
      validade: item.aiemormo_validade,
      resultado: item.aiemormo_resultado,
      descricao: item.aiemormo_descricao,
      status_conclusao: item.aiemormo_status || item.status_conclusao,
      usuario_nome: item.aiemormo_usuario_nome || item.usuario_nome,
      usuario_registro: item.aiemormo_usuario_registro || item.usuario_registro,
      usuario_aplicacao_nome:
        item.aiemormo_usuario_aplicacao_nome ||
        item.usuario_aplicacao_nome ||
        item.aiemormo_usuario_nome ||
        item.usuario_nome,
      usuario_aplicacao: item.aiemormo_usuario_aplicacao || item.usuario_aplicacao,
      usuario_atualizacao_nome:
        item.aiemormo_usuario_atualizacao_nome || item.usuario_atualizacao_nome,
      usuario_atualizacao_registro:
        item.aiemormo_usuario_atualizacao_registro || item.usuario_atualizacao_registro,
      data_criacao: item.data_criacao,
      data_atualizacao: item.aiemormo_data_atualizacao || item.data_atualizacao,
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
        const response = await api.listarProntuarioAieMormo(idProntuario);
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

  const handleAbrirEdicao = (item) => {
    setRegistroSelecionado(item);
    setEdicao({
      data_exame: item.data_exame || "",
      validade: item.validade || "",
      resultado: item.resultado || "",
      descricao: item.descricao || "",
      status_conclusao: item.status_conclusao || "em_andamento",
    });
    setErroEdicao("");
    setShowModalEdicao(true);
  };

  const handleFecharEdicao = () => {
    setShowModalEdicao(false);
    setRegistroSelecionado(null);
    setEdicao({
      data_exame: "",
      validade: "",
      resultado: "",
      descricao: "",
      status_conclusao: "em_andamento",
    });
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

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    if (!registroSelecionado) {
      setErroEdicao("Nenhum registro selecionado.");
      return;
    }

    setSalvandoEdicao(true);
    const payload = {
      data_exame: edicao.data_exame || null,
      validade: edicao.validade || null,
      resultado: edicao.resultado || null,
      descricao: edicao.descricao?.trim() || null,
      status_conclusao: edicao.status_conclusao,
    };

    try {
      const response = await api.atualizarProntuarioAieMormo(registroSelecionado.id, payload);

      if (response?.error || response?.erro) {
        setErroEdicao(
          buildUserErrorMessage(
            "Falha ao editar AIE & Mormo",
            response,
            "A API rejeitou a atualização do exame"
          )
        );
        return;
      }

      setDadosLocais((prev) =>
        prev.map((r) => (r.id === registroSelecionado.id ? { ...r, ...edicao } : r))
      );

      handleFecharEdicao();
    } catch (error) {
      setErroEdicao(
        buildUserErrorMessage(
          "Falha ao atualizar AIE & Mormo",
          error,
          "Não foi possível atualizar o registro de AIE & Mormo"
        )
      );
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleExcluirRegistro = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!registroSelecionado) {
      setErroExclusaoRegistro("Nenhum registro selecionado.");
      return;
    }

    setExcluindoRegistro(true);

    try {
      const response = await api.excluirProntuarioAieMormo(
        registroSelecionado.id,
        senhaExclusaoRegistro
      );

      if (response?.error || response?.erro) {
        setErroExclusaoRegistro(
          buildUserErrorMessage(
            "Falha ao excluir AIE & Mormo",
            response,
            "A API rejeitou a exclusão do exame"
          )
        );
        return;
      }

      setDadosLocais((prev) => prev.filter((r) => r.id !== registroSelecionado.id));

      handleFecharExclusaoRegistro();
    } catch (error) {
      setErroExclusaoRegistro(
        buildUserErrorMessage(
          "Falha ao excluir AIE & Mormo",
          error,
          "Não foi possível excluir o registro de AIE & Mormo"
        )
      );
    } finally {
      setExcluindoRegistro(false);
    }
  };

  const handleConcluirRegistro = async (item) => {
    if (!item?.id) return;

    setErroConclusaoRegistro("");
    setConcluindoRegistroId(item.id);

    try {
      const response = await api.concluirProntuarioAieMormo(item.id);

      if (response?.error || response?.erro) {
        setErroConclusaoRegistro(
          buildUserErrorMessage(
            "Falha ao concluir AIE & Mormo",
            response,
            "A API rejeitou a conclusão do exame"
          )
        );
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
      setErroConclusaoRegistro(
        buildUserErrorMessage(
          "Falha ao concluir AIE & Mormo",
          error,
          "Não foi possível concluir o registro de AIE & Mormo"
        )
      );
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
        <small>Nenhum registro de AIE & Mormo encontrado.</small>
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
        const isConcluido =
          String(item.status_conclusao || "").toLowerCase() === "concluido";
        const concluindoAtual = concluindoRegistroId === item.id;
        const responsavelAplicacao =
          item.usuario_aplicacao_nome ||
          item.aiemormo_usuario_aplicacao_nome ||
          item.usuario_nome ||
          item.usuario_aplicacao ||
          "-";

        return (
          <Card
            key={item.id}
            className="shadow-sm border-start border-success border-0 mb-3 rounded-3"
          >
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="success" className="me-2 px-3 py-2">
                  AIE & Mormo
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
                    {concluindoAtual ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <BsCheckCircle />
                    )}
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
                <h6 className="text-success mb-1">
                  <BsClipboardCheck className="me-1" />Detalhes do Exame
                </h6>
                <p className="mb-1 text-muted">
                  <strong>Data do exame:</strong> {formatarData(item.data_exame)}
                </p>
                <p className="mb-1 text-muted">
                  <strong>Validade (dias):</strong> {item.validade || "-"}
                </p>
                <p className="mb-0 text-muted">
                  <strong>Resultado:</strong> {item.resultado || "-"}
                </p>
              </div>

              <hr />

              {(item.descricao || "").trim().length > 0 && (
                <div className="border-4 border-success ps-3 mb-3">
                  <strong className="text-success">Descricao</strong>
                  <p className="mb-0 text-muted">{item.descricao}</p>
                </div>
              )}
            </Card.Body>

            <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
              <div className="border-4 border-warning ps-3 mb-3 w-100">
                <Row>
                  <Col xl={8}>
                    <small className="text-muted">
                      <strong>Criado por:</strong> {item.usuario_nome || "-"}{" "}
                      <strong>RE:</strong> {item.usuario_registro || "-"}
                    </small>
                    <br />
                    <small className="text-muted">
                      <strong>Responsável Aplicação:</strong> {responsavelAplicacao}
                    </small>
                    <br />
                    <small className="text-muted">
                      <strong>Ultima atualizacao:</strong>{" "}
                      {item.usuario_atualizacao_nome || item.usuario_nome || "-"}{" "}
                      <strong>RE:</strong>{" "}
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
          <Modal.Title>Editar AIE & Mormo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erroEdicao && <Alert variant="danger" className="mb-2">{erroEdicao}</Alert>}
          <Form onSubmit={handleSalvarEdicao}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data do Exame</Form.Label>
              <Form.Control
                type="date"
                value={edicao.data_exame}
                onChange={(e) => setEdicao({ ...edicao, data_exame: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Validade (Dias)</Form.Label>
              <Form.Control
                type="number"
                value={edicao.validade}
                onChange={(e) => setEdicao({ ...edicao, validade: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Resultado</Form.Label>
              <Form.Select
                value={edicao.resultado}
                onChange={(e) => setEdicao({ ...edicao, resultado: e.target.value })}
              >
                <option value="">Selecione um resultado</option>
                <option value="negativo">Negativo</option>
                <option value="positivo">Positivo</option>
                <option value="suspeito">Suspeito</option>
                <option value="indeterminado">Indeterminado</option>
              </Form.Select>
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
              <Form.Label className="fw-bold">Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={500}
                value={edicao.descricao}
                onChange={(e) => setEdicao({ ...edicao, descricao: e.target.value })}
              />
              <small className="text-muted">{edicao.descricao.length}/500 caracteres</small>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharEdicao} disabled={salvandoEdicao}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvarEdicao} disabled={salvandoEdicao}>
            {salvandoEdicao ? <>Salvando...</> : <>💾 Salvar</>}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalExclusaoRegistro} onHide={handleFecharExclusaoRegistro} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir AIE & Mormo</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleExcluirRegistro}>
          <Modal.Body>
            {erroExclusaoRegistro && <Alert variant="danger" className="mb-2">{erroExclusaoRegistro}</Alert>}
            <p>Tem certeza que deseja excluir este registro?</p>
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
              {excluindoRegistro ? <>Excluindo...</> : <>🗑️ Excluir</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoricoProntuarioAieMormo;
