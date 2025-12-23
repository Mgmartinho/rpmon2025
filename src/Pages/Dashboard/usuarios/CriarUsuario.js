import { useState } from "react";
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../../services/api.js";

const CriarUsuario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não conferem");
      return;
    }

    setLoading(true);

    try {
      const data = await api.criarUsuario(
        formData.nome,
        formData.registro,
        formData.email,
        formData.senha,
        formData.perfil
      );

      if (data.error) {
        setErro(data.error);
        setLoading(false);
        return;
      }

      setSucesso("Usuário criado com sucesso!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
            <h4 className="mb-2 text-center">Criar Conta</h4>
            <p className="text-muted text-center mb-4">
              Cadastro de acesso ao sistema
            </p>

            {erro && <Alert variant="danger">{erro}</Alert>}
            {sucesso && <Alert variant="success">{sucesso}</Alert>}

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

            

              <div className="d-grid">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Criando..." : "Criar Usuário"}
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

export default CriarUsuario;
