import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoRpmon from "../../Imagens/LOGORPMON.png";
import logoPMESP from "../../Imagens/Logo-PM.png";
import "./style.css";

const Header2 = () => {
  return (
    <header className="shadowHeader">
      <Container fluid>
        <Row className="align-items-center justify-content-between py-4">
          <Col xs={6} md={2} className="text-center">
            <a
              href="http://intranet.policiamilitar.sp.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={logoPMESP}
                className="img-fluid"
                alt="PMESP"
                width={70}
              />
            </a>
          </Col>
          <Col md={8} className="text-center">
            <h2 className="mb-0" style={{ color: "#FFD700", fontWeight: "bold" }}>
              Regimento de Polícia Montada “9 de Julho”
            </h2>
            <small className="text-secondary d-block">
              Polícia Militar do Estado de São Paulo
            </small>
          </Col>
          <Col xs={6} md={2} className="text-center">
            <Link to="/" target="_blank" rel="noopener noreferrer">
              <img
                src={logoRpmon}
                className="img-fluid"
                alt="RPMON"
                width={70}
              />
            </Link>
          </Col>
        </Row>
      </Container>

      <Navbar expand="lg" bg="dark" variant="dark" className="shadow-none">
        <Container fluid>
          <Navbar.Toggle aria-controls="naveg" />
          <Navbar.Collapse id="naveg">
            <Nav className="mx-auto">
              <Link to="/" className="btn btn-dark mx-2">
                HOME
              </Link>
              <Link to="/comandante" className="btn btn-dark mx-2">
                COMANDANTE
              </Link>
              <Link to="/eternosComandantes" className="btn btn-dark mx-2">
                ETERNOS COMANDANTES
              </Link>
              <Link to="/nossaHistoria" className="btn btn-dark mx-2">
                NOSSA HISTÓRIA
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header2;
