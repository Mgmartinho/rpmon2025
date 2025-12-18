import { Card, Row, Col, Button, Badge, Form } from "react-bootstrap";
import { BsPlusCircle, BsClockHistory } from "react-icons/bs";

export default function ProntuarioSolipede() {
  return (
    <div className="container-fluid mt-4">
      {/* Cabeçalho */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="mb-0">📘 Prontuário do Solípede</h4>
          <small className="text-muted">
            Histórico clínico, informações gerais e evolução veterinária
          </small>
        </Col>
        <Col className="text-end">
          <Button variant="success">
            <BsPlusCircle className="me-1" /> Novo Registro
          </Button>
        </Col>
      </Row>

      {/* Dados do Solípede */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={3}><strong>Nº:</strong> 123</Col>
            <Col md={3}><strong>Nome:</strong> Tornado</Col>
            <Col md={3}><strong>Raça:</strong> Mangalarga</Col>
            <Col md={3}>
              <strong>Status:</strong> <Badge bg="success">Ativo</Badge>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md={3}><strong>Sexo:</strong> Macho</Col>
            <Col md={3}><strong>Idade:</strong> 8 anos</Col>
            <Col md={6}><strong>Unidade:</strong> RPMon</Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Evolução / Observações Gerais */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h6 className="mb-3">📝 Evolução Clínica Geral</h6>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Descreva a evolução clínica geral do solípede..."
          />
        </Card.Body>
      </Card>

      {/* Histórico Clínico */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h6 className="mb-3">
            <BsClockHistory className="me-1" /> Histórico de Atendimentos
          </h6>

          {/* Registro exemplo */}
          <Card className="mb-3 border-start border-4 border-primary">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Badge bg="primary" className="mb-2">Consulta</Badge>
                  <p className="mb-1"><strong>Diagnóstico:</strong> Claudicação leve em membro anterior direito.</p>
                  <p className="mb-1"><strong>Tratamento:</strong> Repouso + anti-inflamatório.</p>
                  <p className="mb-0"><strong>Observações:</strong> Reavaliar em 7 dias.</p>
                </Col>
                <Col md={4} className="text-end">
                  <small className="text-muted">10/12/2025</small>
                  <br />
                  <small className="text-muted">Vet: Cap Vet Silva</small>
                </Col>
                <hr />
              </Row>
            </Card.Body>
          </Card>

          {/* Placeholder */}
          <p className="text-muted text-center mb-0">
            Nenhum outro registro clínico no momento
          </p>
        </Card.Body>
      </Card>

      {/* Restrições e Recomendações */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h6 className="mb-3">⚠️ Restrições / Recomendações</h6>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Informe restrições de serviço ou recomendações especiais..."
          />
        </Card.Body>
      </Card>
    </div>
  );
}
