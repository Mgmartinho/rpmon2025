import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  InputGroup,
  Tabs,
  Tab,
  Table,
  Badge,
  Modal,
  Spinner,
} from "react-bootstrap";
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaEdit, 
  FaKey,
  FaCog,
  FaUserShield,
} from "react-icons/fa";
import { BsShieldCheck, BsPersonBadge } from "react-icons/bs";
import { temPermissao, isAdmin } from "../../../utils/permissions";

// ===== CONSTANTES =====
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const PERFIS_SISTEMA = [
  { valor: "Desenvolvedor", label: "Desenvolvedor", descricao: "Acesso completo ao sistema e desenvolvimento", cor: "danger" },
  { valor: "Veterinario Admin", label: "Veterinário Admin", descricao: "Gestão veterinária completa", cor: "primary" },
  { valor: "Veterinario", label: "Veterinário", descricao: "Atendimento e consultas veterinárias", cor: "info" },
  { valor: "Ferrador", label: "Ferrador", descricao: "Gestão de ferrageamento", cor: "dark" },
  { valor: "Pagador de cavalo", label: "Pagador de Cavalo", descricao: "Gestão de pagamentos e carga horária", cor: "warning" },
  { valor: "Consulta", label: "Consulta", descricao: "Apenas visualização de dados públicos", cor: "secondary" },
];

const getPerfilInfo = (perfil) => {
  return PERFIS_SISTEMA.find(p => p.valor === perfil) || PERFIS_SISTEMA[5];
};

