import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
import { 
  BsTrash, 
  BsCheckCircle, 
  BsXCircle, 
  BsFilter,
  BsSearch,
  BsArchive,
  BsClipboardCheck,
  BsEye 
} from "react-icons/bs";
import { GiHorseHead } from "react-icons/gi";
import { api } from "../../../services/api";
import "./styles.css";
import "./exclusaostyles.css";

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
    <div className="container-fluid mt-4 px-4">
      {/* Header - Estilo Gestão FVR */}
      <Row className="mb-4 g-3">
        <Col md={12}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <GiHorseHead size={50} className="text-primary me-3" />
                <div>
                  <h4 className="mb-1">
                    <BsTrash className="me-2" />
                    Exclusão de Solípedes
                  </h4>
                  <small className="text-muted">
                    Gerencie a exclusão de solípedes - os dados são preservados no histórico
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Indicadores - Estilo Gestão FVR */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card
            className="indicator-card indicator-success"
            role="button"
            onClick={() => setVisualizacao("ativos")}
          >
            <Card.Body>
              <div className="indicator-icon">
                <BsCheckCircle />
              </div>
              <small>Solípedes Ativos</small>
              <h4>{solipedes.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card
            className="indicator-card indicator-danger"
            role="button"
            onClick={() => setVisualizacao("excluidos")}
          >
            <Card.Body>
              <div className="indicator-icon">
                <BsXCircle />
              </div>
              <small>Solípedes Excluídos</small>
              <h4>{excluidos.length}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros com design melhorado */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-light border-0">
          <h5 className="mb-0">
            <BsFilter className="me-2" />
            Filtros de Pesquisa
          </h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <BsSearch className="me-2" />
                  Filtrar por Número
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o número..."
                  value={filtroNumero}
                  onChange={(e) => setFiltroNumero(e.target.value)}
                  className="border-2"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <BsSearch className="me-2" />
                  Filtrar por Nome
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  className="border-2"
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setFiltroNumero("");
                  setFiltroNome("");
                }}
              >
                <BsXCircle className="me-2" />
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela com design melhorado */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">
            {visualizacao === "ativos" ? (
              <><BsCheckCircle className="me-2 text-success" />Solípedes Ativos</>
            ) : (
              <><BsArchive className="me-2 text-danger" />Histórico de Excluídos</>
            )}
          </h5>
          <Badge bg={visualizacao === "ativos" ? "success" : "danger"} className="px-3 py-2">
            {dadosFiltrados.length} {dadosFiltrados.length === 1 ? 'registro' : 'registros'}
          </Badge>
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
                      {visualizacao === "ativos" ? (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleExcluir(item)}
                        >
                          <BsTrash /> Excluir
                        </Button>
                      ) : (
                        <Link 
                          to={`/dashboard/gestaofvr/solipede/prontuario/edit/${item.numero}?readonly=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline-info"
                            title="Visualizar Prontuário Arquivado (somente leitura)"
                          >
                            <BsEye /> Ver Prontuário
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Paginação com design melhorado */}
      {totalPages > 1 && (
        <Card className="mt-3 border-0 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6}>
                <div className="d-flex align-items-center">
                  <Form.Label className="me-2 mb-0 fw-semibold">Itens por página:</Form.Label>
                  <Form.Select
                    style={{ width: "80px" }}
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border-2"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex justify-content-end align-items-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="me-2"
                  >
                    ← Anterior
                  </Button>
                  <Badge bg="primary" className="px-3 py-2 mx-2">
                    Página {currentPage} de {totalPages}
                  </Badge>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="ms-2"
                  >
                    Próxima →
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Modal de Confirmação com design melhorado */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="d-flex align-items-center">
            <div style={{
              backgroundColor: '#f8d7da',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <BsTrash className="text-danger" size={20} />
            </div>
            Confirmar Exclusão de Solípede
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          {erro && <Alert variant="danger" className="d-flex align-items-center"><BsXCircle className="me-2" />{erro}</Alert>}
          {sucesso && <Alert variant="success" className="d-flex align-items-center"><BsCheckCircle className="me-2" />{sucesso}</Alert>}

          {solipedeSelecionado && (
            <Card className="mb-3 border-0" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Body>
                <h6 className="text-muted mb-3">Informações do Solípede:</h6>
                <Row>
                  <Col md={4}>
                    <p className="mb-2">
                      <strong className="text-primary">Número:</strong>
                      <br />
                      <span className="fs-5">{solipedeSelecionado.numero}</span>
                    </p>
                  </Col>
                  <Col md={4}>
                    <p className="mb-2">
                      <strong className="text-primary">Nome:</strong>
                      <br />
                      <span className="fs-5">{solipedeSelecionado.nome || "—"}</span>
                    </p>
                  </Col>
                  <Col md={4}>
                    <p className="mb-2">
                      <strong className="text-primary">Alocação:</strong>
                      <br />
                      <span className="fs-5">{solipedeSelecionado.alocacao || "—"}</span>
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
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
