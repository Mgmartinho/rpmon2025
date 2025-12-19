import { Card, Row, Col, Button, Badge, Form } from "react-bootstrap";
import { BsPlusCircle, BsClockHistory } from "react-icons/bs";

export default function ProntuarioSolipede() {
  return (
    <div className="container-fluid mt-4">
      {/* ===== CABEÇALHO ===== */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="mb-0 fw-semibold">
            Prontuário do Solípede
          </h4>
          <small className="text-muted">
            Histórico clínico, informações gerais e evolução veterinária
          </small>
        </Col>

        <Col className="text-end">
          <Button size="sm" variant="outline-secondary">
            <BsPlusCircle className="me-1" />
            Salvar Registro
          </Button>
        </Col>
      </Row>

      <Row>
        {/* =========================
            COLUNA ESQUERDA – INFO
        ========================= */}
        <Col md={4}>
          {/* Dados principais */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <h6 className="mb-3 fw-semibold">Dados do Solípede</h6>

              <p className="mb-1">
                <strong>Nº:</strong> 123
              </p>
              <p className="mb-1">
                <strong>Nome:</strong> Tornado
              </p>
              <p className="mb-1">
                <strong>Raça:</strong> Mangalarga
              </p>
              <p className="mb-1">
                <strong>Sexo:</strong> Macho
              </p>
              <p className="mb-1">
                <strong>Idade:</strong> 8 anos
              </p>
              <p className="mb-1">
                <strong>Unidade:</strong> RPMon
              </p>

              <div className="mt-2">
                <Badge pill bg="success">
                  Ativo
                </Badge>
              </div>
            </Card.Body>
          </Card>

          {/* Evolução geral */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <h6 className="mb-2 fw-semibold">
                Evolução Clínica Geral
              </h6>

              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Descreva a evolução clínica geral..."
              />
            </Card.Body>
          </Card>

          {/* Restrições */}
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="mb-2 fw-semibold">
                Restrições / Recomendações
              </h6>

              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Informe restrições de serviço..."
              />
            </Card.Body>
          </Card>
        </Col>

        {/* =========================
            COLUNA DIREITA – HISTÓRICO
        ========================= */}
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h6 className="mb-3 fw-semibold">
                <BsClockHistory className="me-1" />
                Histórico de Atendimentos
              </h6>

              {/* Registro */}
              <Card className="mb-3 border-start border-4 border-secondary">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <Badge bg="secondary" className="mb-2">
                        Consulta
                      </Badge>

                      <p className="mb-1">
                        <strong>Diagnóstico:</strong> Claudicação leve em membro anterior direito.
                      </p>
                      <p className="mb-1">
                        <strong>Tratamento:</strong> Repouso + anti-inflamatório.
                      </p>
                      <p className="mb-0">
                        <strong>Observações:</strong> Reavaliar em 7 dias.
                      </p>
                    </Col>

                    <Col md={4} className="text-end">
                      <small className="text-muted">10/12/2025</small>
                      <br />
                      <small className="text-muted">
                        Vet: Cap PM Alexandre
                      </small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <p className="text-muted text-center mb-0">
                Nenhum outro registro clínico no momento
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
