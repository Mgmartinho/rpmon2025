import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";

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

import { HiCog8Tooth } from "react-icons/hi2";


import { GiHorseHead } from "react-icons/gi";
import { api } from "../../services/api";

import "./styles.css";

const HeaderDashboard = () => {
  const [usuario, setUsuario] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const [credenciais, setCredenciais] = useState({
    email: "",
    senha: "",
  });

  useEffect(() => {
    // Verifica se há usuário no localStorage quando componente monta
    const usuarioArmazenado = localStorage.getItem("usuario");
    if (usuarioArmazenado) {
      setUsuario(JSON.parse(usuarioArmazenado));
    }

    // Listener para mudanças no storage (sincroniza entre abas)
    const handleStorageChange = () => {
      const usuario = localStorage.getItem("usuario");
      setUsuario(usuario ? JSON.parse(usuario) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciais((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const data = await api.login(credenciais.email, credenciais.senha);

      if (data.error) {
        alert(data.error);
        return;
      }

      // Armazena o token e usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      setUsuario(data.usuario);
      setShowLogin(false);
      setCredenciais({ email: "", senha: "" });
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Erro ao fazer login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  const handleConfig = () => {
    window.location.href = "/dashboard/gestaofvr/configPerfil";
  };

  return (
    <>
      {/* NAVBAR */}
      <Navbar bg="dark" variant="dark" className="dashboard-header">
        <Container fluid style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", gap: "20px" }}>
          {/* ESQUERDA - LOGO (COLUNA 1) */}
          <div className="dashboard-left d-flex align-items-center justify-content-start">
            <GiHorseHead size={26} className="text-white" />
          </div>

          {/* CENTRO - MENUS (COLUNA 2) */}
          <Nav className="dashboard-nav d-flex gap-3 justify-content-center">
            {/* ABAS PÚBLICAS - SEMPRE VISÍVEIS */}
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

            {/* ABAS PROTEGIDAS - SÓ MOSTRA SE LOGADO */}
            {usuario && (
              <>
                <OverlayTrigger overlay={<Tooltip>Estatísticas</Tooltip>}>
                  <Nav.Link as={NavLink} to="/dashboard/estatisticasfvr">
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
              </>
            )}
          </Nav>

          {/* DIREITA - USUÁRIO (COLUNA 3) */}
          <div className="dashboard-right d-flex align-items-center justify-content-end gap-3">
            {usuario ? (
              <>
                <div className="d-flex align-items-center gap-2 text-white">
                  <BsPersonCircle size={22} />
                  <div className="d-flex flex-column">
                    <span className="fw-semibold">{usuario.nome}</span>
                    <small style={{ fontSize: "0.7em", color: "#bbb" }}>
                      {usuario.perfil}
                    </small>
                  </div>
                </div>

                {/* CONFIGURAÇÕES */}
                <span
                  className="d-flex align-items-center text-white"
                  style={{ cursor: "pointer" }}
                  onClick={handleConfig}
                  title="Configurações"
                >
                  <HiCog8Tooth size={20} />
                </span>

                {/* LOGOUT */}
                <span
                  className="d-flex align-items-center text-white"
                  style={{ cursor: "pointer" }}
                  onClick={handleLogout}
                  title="Logout"
                >
                  <BsBoxArrowRight size={20} />
                </span>
              </>
            ) : (
              <span
                className="d-flex align-items-center gap-2 text-white"
                style={{ cursor: "pointer" }}
                onClick={() => setShowLogin(true)}
                title="Login"
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
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={credenciais.email}
                onChange={handleChange}
                placeholder="Digite seu email"
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
              onClick={() => setShowLogin(false)}
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
