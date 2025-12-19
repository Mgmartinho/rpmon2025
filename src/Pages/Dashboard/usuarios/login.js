import { useState } from "react";
import { Container, Card, Form, Button, Col, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const data = await api.login(formData.email, formData.senha);

      if (data.error) {
        setErro(data.error);
        setLoading(false);
        return;
      }

      // Armazena o token
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Redireciona para o dashboard
      navigate("/dashboard");
    } catch (erro) {
      console.error("Erro:", erro);
      setErro("Erro ao conectar com o servidor");
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Col md={5} lg={4}>
        <Card className="shadow">
          <Card.Body>
            <h4 className="mb-2 text-center">Login</h4>
            <p className="text-muted text-center mb-4">
              Acesse sua conta no sistema
            </p>

            {erro && <Alert variant="danger">{erro}</Alert>}

            <Form onSubmit={handleSubmit}>
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

              <Form.Group className="mb-4">
                <Form.Label>Senha</Form.Label>
                <Form.Control
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </div>

              <div className="text-center mt-3">
                <span>
                  Não tem conta?{" "}
                  <Link to="/dashboard/criarusuario">Criar conta</Link>
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
