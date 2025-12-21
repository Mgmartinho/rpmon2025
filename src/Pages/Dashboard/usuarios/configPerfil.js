import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { api } from "../../../services/api";

const ConfiguracaoPerfil = () => {
  // ===== STATES =====
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("CONSULTA");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // ===== CARREGA USUÁRIO LOGADO =====
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (usuario) {
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
      setPerfil(usuario.perfil || "CONSULTA");
    }
  }, []);

  // ===== FUNÇÕES =====
  const salvarPerfil = async () => {
    try {
      const response = await api.put("/usuarios/me", {
        nome,
        email,
      });

      // Atualiza localStorage
      localStorage.setItem("usuario", JSON.stringify(response.data));

      setFeedback({
        tipo: "success",
        mensagem: "Informações atualizadas com sucesso!",
      });
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem: "Erro ao atualizar informações.",
      });
    }
  };

  const alterarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      setFeedback({
        tipo: "danger",
        mensagem: "As senhas não coincidem.",
      });
      return;
    }

    try {
      await api.put("/usuarios/alterar-senha", {
        senhaAtual,
        novaSenha,
      });

      setFeedback({
        tipo: "success",
        mensagem: "Senha alterada com sucesso!",
      });

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem: "Erro ao alterar senha.",
      });
    }
  };

  // ===== FORÇA DA SENHA (UX) =====
  const forcaSenha = () => {
    if (novaSenha.length >= 10) return "Forte";
    if (novaSenha.length >= 6) return "Média";
    return "Fraca";
  };

  return (
    <div className="container-fluid p-4" style={{ background: "#f8f9fa" }}>
      <h3 className="mb-4" style={{ color: "#1f3c88" }}>
        Configurações de Perfil
      </h3>

      {feedback && (
        <Alert variant={feedback.tipo}>{feedback.mensagem}</Alert>
      )}

      <Row>
        {/* ===== CARD PERFIL ===== */}
        <Col md={6}>
          <Card className="shadow-sm rounded-4 mb-4">
            <Card.Body>
              <Card.Title className="mb-3">
                <FaUser className="me-2" />
                Informações Pessoais
              </Card.Title>

              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Perfil</Form.Label>
                <Form.Control value={perfil} disabled />
              </Form.Group>

              <Button
                style={{ background: "#1f3c88", border: "none" }}
                onClick={salvarPerfil}
              >
                Salvar Alterações
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* ===== CARD SENHA ===== */}
        <Col md={6}>
          <Card className="shadow-sm rounded-4 mb-4">
            <Card.Body>
              <Card.Title className="mb-3">
                <FaLock className="me-2" />
                Segurança
              </Card.Title>

              <Form.Group className="mb-3">
                <Form.Label>Senha Atual</Form.Label>
                <Form.Control
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nova Senha</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={mostrarSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
                <small
                  className={`text-${
                    forcaSenha() === "Forte"
                      ? "success"
                      : forcaSenha() === "Média"
                      ? "warning"
                      : "danger"
                  }`}
                >
                  Força da senha: {forcaSenha()}
                </small>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirmar Nova Senha</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
              </Form.Group>

              <Button variant="warning" onClick={alterarSenha}>
                Alterar Senha
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ConfiguracaoPerfil;
