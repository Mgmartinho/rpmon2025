import {
  Row,
  Col,
  Card,
  Button,
  Badge,
} from "react-bootstrap";
import {
  BsCheckCircle,
  BsPencilSquare,
  BsClipboardCheck,
  BsTrash,
} from "react-icons/bs";

const HistoricoProntuarioTratamento = ({ registros = [] }) => {

  const dados = Array.isArray(registros) ? registros : [];

  return (

    <div>

      {dados.map((item) => {

        return (
          <Card
            key={item.id}
            className="shadow-sm border-start border-danger border-0 mb-3 rounded-3"
          >

            {/* HEADER CLEAN */}
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <Row>
              <div className="">
                <Badge bg="danger" className="me-2 px-3 py-2">
                  {item.tipo || "Restrições"}
                </Badge>
                <small className="text-muted m-2">
                  {new Date(item.data_criacao).toLocaleDateString("pt-BR")}
                </small>

                {item.status_conclusao === "concluido" ? (
                  <Badge bg="success-subtle" text="success" className="px-3 py-2">
                    Concluído
                  </Badge>
                ) : (
                  <Badge bg="warning-subtle" text="warning" className="px-3 py-2">
                    Em andamento
                  </Badge>
                )}

              </div>
                {/* CAMPO DE MENUS */}
              <div className="d-flex gap-2">
                {item.status_conclusao !== "concluido" && (
                  <Button
                    size="sm"
                    variant="light"
                    // onClick={() => handleAbrirModalConclusaoRegistro(item.id)}
                    title="Concluir registro"
                  >
                    <BsCheckCircle />
                  </Button>
                )}
                <Button size="sm" variant="light"
                // onClick={() => handleAbrirEdicaoRestricao(item)}
                >
                  <BsPencilSquare />
                </Button>
                <Button size="sm" variant="light">
                  <BsTrash />
                </Button>

              </div>
            </Row>  
            <Row>
              
               
                {item.precisa_baixar !== "sim" && (
                  <Badge bg="success-subtle" text="danger" className="px-3 py-2">
                    Tratamento Baixou o Solipede
                  </Badge>
                )}

            </Row>
            </Card.Header>

            {/* BODY MAIS ORGANIZADO */}
            <Card.Body>

              {/* Diagnóstico */}
              <div className="mb-3">
                <h6 className="text-danger mb-1">
                  <BsClipboardCheck className="me-1" />
                  Restrição
                </h6>
                <p className="mb-0 text-muted">
                  {item.diagnostico || "-"}
                </p>
              </div>

              <hr />

              <div className=" border-4 border-danger ps-3 mb-3">
                <strong className="text-danger">Recomendações</strong>
                <p className="mb-0 text-muted">
                  {item.observacao_clinica || "-"}
                </p>
              </div>
            
            </Card.Body>

            <Card.Footer className="bg-white border-0 d-flex justify-content-between align-items-center">
              <div className=" border-4 border-warning ps-3 mb-3">
                <Row>
                  <Col xl={8}>
                    <small className="text-muted">
                      <strong>Criado por:</strong> {item.usuario_nome} <strong>RE:</strong> {item.usuario_registro}

                    </small>
                  </Col>
                  <Col xl={2}>
                    <p className="mb-0 text-muted">
                      {new Date(item.data_criacao).toLocaleDateString("pt-BR")}
                    </p>
                  </Col>
                  <Col xl={2}>
                    <p className="mb-0 text-muted">
                      {new Date(item.data_validade).toLocaleDateString("pt-BR")}
                    </p>
                  </Col>
                </Row>
              </div>
              </Card.Footer>
          </Card>
        )
      })}


      {/* Modal de Conclusão de Registro */}
      {/* <Modal show={"showModalConclusaoRegistro"} onHide={"handleFecharModalConclusaoRegistro"} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔒 Confirmar Conclusão de Registro</Modal.Title>
        </Modal.Header>
        <Form onSubmit={"handleConcluirRegistro"}>
          <Modal.Body>
            {"usuarioLogado" && (
              <Alert variant="info" className="mb-3">
                <strong>👤 Usuário:</strong> {usuarioLogado.nome}<br />
                <strong>📧 Email:</strong> {usuarioLogado.email}<br />
                {usuarioLogado.registro && <><strong>🆔 Registro:</strong> {usuarioLogado.registro}</>}
              </Alert>
            )}

            <p className="text-muted mb-3">
              Para confirmar a conclusão deste registro, digite sua senha:
            </p>

            {erroConclusaoRegistro && (
              <Alert variant="danger" className="py-2">
                {erroConclusaoRegistro}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>🔑 Senha:</Form.Label>
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
                  Confirmar Conclusão
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Edição de Restrição */}
      {/* <Modal show={"showModalEdicaoRestricao"} onHide={"handleFecharEdicaoRestricao"} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Editar Restrição</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {registroEditando && (
            <>
              <Alert variant="info" className="mb-3">
                <strong>Tipo:</strong> {registroEditando?.tipo || "Restrições"}
                <br />
                <strong>Criado em:</strong> {registroEditando?.data_criacao ? new Date(registroEditando.data_criacao).toLocaleString('pt-BR') : "-"}
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Restrição *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={restricaoEdicao.restricao}
                  maxLength={1000}
                  onChange={(e) => setRestricaoEdicao({ ...restricaoEdicao, restricao: e.target.value })}
                  style={{ resize: "vertical" }}
                  placeholder="Descreva a restrição..."
                />
                <small className="text-muted">
                  {restricaoEdicao.restricao.length}/1000 caracteres
                </small>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Data de Validade (Opcional)</Form.Label>
                <Form.Control
                  type="date"
                  value={restricaoEdicao.data_validade}
                  onChange={(e) => setRestricaoEdicao({ ...restricaoEdicao, data_validade: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Recomendações (Opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={restricaoEdicao.recomendacoes}
                  onChange={(e) => setRestricaoEdicao({ ...restricaoEdicao, recomendacoes: e.target.value })}
                  style={{ resize: "vertical" }}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharEdicaoRestricao}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvarEdicaoRestricao}>
            💾 Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal> */}
    </div>



  );
}

export default HistoricoProntuarioTratamento;