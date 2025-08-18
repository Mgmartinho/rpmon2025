// src/pages/NotFound.jsx
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NotFoundImage from '../Imagens/home/LOGORPMON.png'; // caminho da imagem

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <img
            src={NotFoundImage}
            alt="Página não encontrada"
            className="img-fluid mb-4"
            height={150}
            width={150}
          />
          <h1 className="display-4">404</h1>
          <p className="lead">Ops! A página que você procura não existe.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar para a Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
