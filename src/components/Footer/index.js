
import React, { useState } from "react";
import { Container, Row, Col, Button, Offcanvas, Form } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import rpmon from "../../Imagens/LOGORPMON.png";
import "./style.css";
import { FaMusic, FaFilePdf } from "react-icons/fa";

const Footer = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const toggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);

  const [escala, setEscala] = useState("");

 const handleSearch = (e) => {
    e.preventDefault();
    if (escala) {
      window.open(`http://sistemasadmin.intranet.policiamilitar.sp.gov.br/Escala/arrelpreesc.aspx?${escala}`);
    }
  };

  return (
    <footer
      className="custom-footer text-light pt-5 pb-3 mt-5 shadow-lg"
      style={{ backgroundColor: "#121212" }}
    >
      <Container>
        <Row className="text-center justify-content-center align-items-center text-md-start">
          {/* Coluna Logo + Redes Sociais */}
          <Col md={3} className="mb-4 text-center">
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

            <div className="d-flex justify-content-center gap-4 fs-4 text-white text-center">
              {/* Facebook */}
              <div className="d-flex flex-column align-items-center">
                <a
                  href="https://facebook.com/cavalariasp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook />
                </a>
                <small className="mt-1  text-warning" style={{ fontSize: 17 }}>
                  27k+
                </small>
              </div>

              {/* Instagram */}
              <div className="d-flex flex-column align-items-center">
                <a
                  href="https://instagram.com/cavalariasp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram />
                </a>
                <small className="mt-1  text-warning" style={{ fontSize: 17 }}>
                  37k+
                </small>
              </div>

              {/* YouTube */}
              <div className="d-flex flex-column align-items-center">
                <a
                  href="https://youtube.com/channel/UCYzJr50zEa_sD1u4yJ3zpvw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaYoutube />
                </a>
                <small className="mt-1 text-warning" style={{ fontSize: 17 }}>
                  28k+
                </small>
              </div>
            </div>
          </Col>

          <Col md={3} className="mb-4 text-center">
            <h5 className="text-warning mb-3">Links Úteis</h5>

            <ul className="list-unstyled">
              <li>
                <a
                  href="https://www.sp.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warning text-decoration-none"
                >
                  Governo de SP
                </a>
              </li>
              <li>
                <a
                  href="https://www.pm.sp.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warning text-decoration-none"
                >
                  Polícia Militar SP
                </a>
              </li>
              <li>
                <a
                  href="https://www.al.sp.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warning text-decoration-none"
                >
                  Assembleia Legislativa
                </a>
              </li>
              <li>
                <a
                  href="https://www.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warning text-decoration-none"
                >
                  Portal Gov.br
                </a>
              </li>
              {/* <li>
                <a
                  href="https://rpmon.intranet.policiamilitar.sp.gov.br/dashboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warning text-decoration-none"
                >
                  Portal Veterinário RPMon
                </a>
              </li> */}
            </ul>
          </Col>

          {/* Coluna Acesso Rápido (Offcanvas) */}
          {/* Coluna Acesso Rápido (Offcanvas) */}
          {/* Coluna Acesso Rápido (Offcanvas) */}
          <Col md={3} className="mb-4 text-center">
            <h5 className="text-warning mb-3">Downloads</h5>
            <Button
              variant="outline-warning"
              size="lg"
              className="mb-2"
              onClick={toggleOffcanvas}
            >
              Canções e Hinos
            </Button>

            <Offcanvas
              show={showOffcanvas}
              onHide={toggleOffcanvas}
              placement="bottom"
              className="bg-dark text-light"
            >
              <Offcanvas.Header closeButton closeVariant="white">
                <Offcanvas.Title className="text-center align-items-center justify-content-center">
                  Lista de Músicas
                </Offcanvas.Title>
              </Offcanvas.Header>

              <Offcanvas.Body>
                <div className="row text-center">
                  {[
                    {
                      nome: "Canção Eterno Regimento Instrumental",
                      mp3: "/Hinos/Eterno Regimento - Instrumental.mp3",
                      pdf: "/LetraHinos/Eterno Regimento.pdf",
                    },
                    {
                      nome: "Canção Eterno Regimento Vocal",
                      mp3: "/Hinos/Eterno Regimento - Vocal.mp3",
                      pdf: "/LetraHinos/Eterno Regimento.pdf",
                    },
                    {
                      nome: "Canção Da Cavalaria",
                      mp3: "/Hinos/Canção da Cavalaria.mp3",
                      pdf: "/LetraHinos/cancao da cavalaria.pdf",
                    },
                    {
                      nome: "Hino Nacional Brasileiro",
                      mp3: "/Hinos/Hino Nacional Brasileiro - Vocal.mp3",
                      pdf: "/LetraHinos/Hino Nacional Brasileiro.pdf",
                    },
                    {
                      nome: "Incorporação da Bandeira",
                      mp3: "/Hinos/Música da Incorporação da Bandeira.mp3",
                    },
                    {
                      nome: "Paris Belfort (9 de Julho)",
                      mp3: "/Hinos/Paris Belfort (9 de Julho) - Vocal.mp3",
                      pdf: "/LetraHinos/9 de julho - paris belfort.pdf",
                    },
                    {
                      nome: "Canção da Policia Militar",
                      mp3: "/Hinos/Canção da Polícia Militar - Vocal.mp3",
                      pdf: "/LetraHinos/cancao da pm.pdf",
                    },
                    {
                      nome: "Canção Escola Superior de Soldados",
                      mp3: "/Hinos/cancao_essd.mp3",
                      pdf: "/LetraHinos/escola superior de soldados.pdf",
                    },
                    {
                      nome: "Canção Soldados, a Cavalaria",
                      mp3: "/Hinos/cancao_essd.mp3",
                      pdf: "/LetraHinos/Soldados a cavalaria.pdf",
                    },
                    {
                      nome: "Canção do Patrulheiro",
                      mp3: "/Hinos/Canção do Patrulheiro - Vocal.mp3",
                      pdf: "/LetraHinos/cancao do patrulheiro.pdf",
                    },
                  ].map((musica, i) => (
                    <div key={i} className="col-md-3 col-sm-6 mb-3 p-2 ">
                      <div className="d-flex flex-column align-items-center">
                        <span className="mb-2">{musica.nome}</span>
                        <div className="d-flex gap-3">
                          <a href={musica.mp3} download className="text-light">
                            <FaMusic size={22} />
                          </a>
                          <a href={musica.pdf} download className="text-danger">
                            <FaFilePdf size={22} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Offcanvas.Body>
            </Offcanvas>
          </Col>

          {/* Coluna Pesquisa Escala */}
          <Col md={3} className="mb-4">
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
