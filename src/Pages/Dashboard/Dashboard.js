import { Container, Row, Col, Nav } from "react-bootstrap";
import { Link, } from "react-router-dom";
import "./styles.css";
import Estatisticas from "./Estatisticas";

const DashboardLayout = () => {
  return (
    <Container fluid className="p-0 dashboard-wrapper">
      <Row className="g-0">

        {/* SIDEBAR */}
        <Col md={2} className="sidebar-dashboard p-0">
          <div className="sidebar-header text-center py-4">
            <h5 className="text-gold fw-bold m-0">GERENCIAMENTO</h5>
          </div>

          <Nav className="flex-column p-3 menu-links">
            <Link to="/dashboard" className="menu-link">Início</Link>
            <Link to="/dashboard/list" className="menu-link">Listagem</Link>
            <Link to="/dashboard/cadastro" className="menu-link">Cadastrar</Link>
            <Link to="/dashboard/estatisticas" className="menu-link">Estatísticas</Link>
            <Link to="/dashboard/adminCargaHoraria" className="menu-link">Carga Horária</Link>

          </Nav>
        </Col>

        {/* CONTEÚDO */}
        <Col md={10} className="conteudo-dashboard p-4">
          <Estatisticas />
        </Col>

      </Row>
    </Container>
  );
};

export default DashboardLayout;
