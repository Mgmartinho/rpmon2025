import React, { useState } from 'react';
import { Container, Row, Col, Button, Offcanvas, Form } from 'react-bootstrap';
import logoPMESP200Anos from "../../Imagens/200anospm.bmp"


const Footer = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const toggleOffcanvas = () => setShowOffcanvas(!showOffcanvas);

  const [escala, setEscala] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (escala) {
      window.open(`http://sistemasadmin.intranet.policiamilitar.sp.gov.br/Escala/arrelpreesc.aspx?${escala}`);
    }
  };

  return (
  <footer className="bg-black pt-5 pb-2 text-center text-white">
    <Container className="d-flex flex-column align-items-center">
      
      <div className="pb-0">
        <a href="http://intranet.policiamilitar.sp.gov.br/" target="_blank" rel="noopener noreferrer">
          <img src={logoPMESP200Anos} height="200" width="350" alt="200 anos PM" />
        </a>
      </div>

      <div className="mb-4">
        <Button variant="dark" onClick={toggleOffcanvas}>
          Acesso Rápido
        </Button>

        <Offcanvas show={showOffcanvas} onHide={toggleOffcanvas} placement="bottom">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>LINKS UTILITÁRIOS...</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column align-items-center gap-2">
            <a href="http://intranet.policiamilitar.sp.gov.br" target="_blank" rel="noopener noreferrer">Intranet</a>
            <a href="https://www.ciaf.policiamilitar.sp.gov.br/folhadepagamento/autenticacaosegura.aspx" target="_blank" rel="noopener noreferrer">Holerite Eletrônico</a>
            <a href="http://www6.intranet.policiamilitar.sp.gov.br/unidades/3empm/" target="_blank" rel="noopener noreferrer">3 EM/PM</a>
            <a href="http://www.intranet2.dp.policiamilitar.sp.gov.br/boletim-geral/" target="_blank" rel="noopener noreferrer">Boletim Geral</a>
            <a href="http://www.intranet.ccb.policiamilitar.sp.gov.br/aplicacoes/sisbol/frmlogin_cpd/" target="_blank" rel="noopener noreferrer">SISBOL</a>
          </Offcanvas.Body>
        </Offcanvas>
      </div>

      <div className="mb-4 w-100" style={{ maxWidth: '400px' }}>
        <Form onSubmit={handleSearch}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Digite o ID Delegada ou Dejem"
              className="text-center"
              value={escala}
              onChange={(e) => setEscala(e.target.value)}
            />
          </Form.Group>
          <Button type="submit" variant="dark" className="mt-2">
            Pesquisar
          </Button>
        </Form>
      </div>

      <hr className="bg-light w-100" />

      <div className="text-white text-center">
        <p className="mb-1">Regimento de Polícia Montada "9 de Julho"</p>
        <p className="mb-1">Rua Dr. Jorge Miranda, 238, Luz - CEP: 01106-000 - Telefone: (11) 3315-0003</p>
        <p className="mb-1">Email: rpmon@policiamilitar.sp.gov.br</p>
        <p>Todos os direitos reservados</p>
      </div>
    </Container>
  </footer>
);

};

export default Footer;
