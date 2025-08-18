import React, { useState } from "react";
import { Container, Row, Col, Button, Offcanvas, Form } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import rpmon from "../../Imagens/LOGORPMON.png";
import "./style.css";

const Footer = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const toggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);

  const [escala, setEscala] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (escala) {
      window.open(
        `http://sistemasadmin.policiamilitar.sp.gov.br/Escala/arrelpreesc.aspx?${escala}`
      );
    }
  };

  return (
    <footer
      className="custom-footer text-light pt-5 pb-3 mt-5 shadow-lg"
      style={{ backgroundColor: "#121212" }}
    >
      <Container>
        <Row className="text-center text-md-start">
          {/* Coluna Logo + Redes Sociais */}
          <Col md={4} className="mb-4">
            <a
              href="http://intranet.policiamilitar.sp.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={rpmon}
                height="120"
                alt="200 anos PM"
                className="mb-3"
              />
            </a>
            <div className="d-flex justify-content-center justify-content-md-start gap-3 fs-4 social-links text-white">
              <a
                href="https://facebook.com/cavalariasp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </a>
              <a
                href="https://instagram.com/cavalariasp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://youtube.com/channel/UCYzJr50zEa_sD1u4yJ3zpvw"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube />
              </a>
            </div>
          </Col>

          {/* Coluna Acesso Rápido (Offcanvas) */}
          {/* Coluna Acesso Rápido (Offcanvas) */}
          {/* Coluna Acesso Rápido (Offcanvas) */}
          <Col md={4} className="mb-4 text-center">
            <h5 className="text-warning mb-3">Downloads</h5>
            <Button
              variant="outline-warning"
              size="lg"
              className="mb-2"
              onClick={toggleOffcanvas}
            >
              Abrir Músicas
            </Button>

            <Offcanvas
              show={showOffcanvas}
              onHide={toggleOffcanvas}
              placement="bottom"
              className="bg-dark text-light"
            >
              <Offcanvas.Header closeButton closeVariant="white">
                <Offcanvas.Title>Lista de Músicas</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <div className="d-flex flex-column align-items-center gap-2">
                  <a
                    href="/musicas/musica1.mp3"
                    download
                    className="text-light link-hover"
                  >
                    Música 1
                  </a>
                  <a
                    href="/musicas/musica2.mp3"
                    download
                    className="text-light link-hover"
                  >
                    Música 2
                  </a>
                  <a
                    href="/musicas/musica3.mp3"
                    download
                    className="text-light link-hover"
                  >
                    Música 3
                  </a>
                  <a
                    href="/musicas/musica4.mp3"
                    download
                    className="text-light link-hover"
                  >
                    Música 4
                  </a>
                  <a
                    href="/musicas/musica5.mp3"
                    download
                    className="text-light link-hover"
                  >
                    Música 5
                  </a>
                  <a
                    href="/musicas/musica6.mp3"
                    download
                    className="text-light link-hover"
                  >
                    Música 6
                  </a>
                  <a
                    href="/musicas/musica7.mp3"
                    download
                    className="text-light link-hover"
                  >
                    Música 7
                  </a>
                  <a
                    href="/musicas/musica8.mp3"
                    download
                    className="text-light link-hover"
                  >
                    Música 8
                  </a>
                </div>
              </Offcanvas.Body>
            </Offcanvas>
          </Col>

          {/* Coluna Pesquisa Escala */}
          <Col md={4} className="mb-4">
            <h5 className="text-warning mb-3 text-center">Pesquisar Escala</h5>
            <Form
              onSubmit={handleSearch}
              className="d-flex flex-column align-items-center"
            >
              <Form.Group className="w-100" style={{ maxWidth: "300px" }}>
                <Form.Control
                  type="text"
                  placeholder="Digite o ID Delegada ou Dejem"
                  className="text-center"
                  value={escala}
                  onChange={(e) => setEscala(e.target.value)}
                />
              </Form.Group>
              <Button
                type="submit"
                variant="outline-light"
                size="sm"
                className="mt-2"
              >
                Pesquisar
              </Button>
            </Form>
          </Col>
        </Row>

        <hr className="border-secondary" />

        <div className="text-center small">
          <p className="mb-1">Regimento de Polícia Montada "9 de Julho"</p>
          <p className="mb-1">
            Rua Dr. Jorge Miranda, 238, Luz - CEP: 01106-000 - Tel: (11)
            3315-0003
          </p>
          <p className="mb-1">Email: rpmon@policiamilitar.sp.gov.br</p>
          <p className="mb-0">&copy; {new Date().getFullYear()} RPMON </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
