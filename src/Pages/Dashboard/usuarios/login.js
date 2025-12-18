import { useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    registro: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    perfil: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      alert("As senhas não conferem");
      return;
    }

    console.log("Dados do usuário:", formData);

    // futuramente aqui vai o POST para a API
    alert("Usuário criado (frontend)");
    navigate("/login");
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Col md={5} lg={4}>
        <Card className="shadow">
          <Card.Body>
            <h4 className="mb-2 text-center">Criar Conta</h4>
            <p className="text-muted text-center mb-4">
              Cadastro de acesso ao sistema
            </p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nome completo</Form.Label>
                <Form.Control
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Registro Militar / RE</Form.Label>
                <Form.Control
                  name="registro"
                  value={formData.registro}
                  onChange={handleChange}
                  placeholder="Digite o seu RE sem digito: "
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="senha"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirmar senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Perfil de acesso</Form.Label>
                <Form.Select
                  name="perfil"
                  value={formData.perfil}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="admin">Administrador</option>
                  <option value="veterinario">Veterinário</option>
                  <option value="operador">Operador</option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid">
                <Button type="submit" variant="primary">
                  Criar Usuário
                </Button>
              </div>

              <div className="text-center mt-3">
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                >
                  Já tenho conta
                </Button>

                <span>
                    <Link to="/dashboard">Voltar</Link>
                </span>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
};

export default Login;
