import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoRpmon from "../../Imagens/LOGORPMON.png";
const Header3 = () => {
  return (
  <header className="bg-dark text-white shadow">
  <Container fluid className="py-3">
    <Row className="align-items-center">
      <Col md={1}>
        <img src={logoRpmon} alt="Logo" width={50} />
      </Col>
      <Col md={10} className="text-center">
        <h2 className="mb-0" style={{ color: "#FFD700" }}>Regimento de Polícia Montada</h2>
        <span className="text-muted">"9 de Julho" - PMESP</span>
      </Col>
      <Col md={1} className="text-end d-none d-md-block">
        <div>
          <a href="https://facebook.com/cavalariasp" className="text-white mx-1"><FaFacebook /></a>
          <a href="https://instagram.com/cavalariasp" className="text-white mx-1"><FaInstagram /></a>
          <a href="https://youtube.com/channel/UCYzJr50zEa_sD1u4yJ3zpvw" className="text-white mx-1"><FaYoutube /></a>
        </div>
      </Col>
    </Row>
  </Container>

  <Navbar bg="black" variant="dark" expand="lg" sticky="top" className="shadow-sm">
    <Container>
      <Navbar.Toggle aria-controls="menuNav" />
      <Navbar.Collapse id="menuNav">
        <Nav className="mx-auto">
          <Link to="/" className="nav-link text-light">Home</Link>
          <Link to="/comandante" className="nav-link text-light">Comandante</Link>
          <Link to="/eternosComandantes" className="nav-link text-light">Eternos Comandantes</Link>
          <Link to="/nossaHistoria" className="nav-link text-light">Nossa História</Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
</header>
  );
};

export default Header3;
