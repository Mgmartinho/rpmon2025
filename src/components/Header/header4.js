import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoRpmon from "../../Imagens/LOGORPMON.png";
import logoPMESP from "../../Imagens/Logo-PM.png";
const Header4 = () => {
  return (
   <header className="bg-dark text-white py-4">
  <Container fluid>
    <Row className="align-items-center text-center">
      <Col xs={6} md={2}>
        <img src={logoPMESP} alt="PMESP" width={60} />
      </Col>
      <Col md={8}>
        <h4 className="mb-1" style={{ color: "#f5c518" }}>
          Regimento de Polícia Montada “9 de Julho”
        </h4>
        <small className="text-light">
          Polícia Militar do Estado de São Paulo
        </small>
      </Col>
      <Col xs={6} md={2}>
        <img src={logoRpmon} alt="RPMON" width={60} />
      </Col>
    </Row>
  </Container>

  <Navbar expand="lg" bg="black" variant="dark" className="mt-3">
    <Container>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mx-auto">
          <Link to="/" className="nav-link text-white mx-2">
            HOME
          </Link>
          <Link to="/comandante" className="nav-link text-white mx-2">
            COMANDANTE
          </Link>
          <Link to="/eternosComandantes" className="nav-link text-white mx-2">
            ETERNOS COMANDANTES
          </Link>
          <Link to="/nossaHistoria" className="nav-link text-white mx-2">
            NOSSA HISTÓRIA
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>

  <div className="text-center mt-3">
    <a
      href="https://pt-br.facebook.com/cavalariasp/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white mx-2"
    >
      <FaFacebook size={24} />
    </a>
    <a
      href="https://www.youtube.com/channel/UCYzJr50zEa_sD1u4yJ3zpvw"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white mx-2"
    >
      <FaYoutube size={24} />
    </a>
    <a
      href="https://www.instagram.com/cavalariasp/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-white mx-2"
    >
      <FaInstagram size={24} />
    </a>
  </div>
</header>


  );
};

export default Header4;
