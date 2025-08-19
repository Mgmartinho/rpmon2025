import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import logoRpmon from "../../Imagens/LOGORPMON.png";
import logoPMESP from "../../Imagens/Logo-PM.png";
import "./style.css";

const Header2 = () => {
  return (
    <header className="shadowHeader" >
      <Container fluid>
        <Col md={12} className="text-center mb-n1 pt-1 d-none d-md-block">
          <div>
            <a
              href="https://facebook.com/cavalariasp"
              className="text-white mx-1"
            >
              <FaFacebook />
            </a>
            <a
              href="https://youtube.com/channel/UCYzJr50zEa_sD1u4yJ3zpvw"
              className="text-white mx-1"
            >
              <FaYoutube />
            </a>

            <a
              href="https://instagram.com/cavalariasp"
              className="text-white mx-1"
            >
              <FaInstagram />
            </a>
          </div>
        </Col>
        <Row className="align-items-center justify-content-between py-4">
          <Col sm={6} md={2} className="text-center justify-content-center m-auto">
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
          <Col md={8} sm={12} className="text-center">
            <h2
              className="mb-0"
              style={{ color: "#FFD700", fontWeight: "bold", fontSize: "45px" }}
            >
              Regimento de Polícia Montada “9 de Julho”
            </h2>
            <small className="text-secondary d-block">
              Polícia Militar do Estado de São Paulo
            </small>
          </Col>
          <Col sm={6} md={2} className="text-center justify-content-center m-auto">
            <Link to="/" rel="noopener noreferrer">
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
