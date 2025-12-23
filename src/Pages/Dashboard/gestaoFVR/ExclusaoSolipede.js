import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Table,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Spinner,
  Form,
  Modal,
  Alert,
} from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { api } from "../../../services/api";
import "./styles.css";

const ExclusaoSolipede = () => {
  const [searchParams] = useSearchParams();
  const [solipedes, setSolipedes] = useState([]);
  const [excluidos, setExcluidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visualizacao, setVisualizacao] = useState("ativos"); // 'ativos' ou 'excluidos'

  // Modal de exclusão
  const [showModal, setShowModal] = useState(false);
  const [solipedeSelecionado, setSolipedeSelecionado] = useState(null);
  const [motivoExclusao, setMotivoExclusao] = useState("");
  const [motivoOutro, setMotivoOutro] = useState(""); // Para quando selecionar "Outro"
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [processando, setProcessando] = useState(false);

  // Opções de motivo de exclusão
  const motivosExclusao = [
    { value: "", label: "Selecione o motivo..." },
    { value: "Óbito", label: "Óbito" },
    { value: "Eutanásia", label: "Eutanásia" },
    { value: "Reforma", label: "Reforma" },
    { value: "Outro", label: "Outro (especificar)" },
  ];

  // Filtros
  const [filtroNumero, setFiltroNumero] = useState("");
  const [filtroNome, setFiltroNome] = useState("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  // Verificar se veio número pela URL e abrir modal automaticamente
  useEffect(() => {
    const numeroURL = searchParams.get("numero");
    if (numeroURL && solipedes.length > 0) {
      const solipede = solipedes.find(
        (s) => s.numero.toString() === numeroURL
      );
      if (solipede) {
        handleExcluir(solipede);
      }
    }
  }, [searchParams, solipedes]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [solipedesData, excluidosData] = await Promise.all([
        api.listarSolipedes(),
        api.listarExcluidos(),
      ]);

      if (Array.isArray(solipedesData)) {
        setSolipedes(solipedesData);
      }
      if (Array.isArray(excluidosData)) {
        setExcluidos(excluidosData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de exclusão
  const handleExcluir = (solipede) => {
    setSolipedeSelecionado(solipede);
    setMotivoExclusao("");
    setMotivoOutro("");
    setSenha("");
    setErro("");
    setShowModal(true);
  };

  // Confirmar exclusão
  const confirmarExclusao = async () => {
    setErro("");
    setSucesso("");

    if (!motivoExclusao) {
      setErro("Selecione o motivo da exclusão");
      return;
    }

    // Se selecionou "Outro", precisa especificar
    if (motivoExclusao === "Outro" && !motivoOutro.trim()) {
      setErro("Especifique o motivo da exclusão");
      return;
    }

    if (!senha) {
      setErro("Senha é obrigatória para confirmar a exclusão");
      return;
    }

    // Motivo final (se for "Outro", usa o texto customizado)
    const motivoFinal = motivoExclusao === "Outro" ? motivoOutro : motivoExclusao;

    try {
      setProcessando(true);
      const resultado = await api.excluirSolipede(
        solipedeSelecionado.numero,
        motivoFinal,
        senha
      );

      if (resultado.error) {
        setErro(resultado.error);
        return;
      }

      setSucesso("Solípede excluído com sucesso!");
      setTimeout(() => {
        setShowModal(false);
        carregarDados();
        setSucesso("");
      }, 2000);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setErro("Erro ao excluir solípede");
    } finally {
      setProcessando(false);
    }
  };

  // Filtrar dados
  const dadosFiltrados = useMemo(() => {
    const dados = visualizacao === "ativos" ? solipedes : excluidos;

    return dados.filter((item) => {
      const matchNumero = filtroNumero
        ? item.numero.toString().includes(filtroNumero)
        : true;
      const matchNome = filtroNome
        ? item.nome?.toLowerCase().includes(filtroNome.toLowerCase())
        : true;
      return matchNumero && matchNome;
    });
  }, [solipedes, excluidos, visualizacao, filtroNumero, filtroNome]);

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dadosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dadosFiltrados.length / itemsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-dark">
            <BsTrash className="me-2" />
            Exclusão de Solípedes
          </h2>
          <p className="text-muted">
            Gerencie a exclusão de solípedes (os dados são movidos para histórico)
          </p>
        </Col>
      </Row>

      {/* Indicadores */}
      <Row className="mb-4">
        <Col md={4}>
          <Card
            className={`text-center cursor-pointer ${
              visualizacao === "ativos" ? "border-primary" : ""
            }`}
            onClick={() => setVisualizacao("ativos")}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <h3 className="text-primary">{solipedes.length}</h3>
              <p className="mb-0">Solípedes Ativos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className={`text-center cursor-pointer ${
              visualizacao === "excluidos" ? "border-danger" : ""
            }`}
            onClick={() => setVisualizacao("excluidos")}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <h3 className="text-danger">{excluidos.length}</h3>
              <p className="mb-0">Solípedes Excluídos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtrar por Número</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o número..."
                  value={filtroNumero}
                  onChange={(e) => setFiltroNumero(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtrar por Nome</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setFiltroNumero("");
                  setFiltroNome("");
                }}
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>
            {visualizacao === "ativos"
              ? "Solípedes Ativos"
              : "Histórico de Excluídos"}
          </span>
          <Badge bg="info">{dadosFiltrados.length} registros</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {currentItems.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Nenhum registro encontrado</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Nome</th>
                  <th>Sexo</th>
                  <th>Pelagem</th>
                  <th>Status</th>
                  <th>Alocação</th>
                  {visualizacao === "excluidos" && (
                    <>
                      <th>Data Exclusão</th>
                      <th>Motivo</th>
                      <th>Usuário</th>
                    </>
                  )}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.numero || item.id}>
                    <td>{item.numero}</td>
                    <td>{item.nome || "—"}</td>
                    <td>{item.sexo || "—"}</td>
                    <td>{item.pelagem || "—"}</td>
                    <td>
                      <Badge
                        bg={item.status === "Ativo" ? "success" : "secondary"}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td>{item.alocacao || "—"}</td>
                    {visualizacao === "excluidos" && (
                      <>
                        <td>
                          {item.data_exclusao
                            ? new Date(item.data_exclusao).toLocaleDateString(
                                "pt-BR"
                              )
                            : "—"}
                        </td>
                        <td>
                          <span
                            title={item.motivo_exclusao}
                            style={{ cursor: "help" }}
                          >
                            {item.motivo_exclusao?.substring(0, 30)}
                            {item.motivo_exclusao?.length > 30 ? "..." : ""}
                          </span>
                        </td>
                        <td>{item.usuario_nome || "—"}</td>
                      </>
                    )}
                    <td>
                      {visualizacao === "ativos" && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleExcluir(item)}
                        >
                          <BsTrash /> Excluir
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Row className="mt-3">
          <Col className="d-flex justify-content-between align-items-center">
            <div>
              <Form.Label className="me-2">Itens por página:</Form.Label>
              <Form.Select
                style={{ width: "auto", display: "inline-block" }}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
            </div>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </Button>
              <span className="mx-3">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Próxima
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Modal de Confirmação */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <BsTrash className="text-danger me-2" />
            Confirmar Exclusão
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erro && <Alert variant="danger">{erro}</Alert>}
          {sucesso && <Alert variant="success">{sucesso}</Alert>}

          {solipedeSelecionado && (
            <div className="mb-3">
              <p>
                <strong>Número:</strong> {solipedeSelecionado.numero}
              </p>
              <p>
                <strong>Nome:</strong> {solipedeSelecionado.nome || "—"}
              </p>
              <p>
                <strong>Alocação:</strong>{" "}
                {solipedeSelecionado.alocacao || "—"}
              </p>
            </div>
          )}

          <Alert variant="warning">
            <strong>Atenção:</strong> Esta ação moverá o solípede para o
            histórico de excluídos. Os dados não serão perdidos, mas o solípede
            não aparecerá mais nas listagens principais.
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>
              Motivo da Exclusão <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={motivoExclusao}
              onChange={(e) => setMotivoExclusao(e.target.value)}
              disabled={processando}
            >
              {motivosExclusao.map((motivo) => (
                <option key={motivo.value} value={motivo.value}>
                  {motivo.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {motivoExclusao === "Outro" && (
            <Form.Group className="mb-3">
              <Form.Label>
                Especifique o Motivo <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descreva o motivo da exclusão..."
                value={motivoOutro}
                onChange={(e) => setMotivoOutro(e.target.value)}
                disabled={processando}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              Senha de Confirmação <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Digite sua senha..."
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={processando}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={processando}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmarExclusao}
            disabled={processando}
          >
            {processando ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Processando...
              </>
            ) : (
              <>
                <BsTrash className="me-2" />
                Confirmar Exclusão
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExclusaoSolipede;
