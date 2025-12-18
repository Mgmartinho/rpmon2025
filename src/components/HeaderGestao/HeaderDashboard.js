import { NavLink,Link } from "react-router-dom";
import { useState } from "react";

import {
  Navbar,
  Container,
  Nav,
  OverlayTrigger,
  Tooltip,
  Modal,
  Form,
  Button,
} from "react-bootstrap";

import {
  BsHouse,
  BsListCheck,
  BsBarChart,
  BsClockHistory,
  BsClipboardPlus,
  BsBoxArrowRight,
  BsBoxArrowInRight,
  BsPersonCircle,
  BsPerson,
} from "react-icons/bs";

import { GiHorseHead } from "react-icons/gi";

import "./styles.css";

const HeaderDashboard = () => {
  const [login, setLogin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [credenciais, setCredenciais] = useState({
    re: "",
    senha: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciais((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    console.log("Login:", credenciais);

    // LOGIN SIMULADO
    setLogin(true);
    setShowLogin(false);
  };

  return (
    <>
      {/* NAVBAR */}
      <Navbar bg="dark" variant="dark" className="dashboard-header">
        <Container fluid className="d-flex align-items-center">

          {/* ESQUERDA */}
          <div className="dashboard-left d-flex align-items-center">
            <GiHorseHead size={26} className="text-white" />
          </div>

          {/* CENTRO */}
          <Nav className="dashboard-nav flex-grow-1 justify-content-center">
            <OverlayTrigger overlay={<Tooltip>Dashboard</Tooltip>}>
              <Nav.Link as={NavLink} to="/dashboard">
                <BsHouse />
              </Nav.Link>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>Listagem</Tooltip>}>
              <Nav.Link as={NavLink} to="/dashboard/list">
                <BsListCheck />
              </Nav.Link>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>Carga Horária</Tooltip>}>
              <Nav.Link as={NavLink} to="/dashboard/AdminCargaHoraria">
                <BsClockHistory />
              </Nav.Link>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>Estatísticas</Tooltip>}>
              <Nav.Link as={NavLink} to="/dashboard/estatisticas">
                <BsBarChart />
              </Nav.Link>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>Gestão FVR</Tooltip>}>
              <Nav.Link as={NavLink} to="/dashboard/gestaofvr">
                <GiHorseHead />
              </Nav.Link>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>Nova Tarefa</Tooltip>}>
              <Nav.Link as={NavLink} to="/dashboard/gestaofvr/taskcreatepage">
                <BsClipboardPlus />
              </Nav.Link>
            </OverlayTrigger>
          </Nav>

          {/* DIREITA */}
          <div className="dashboard-right d-flex align-items-center gap-3">
            {login ? (
              <>
                <div className="d-flex align-items-center gap-2 text-white">
                  <BsPersonCircle size={22} />
                  <span className="fw-semibold">Usuário</span>
                </div>

                <span
                  className="d-flex align-items-center text-white"
                  style={{ cursor: "pointer" }}
                  onClick={() => setLogin(false)}
                >
                  <BsBoxArrowRight size={20} />
                </span>
              </>
            ) : (
              <span
                className="d-flex align-items-center gap-2 text-white"
                style={{ cursor: "pointer" }}
                onClick={() => setShowLogin(true)}
              >
                <BsPerson size={22} />
                <BsBoxArrowInRight size={18} />
              </span>
            )}
          </div>

        </Container>
      </Navbar>

      {/* MODAL LOGIN */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>RE / Registro</Form.Label>
              <Form.Control
                name="re"
                value={credenciais.re}
                onChange={handleChange}
                placeholder="Digite seu RE"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                name="senha"
                value={credenciais.senha}
                onChange={handleChange}
                placeholder="Digite sua senha"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Link to="/dashboard/criarusuario">
          <Button
            variant="outline-secondary"
            onClick={() => console.log("Ir para cadastro")}
          >
            Cadastrar-se
          </Button>
            </Link>
          <Button variant="primary" onClick={handleLogin}>
            Entrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HeaderDashboard;
