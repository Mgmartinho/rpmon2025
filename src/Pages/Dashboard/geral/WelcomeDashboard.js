import { Container, Row, Col, Card, Badge, Modal, Form, Button } from "react-bootstrap";
import { GiHorseHead, GiHorseshoe } from "react-icons/gi";
import { FaShieldAlt, FaChartLine, FaUserMd, FaHistory } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../../src/services/api";
import "./WelcomeDashboard.css";

const WelcomeDashboard = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [credenciais, setCredenciais] = useState({
    email: "",
    senha: "",
  });

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem("usuario");
    if (usuarioArmazenado) {
      window.location.href = "/dashboard/list";
    }
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      setShowLogin(false);
      setCredenciais({ email: "", senha: "" });
      window.location.href = "/dashboard/list";
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Erro ao fazer login");
    }
  };

  const features = [
    { icon: <FaShieldAlt />, title: "Gestão Completa", desc: "Controle total do sistema" },
    { icon: <GiHorseshoe />, title: "Ferrageamento", desc: "Acompanhamento especializado" },
    { icon: <FaUserMd />, title: "Prontuários", desc: "Histórico veterinário detalhado" },
    { icon: <FaChartLine />, title: "Estatísticas", desc: "Análises e relatórios" },
    { icon: <FaHistory />, title: "Histórico", desc: "Rastreamento de alterações" },
    { icon: <MdSecurity />, title: "Segurança", desc: "Acesso controlado" }
  ];

  return (
    <div className="welcome-dashboard">
      {/* Animated background elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Container className="welcome-container">
        <Row className="justify-content-center">
          <Col lg={10} xl={8} sm={12}>
            {/* Main Card */}
            <Card className="welcome-card shadow-lg border-0 mb-4">
              <Card.Body className="text-center p-5">
                <div className="welcome-icon-container mb-4">
                  <div className="welcome-icon">
                    <GiHorseHead size={140} />
                  </div>
                  <Badge bg="success" className="status-badge">
                    <span className="pulse-dot"></span> Sistema Online
                  </Badge>
                </div>
                
                <h1 className="welcome-title mb-3">
                  <span className="brand-text">RPMon</span>
                </h1>
                
                <h4 className="welcome-subtitle mb-4">
                  Sistema de Gestão de Solípedes
                </h4>
                
                <p className="welcome-description mb-4">
                  Plataforma integrada para gerenciamento completo dos solípedes<br />
                  <strong>Regimento de Polícia Montada "9 de Julho"</strong>
                </p>

                <div className="divider my-4"></div>

                {/* Features Grid */}
                <Row className="g-3 mb-4">
                  {features.map((feature, index) => (
                    <Col key={index} xs={6} md={4}>
                      <div className="feature-card">
                        <div className="feature-icon">
                          {feature.icon}
                        </div>
                        <h6 className="feature-title">{feature.title}</h6>
                        <p className="feature-desc">{feature.desc}</p>
                      </div>
                    </Col>
                  ))}
                </Row>

                <div className="divider my-4"></div>

                {/* Info Box */}
                <div className="info-box" onClick={() => setShowLogin(true)} style={{ cursor: 'pointer' }}>
                  <p className="mb-2">
                    <strong>💡Clique aqui </strong>Faça seu login para acessar todas as funcionalidades do sistema
                  </p>
                  <p className="text-muted small mb-0">
                    Controle de acesso baseado em perfis e permissões
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Footer Card */}
            <Card className="footer-card border-0 shadow-sm">
              <Card.Body className="text-center py-3">
                <p className="text-muted small mb-1">
                  RPMon - Regimento de Polícia Montada "9 de Julho"
                </p>
                <p className="text-muted small mb-0">
                  Desenvolvido por <strong className="text-primary">MARTINHO EQUINO TECH</strong>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

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
            <Button variant="link">Criar Conta</Button>
          </Link>
          <div>
            <Button variant="secondary" onClick={() => setShowLogin(false)} className="me-2">
              Fechar
            </Button>
            <Button variant="primary" onClick={handleLogin}>
              Entrar
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WelcomeDashboard;
