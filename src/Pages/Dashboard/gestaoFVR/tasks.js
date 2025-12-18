import {
  Card,
  Row,
  Col,
  Container,
  Button,
  Form,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import { FaPlay, FaStop, FaPaperclip } from "react-icons/fa";

export default function TaskCreatePage() {
  return (
    <Container fluid className="py-4">

      {/* TÍTULO */}
      <Row className="mb-4">
        <Col>
          <h5 className="fw-semibold">Task Details</h5>
          <small className="text-muted">
            Criação e acompanhamento de tarefas veterinárias
          </small>
        </Col>
      </Row>

      <Row className="g-4">

        {/* COLUNA ESQUERDA */}
        <Col xl={4} lg={5}>

          {/* TIME TRACKING */}
          <Card className="shadow-sm mb-3">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-3">Time Tracking</h6>

              <ProgressBar now={60} className="mb-3" />

              <h5 className="mb-0">0 hrs 0 min</h5>
              <small className="text-muted">New Task</small>

              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button size="sm" variant="success">
                  <FaPlay className="me-1" /> Start
                </Button>
                <Button size="sm" variant="danger">
                  <FaStop className="me-1" /> Stop
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* META */}
          <Card className="shadow-sm">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select size="sm">
                  <option>New</option>
                  <option>In Progress</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select size="sm">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control size="sm" type="date" />
              </Form.Group>

              <Form.Group>
                <Form.Label>Assigned To</Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="Veterinário responsável"
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUNA DIREITA */}
        <Col xl={8} lg={7}>

          {/* RESUMO */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Task Title</Form.Label>
                <Form.Control placeholder="Ex: Avaliação clínica do solípede" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Summary</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Descrição da tarefa..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Subtasks</Form.Label>
                <Form.Check label="Avaliação inicial" />
                <Form.Check label="Registro fotográfico" />
                <Form.Check label="Atualizar prontuário" />
              </Form.Group>

              <div className="d-flex gap-2 flex-wrap">
                <Badge bg="secondary">Veterinária</Badge>
                <Badge bg="info">Solípede</Badge>
                <Badge bg="primary">Urgente</Badge>
              </div>
            </Card.Body>
          </Card>

          {/* ANEXOS */}
          <Card className="shadow-sm mb-3">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Attachments</h6>
              <Button size="sm" variant="outline-primary">
                <FaPaperclip className="me-1" /> Add File
              </Button>
            </Card.Body>
          </Card>

          {/* COMENTÁRIOS */}
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Comments</h6>

              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Leave a comment..."
              />

              <div className="text-end mt-3">
                <Button size="sm" variant="success">
                  Post Comment
                </Button>
              </div>
            </Card.Body>
          </Card>

        </Col>
      </Row>
    </Container>
  );
}