const ConfiguracaoPerfil = () => {
  // ===== STATES =====
  const [abaAtiva, setAbaAtiva] = useState("configuracoes");
  
  // Dados do usuário logado
  const [usuarioId, setUsuarioId] = useState(null);
  const [nome, setNome] = useState("");
  const [registro, setRegistro] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("Consulta");

  // Lista de usuários (para gerenciamento)
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  // Alteração de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // Modal de edição de perfil
  const [showModalPerfil, setShowModalPerfil] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState("");
  
  // Modal de alteração de senha (para outros usuários)
  const [showModalSenha, setShowModalSenha] = useState(false);
  const [senhaModalNova, setSenhaModalNova] = useState("");
  const [senhaModalConfirmar, setSenhaModalConfirmar] = useState("");

  // Modal de edição de usuário
  const [showModalEditarUsuario, setShowModalEditarUsuario] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [registroEdit, setRegistroEdit] = useState("");
  const [emailEdit, setEmailEdit] = useState("");

  // Feedback e loading
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== CARREGA USUÁRIO LOGADO =====
  useEffect(() => {
    const carregarDados = async () => {
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      if (usuario) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/usuarios/${usuario.id}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const dados = await response.json();
            setUsuarioId(dados.id);
            setNome(dados.nome || "");
            setRegistro(dados.registro || "");
            setEmail(dados.email || "");
            setPerfil(dados.perfil || "Consulta");
            setPerfilSelecionado(dados.perfil || "Consulta");
            localStorage.setItem("usuario", JSON.stringify(dados));
          } else {
            setUsuarioId(usuario.id);
            setNome(usuario.nome || "");
            setRegistro(usuario.registro || "");
            setEmail(usuario.email || "");
            setPerfil(usuario.perfil || "Consulta");
            setPerfilSelecionado(usuario.perfil || "Consulta");
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          setUsuarioId(usuario.id);
          setNome(usuario.nome || "");
          setRegistro(usuario.registro || "");
          setEmail(usuario.email || "");
          setPerfil(usuario.perfil || "Consulta");
          setPerfilSelecionado(usuario.perfil || "Consulta");
        }
      }
    };

    carregarDados();
  }, []);

  // ===== CARREGA LISTA DE USUÁRIOS =====
  useEffect(() => {
    if (abaAtiva === "gerenciamento") {
      carregarUsuarios();
    }
  }, [abaAtiva]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/usuarios`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        setFeedback({
          tipo: "danger",
          mensagem: "Erro ao carregar usuários.",
        });
      }
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem: "Erro ao carregar usuários.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNÇÕES - ABA CONFIGURAÇÕES =====
  const salvarConfiguracoes = async () => {
    try {
      setLoading(true);
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      
      const response = await fetch(`${API_BASE_URL}/auth/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ nome, registro, email }),
      });

      const data = await response.json();

      if (response.ok) {
        const usuarioAtualizado = { ...usuario, nome, registro, email };
        localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));

        setFeedback({
          tipo: "success",
          mensagem: "Configurações atualizadas com sucesso!",
        });
        
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setFeedback({
          tipo: "danger",
          mensagem: data.error || "Erro ao atualizar configurações.",
        });
      }
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem: "Erro ao atualizar configurações.",
      });
    } finally {
      setLoading(false);
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

    if (novaSenha.length < 6) {
      setFeedback({
        tipo: "danger",
        mensagem: "A senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/alterar-senha`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({
          tipo: "success",
          mensagem: "Senha alterada com sucesso!",
        });

        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
      } else {
        setFeedback({
          tipo: "danger",
          mensagem: data.error || "Erro ao alterar senha.",
        });
      }
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem: "Erro ao alterar senha.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNÇÕES - ABA GERENCIAMENTO =====
  const abrirModalEditarUsuario = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNomeEdit(usuario.nome);
    setRegistroEdit(usuario.registro);
    setEmailEdit(usuario.email);
    setShowModalEditarUsuario(true);
  };

  const salvarEdicaoUsuario = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/usuarios/${usuarioSelecionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          nome: nomeEdit, 
          registro: registroEdit, 
          email: emailEdit 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({
          tipo: "success",
          mensagem: "Usuário atualizado com sucesso!",
        });
        setShowModalEditarUsuario(false);
        carregarUsuarios();
      } else {
        setFeedback({
          tipo: "danger",
          mensagem: data.error || "Erro ao atualizar usuário.",
        });
      }
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem: "Erro ao atualizar usuário.",
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalPerfilUsuario = (usuario) => {
    setUsuarioSelecionado(usuario);
    setPerfilSelecionado(usuario.perfil);
    setShowModalPerfil(true);
  };

  const salvarPerfilUsuario = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/usuarios/${usuarioSelecionado.id}/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ perfil: perfilSelecionado }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({
          tipo: "success",
          mensagem: "Perfil atualizado com sucesso!",
        });
        setShowModalPerfil(false);
        carregarUsuarios();
      } else {
        setFeedback({
          tipo: "danger",
          mensagem: data.error || "Erro ao atualizar perfil.",
        });
      }
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem: "Erro ao atualizar perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalSenhaUsuario = (usuario) => {
    setUsuarioSelecionado(usuario);
    setSenhaModalNova("");
    setSenhaModalConfirmar("");
    setShowModalSenha(true);
  };

  const alterarSenhaUsuario = async () => {
    if (senhaModalNova !== senhaModalConfirmar) {
      setFeedback({
        tipo: "danger",
        mensagem: "As senhas não coincidem.",
      });
      return;
    }

    if (senhaModalNova.length < 6) {
      setFeedback({
        tipo: "danger",
        mensagem: "A senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/usuarios/${usuarioSelecionado.id}/senha`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          novaSenha: senhaModalNova,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({
          tipo: "success",
          mensagem: "Senha alterada com sucesso!",
        });
        setShowModalSenha(false);
      } else {
        setFeedback({
          tipo: "danger",
          mensagem: data.error || "Erro ao alterar senha.",
        });
      }
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem: "Erro ao alterar senha.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== FORÇA DA SENHA =====
  const forcaSenha = () => {
    if (novaSenha.length >= 10) return "Forte";
    if (novaSenha.length >= 6) return "Média";
    return "Fraca";
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="text-dark d-flex align-items-center mb-2">
                <FaCog className="me-3" style={{ fontSize: "2rem" }} />
                Configurações de Perfil
              </h2>
              <p className="text-muted mb-0">
                <BsPersonBadge className="me-2" />
                Gerencie suas informações pessoais e preferências da conta
              </p>
            </div>
            <div className="text-end">
              <Badge 
                bg={getPerfilInfo(perfil).cor}
                className="px-4 py-3"
                style={{ fontSize: "1rem" }}
              >
                {getPerfilInfo(perfil).label}
              </Badge>
              <div className="mt-1">
                <small className="text-muted">Seu perfil atual</small>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {feedback && (
        <Alert 
          variant={feedback.tipo} 
          onClose={() => setFeedback(null)} 
          dismissible
        >
          {feedback.mensagem}
        </Alert>
      )}

      <Tabs
        activeKey={abaAtiva}
        onSelect={(k) => setAbaAtiva(k)}
        className="mb-4"
      >
        {/* ABA 1: CONFIGURAÇÕES DA CONTA */}
        <Tab 
          eventKey="configuracoes" 
          title={
            <span>
              <FaUser className="me-2" />
              Configurações da Conta
            </span>
          }
        >
          <Row className="mt-4">
            <Col md={6}>
              <Card className="shadow-sm mb-4 border-primary" style={{ borderWidth: "2px" }}>
                <Card.Header className="bg-primary text-white">
                  <FaUser className="me-2" />
                  <strong>Informações Pessoais</strong>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Digite seu nome completo"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Registro/Matrícula</Form.Label>
                    <Form.Control
                      type="text"
                      value={registro}
                      onChange={(e) => setRegistro(e.target.value)}
                      placeholder="Digite seu registro"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite seu e-mail"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="d-flex align-items-center">
                      <BsShieldCheck className="me-2" />
                      Perfil de Acesso
                    </Form.Label>
                    <div className="p-3 bg-light rounded border">
                      <Badge 
                        bg={getPerfilInfo(perfil).cor}
                        className="px-3 py-2 me-2"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {getPerfilInfo(perfil).label}
                      </Badge>
                      <div className="mt-2">
                        <small className="text-muted">
                          {getPerfilInfo(perfil).descricao}
                        </small>
                      </div>
                    </div>
                    <Form.Text className="text-muted">
                      <BsPersonBadge className="me-1" />
                      Apenas administradores podem alterar perfis
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={salvarConfiguracoes}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <FaUser className="me-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="shadow-sm mb-4 border-warning" style={{ borderWidth: "2px" }}>
                <Card.Header className="bg-warning text-dark">
                  <FaLock className="me-2" />
                  <strong>Segurança da Conta</strong>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Senha Atual</Form.Label>
                    <Form.Control
                      type="password"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="Digite sua senha atual"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nova Senha</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={mostrarSenha ? "text" : "password"}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Digite a nova senha"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                      >
                        {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    {novaSenha && (
                      <small className={`text-${forcaSenha() === "Forte" ? "success" : forcaSenha() === "Média" ? "warning" : "danger"}`}>
                        Força da senha: {forcaSenha()}
                      </small>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirmar Nova Senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Confirme a nova senha"
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="warning"
                      size="lg"
                      onClick={alterarSenha}
                      disabled={loading || !senhaAtual || !novaSenha || !confirmarSenha}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Alterando...
                        </>
                      ) : (
                        <>
                          <FaKey className="me-2" />
                          Alterar Senha
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* ABA 2: GERENCIAMENTO DE USUÁRIOS - Apenas Veterinário Admin e Desenvolvedor */}
        {temPermissao(perfil, "VISUALIZAR_USUARIOS") && (
        <Tab 
          eventKey="gerenciamento" 
          title={
            <span>
              <FaUserShield className="me-2" />
              Gerenciamento de Usuários
            </span>
          }
        >
          <div className="mt-4">
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-3">
                <span style={{ fontSize: "1.1rem" }}>
                  <FaUserShield className="me-2" />
                  <strong>Gerenciamento de Usuários do Sistema</strong>
                </span>
                <Button 
                  size="sm" 
                  variant="light" 
                  onClick={carregarUsuarios}
                  disabled={loading}
                >
                  {loading ? "Carregando..." : "🔄 Atualizar"}
                </Button>
              </Card.Header>
              <Card.Body className="p-4">
                <Alert variant="info" className="border-info">
                  <div className="d-flex align-items-center">
                    <BsShieldCheck size={24} className="me-3" />
                    <div>
                      <strong>ℹ️ Gerenciamento Completo</strong>
                      <div className="mt-1">
                        Gerencie os usuários do sistema, alterando perfis, dados pessoais e senhas. 
                        Total de usuários: <Badge bg="info">{usuarios.length}</Badge>
                      </div>
                    </div>
                  </div>
                </Alert>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Carregando usuários...</p>
                  </div>
                ) : usuarios.length === 0 ? (
                  <Alert variant="warning">
                    Nenhum usuário encontrado.
                  </Alert>
                ) : (
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Nome</th>
                        <th>Registro</th>
                        <th>E-mail</th>
                        <th>Perfil</th>
                        <th className="text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="fw-bold">{usuario.nome}</td>
                          <td>{usuario.registro}</td>
                          <td>{usuario.email}</td>
                          <td>
                            <Badge bg={getPerfilInfo(usuario.perfil).cor} className="px-3 py-2">
                              {getPerfilInfo(usuario.perfil).label}
                            </Badge>
                            <br />
                            <small className="text-muted">
                              {getPerfilInfo(usuario.perfil).descricao}
                            </small>
                          </td>
                          <td className="text-center">
                            {temPermissao(perfil, "EDITAR_USUARIO") && (
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2 mb-1"
                              onClick={() => abrirModalEditarUsuario(usuario)}
                              title="Editar dados"
                            >
                              <FaEdit /> Editar
                            </Button>
                            )}
                            {temPermissao(perfil, "ALTERAR_PERFIL_USUARIO") && (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              className="me-2 mb-1"
                              onClick={() => abrirModalPerfilUsuario(usuario)}
                              title="Alterar perfil"
                            >
                              <FaUserShield /> Perfil
                            </Button>
                            )}
                            {temPermissao(perfil, "ALTERAR_SENHA_USUARIO") && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="mb-1"
                              onClick={() => abrirModalSenhaUsuario(usuario)}
                              title="Alterar senha"
                            >
                              <FaKey /> Senha
                            </Button>
                            )}
                            {!temPermissao(perfil, "EDITAR_USUARIO") && 
                             !temPermissao(perfil, "ALTERAR_PERFIL_USUARIO") && 
                             !temPermissao(perfil, "ALTERAR_SENHA_USUARIO") && (
                              <Badge bg="secondary">Sem permissões</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </div>
        </Tab>
        )}
      </Tabs>

      {/* MODAL: EDITAR USUÁRIO */}
      <Modal show={showModalEditarUsuario} onHide={() => setShowModalEditarUsuario(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Editar Usuário
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioSelecionado && (
            <>
              <Alert variant="secondary">
                Editando: <strong>{usuarioSelecionado.nome}</strong>
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>Nome Completo *</Form.Label>
                <Form.Control
                  type="text"
                  value={nomeEdit}
                  onChange={(e) => setNomeEdit(e.target.value)}
                  placeholder="Nome completo"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Registro/Matrícula *</Form.Label>
                <Form.Control
                  type="text"
                  value={registroEdit}
                  onChange={(e) => setRegistroEdit(e.target.value)}
                  placeholder="Registro"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>E-mail *</Form.Label>
                <Form.Control
                  type="email"
                  value={emailEdit}
                  onChange={(e) => setEmailEdit(e.target.value)}
                  placeholder="E-mail"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEditarUsuario(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={salvarEdicaoUsuario}
            disabled={loading || !nomeEdit || !registroEdit || !emailEdit}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: ALTERAR PERFIL */}
      <Modal show={showModalPerfil} onHide={() => setShowModalPerfil(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUserShield className="me-2" />
            Alterar Perfil de Acesso
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioSelecionado && (
            <>
              <Alert variant="warning">
                <strong>⚠️ Atenção:</strong> Você está alterando o perfil de <strong>{usuarioSelecionado.nome}</strong>
              </Alert>

              <div className="mb-3 p-3 bg-light rounded">
                <small className="text-muted">Perfil atual:</small>
                <div>
                  <Badge bg={getPerfilInfo(usuarioSelecionado.perfil).cor} className="px-3 py-2">
                    {getPerfilInfo(usuarioSelecionado.perfil).label}
                  </Badge>
                </div>
              </div>
              
              <Form.Group>
                <Form.Label><strong>Selecione o novo perfil:</strong></Form.Label>
                <Form.Select
                  value={perfilSelecionado}
                  onChange={(e) => setPerfilSelecionado(e.target.value)}
                  size="lg"
                >
                  {PERFIS_SISTEMA.map((perfil) => (
                    <option key={perfil.valor} value={perfil.valor}>
                      {perfil.label} - {perfil.descricao}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {perfilSelecionado && (
                <Alert variant={getPerfilInfo(perfilSelecionado).cor} className="mt-3 mb-0">
                  <small>
                    <strong>📋 {getPerfilInfo(perfilSelecionado).label}:</strong> {getPerfilInfo(perfilSelecionado).descricao}
                  </small>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalPerfil(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={salvarPerfilUsuario} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: ALTERAR SENHA */}
      <Modal show={showModalSenha} onHide={() => setShowModalSenha(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaKey className="me-2" />
            Alterar Senha do Usuário
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioSelecionado && (
            <>
              <Alert variant="danger">
                <strong>🔐 Segurança:</strong> Você está redefinindo a senha de <strong>{usuarioSelecionado.nome}</strong>
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>Nova Senha *</Form.Label>
                <Form.Control
                  type="password"
                  value={senhaModalNova}
                  onChange={(e) => setSenhaModalNova(e.target.value)}
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirmar Nova Senha *</Form.Label>
                <Form.Control
                  type="password"
                  value={senhaModalConfirmar}
                  onChange={(e) => setSenhaModalConfirmar(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
              </Form.Group>

              <Alert variant="info" className="mb-0">
                <small>
                  <strong>💡 Dica:</strong> Use uma senha forte com letras, números e caracteres especiais.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalSenha(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={alterarSenhaUsuario}
            disabled={loading || !senhaModalNova || !senhaModalConfirmar}
          >
            {loading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ConfiguracaoPerfil;
