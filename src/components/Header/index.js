import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoRpmon from "../../Imagens/LOGORPMON.png";
import logoPMESP from "../../Imagens/Logo-PM.png";
const Header = () => {
  return (
    <header className="bg-black pb-5">
      <Container>
        <Row className="align-items-center">
          <Col md={3} className="text-center mb-3 mb-md-0">
            <a
              href="http://intranet.policiamilitar.sp.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={logoPMESP}
                className="img-fluid"
                alt="LOGO PMESP PRETO"
              />
            </a>
          </Col>
          <Col md={6} className="text-center mt-5 pt-5">
            <h1
              className="text-uppercase"
              style={{
                color: "chocolate",
                fontFamily:
                  'Cambria, Cochin, Georgia, Times, "Times New Roman", serif',
              }}
            >
              Regimento de Polícia Montada "9 de Julho"
            </h1>
          </Col>
          <Col md={3} className="text-center">
            <a href="/">
              <img src={logoRpmon} className="img-fluid" alt="LOGO RPMON" />
            </a>
          </Col>
        </Row>
      </Container>

      <Navbar expand="lg" bg="dark" variant="dark" className="mt-3">
        <Container fluid>
          <Navbar.Brand href="#"></Navbar.Brand>
          <Navbar.Toggle aria-controls="naveg" />
          <Navbar.Collapse id="naveg">
            <Nav className="mx-auto" >
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

      <div className="pt-1 pb-n5 text-center" style={{ marginBottom: "-30px" }}>
        <a
          href="https://pt-br.facebook.com/cavalariasp/"
          target="_blank"
          rel="noopener noreferrer"
          className="me-3 text-white"
          style={{ fontSize: "3em" }}
        >
          <FaFacebook />
        </a>

        <a
          href="https://www.youtube.com/channel/UCYzJr50zEa_sD1u4yJ3zpvw" // Exemplo, troque pelo canal correto
          target="_blank"
          rel="noopener noreferrer"
          className="text-white me-3"
          style={{ fontSize: "3em" }}
        >
          <FaYoutube />
        </a>

        <a
          href="https://www.instagram.com/cavalariasp/"
          target="_blank"
          rel="noopener noreferrer"
          className="me-3 text-white"
          style={{ fontSize: "3em" }}
        >
          <FaInstagram />
        </a>
      </div>
    </header>
  );
};

export default Header;
