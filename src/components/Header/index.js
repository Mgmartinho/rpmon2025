import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
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
            <Nav className="ms-auto">
              <Nav.Link href="index.html" className="btn btn-dark">
                HOME
              </Nav.Link>
              <Nav.Link href="comandante.html" className="btn btn-dark">
                COMANDANTE
              </Nav.Link>
              <Nav.Link
                href="eternos-comandantes.html"
                className="btn btn-dark"
              >
                ETERNOS COMANDANTES
              </Nav.Link>
              <Nav.Link href="nossa-historia.html" className="btn btn-dark">
                NOSSA HISTÓRIA
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="pt-1 mb-n4 text-center">
        <a
          href="https://pt-br.facebook.com/cavalariasp/"
          target="_blank"
          rel="noopener noreferrer"
          className="me-3 text-white"
          style={{ fontSize: "2rem" }}
        >
          <FaFacebook />
        </a>

        <a
          href="https://www.instagram.com/cavalariasp/"
          target="_blank"
          rel="noopener noreferrer"
          className="me-3 text-white"
          style={{ fontSize: "2rem" }}
        >
          <FaInstagram />
        </a>

        <a
          href="https://www.youtube.com/channel/UCYzJr50zEa_sD1u4yJ3zpvw" // Exemplo, troque pelo canal correto
          target="_blank"
          rel="noopener noreferrer"
          className="text-white"
          style={{ fontSize: "2rem" }}
        >
          <FaYoutube />
        </a>
      </div>
    </header>
  );
};

export default Header;
