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
  BsEye 
} from "react-icons/bs";

import { BiDetail } from "react-icons/bi";



import { GiHorseHead } from "react-icons/gi";
import { api } from "../../../services/api";
import { buildUserErrorMessage } from "../../../utils/errorHandling";
import ObitoTemplate from "../../../receituario/ObitoTemplate";
import { getUsuarioLogado } from "../../../utils/auth";
import { gerarReceituarioPDF } from "../../../services/receituarioService";
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
  const [observacao, setObservacao] = useState(""); // Campo adicional de observação
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [processando, setProcessando] = useState(false);
  const [dataObito, setDataObito] = useState("");
  const [localObito, setLocalObito] = useState("");
  const [descricaoObito, setDescricaoObito] = useState("");
  const [confirmacoesObito, setConfirmacoesObito] = useState(["", "", "", ""]);
  const [dadosDocumentoObito, setDadosDocumentoObito] = useState(null);
  const [showModalComprovanteExclusao, setShowModalComprovanteExclusao] = useState(false);
  const [exclusaoSelecionada, setExclusaoSelecionada] = useState(null);
  const [gerandoPDFComprovante, setGerandoPDFComprovante] = useState(false);
  const [nomesConfirmacaoSugestoes, setNomesConfirmacaoSugestoes] = useState([]);

  const usuarioLogado = useMemo(() => getUsuarioLogado(), []);

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
      const [solipedesData, excluidosData, usuariosData] = await Promise.all([
        api.listarSolipedes(),
        api.listarExcluidos(),
        api.listarUsuarios().catch(() => []),
      ]);

      if (Array.isArray(solipedesData)) {
        setSolipedes(solipedesData);
      }
      if (Array.isArray(excluidosData)) {
        setExcluidos(excluidosData);
      }
      if (Array.isArray(usuariosData)) {
        const nomesUnicos = Array.from(
          new Set(
            usuariosData
              .map((usuario) => String(usuario?.nome || "").trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b, "pt-BR"));

        setNomesConfirmacaoSugestoes(nomesUnicos);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro(
        buildUserErrorMessage(
          "Falha ao carregar dados da tela de exclusão",
          error,
          "Não foi possível consultar solípedes ativos/excluídos"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de exclusão
  const handleExcluir = (solipede) => {
    setSolipedeSelecionado(solipede);
    setMotivoExclusao("");
    setMotivoOutro("");
    setObservacao("");
    setSenha("");
    setDataObito("");
    setLocalObito("");
    setDescricaoObito("");
    setConfirmacoesObito(["", "", "", ""]);
    setDadosDocumentoObito(null);
    setErro("");
    setShowModal(true);
  };

  const atualizarConfirmacao = (index, valor) => {
    setConfirmacoesObito((prev) => {
      const proximas = [...prev];
      proximas[index] = valor;
      return proximas;
    });
  };

  const handleAbrirComprovanteExclusao = (item) => {
    setExclusaoSelecionada(item);
    setShowModalComprovanteExclusao(true);
  };

  const handleFecharComprovanteExclusao = () => {
    setShowModalComprovanteExclusao(false);
    setExclusaoSelecionada(null);
  };

  const handleGerarPDFComprovanteExclusao = async () => {
    if (!exclusaoSelecionada) return;

    setGerandoPDFComprovante(true);
    try {
      await gerarReceituarioPDF(
        "comprovante-exclusao-impressao",
        `Exclusao_${exclusaoSelecionada.numero || "solipede"}_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("Erro ao gerar comprovante de exclusão:", err);
    } finally {
      setGerandoPDFComprovante(false);
    }
  };

  const extrairDadosObitoDeObservacao = (texto = "") => {
    const conteudo = String(texto || "");
    const dataMatch = conteudo.match(/Data do obito:\s*(.*)/i) || conteudo.match(/Data do óbito:\s*(.*)/i);
    const localMatch = conteudo.match(/Local do obito:\s*(.*)/i) || conteudo.match(/Local do óbito:\s*(.*)/i);
    const descricaoMatch = conteudo.match(/Descricao:\s*(.*)/i) || conteudo.match(/Descrição:\s*(.*)/i);
    const confirmacoesMatch = conteudo.match(/Confirmacoes:\s*(.*)/i) || conteudo.match(/Confirmações:\s*(.*)/i);

    return {
      dataObito: dataMatch?.[1]?.trim() || null,
      localObito: localMatch?.[1]?.trim() || "—",
      descricao: descricaoMatch?.[1]?.trim() || conteudo || "Sem descrição registrada.",
      confirmacoes: confirmacoesMatch?.[1]
        ? confirmacoesMatch[1]
            .split(",")
            .map((nome) => nome.trim())
            .filter(Boolean)
            .slice(0, 4)
        : [],
    };
  };

  const dadosObitoComprovante = useMemo(() => {
    if (!exclusaoSelecionada) return null;

    const extraidos = extrairDadosObitoDeObservacao(exclusaoSelecionada.observacao || "");

    return {
      dataObito: extraidos.dataObito || (exclusaoSelecionada.data_exclusao ? new Date(exclusaoSelecionada.data_exclusao).toISOString().split("T")[0] : null),
      localObito: extraidos.localObito,
      descricao: extraidos.descricao,
      confirmacoes: extraidos.confirmacoes,
    };
  }, [exclusaoSelecionada]);

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

    if (motivoExclusao === "Óbito") {
      if (!dataObito) {
        setErro("Informe a data do óbito");
        return;
      }

      if (!descricaoObito.trim()) {
        setErro("Informe a descrição do óbito");
        return;
      }

      const totalConfirmacoes = confirmacoesObito.filter((nome) => nome.trim()).length;
      if (totalConfirmacoes === 0) {
        setErro("Informe pelo menos 1 pessoa para confirmação");
        return;
      }
    }

    // Motivo final (se for "Outro", usa o texto customizado)
    const motivoFinal = motivoExclusao === "Outro" ? motivoOutro : motivoExclusao;

    const observacaoFinal = motivoFinal === "Óbito"
      ? [
          observacao?.trim(),
          `Data do óbito: ${dataObito || "—"}`,
          `Local do óbito: ${localObito?.trim() || "—"}`,
          `Descrição: ${descricaoObito?.trim() || "—"}`,
          `Confirmações: ${confirmacoesObito.filter((nome) => nome.trim()).join(", ") || "—"}`,
        ]
          .filter(Boolean)
          .join("\n")
      : observacao;

    try {
      setProcessando(true);
      const resultado = await api.excluirSolipede(
        solipedeSelecionado.numero,
        motivoFinal,
        observacaoFinal,
        senha
      );

      if (resultado.error) {
        setErro(
          buildUserErrorMessage(
            "Falha ao excluir solípede",
            resultado,
            "A API rejeitou a exclusão solicitada"
          )
        );
        return;
      }

      if (motivoFinal === "Óbito") {
        const dadosObito = {
          dataObito,
          localObito,
          descricao: descricaoObito,
          confirmacoes: confirmacoesObito.filter((nome) => nome.trim()),
        };

        setDadosDocumentoObito(dadosObito);

        await new Promise((resolve) => setTimeout(resolve, 250));

        try {
          await gerarReceituarioPDF(
            "obito-template-pdf",
            `Obito_${solipedeSelecionado.nome || "solipede"}_${solipedeSelecionado.numero}_${dataObito || new Date().toISOString().split("T")[0]}.pdf`
          );
        } catch (erroPdf) {
          console.error("Erro ao gerar PDF de óbito:", erroPdf);
          setSucesso("Solípede excluído com sucesso, mas houve falha ao gerar o PDF de óbito.");
          setTimeout(() => {
            setShowModal(false);
            carregarDados();
            setSucesso("");
          }, 2500);
          return;
        }
      }

      setSucesso("Solípede excluído com sucesso!");
      setTimeout(() => {
        setShowModal(false);
        carregarDados();
        setSucesso("");
      }, 2000);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setErro(
        buildUserErrorMessage(
          "Erro de exclusão",
          error,
          "Não foi possível concluir a exclusão do solípede"
        )
      );
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

      {/* Filtros */}
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

      {/* Tabela  */}
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
                  <th>Alocação</th>
                  {visualizacao === "excluidos" && (
                    <>
                      <th>Data Exclusão</th>
                      <th>Motivo</th>
                      <th>Observação</th>
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
                        <td>
                          <span
                            title={item.observacao || "Sem observações"}
                            style={{ cursor: "help" }}
                          >
                            {item.observacao ? (
                              <>
                                {item.observacao?.substring(0, 30)}
                                {item.observacao?.length > 30 ? "..." : ""}
                              </>
                            ) : (
                              "—"
                            )}
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
                        <div className="d-flex gap-2 align-items-center">
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

                          <Button
                            size="sm"
                            variant="outline-secondary"
                            title="Baixar informações da exclusão"
                            onClick={() => handleAbrirComprovanteExclusao(item)}
                          >
                            <BiDetail />
                          </Button>
                        </div>
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
              Observações Adicionais
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Adicione observações adicionais sobre a exclusão (opcional)..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              disabled={processando}
            />
          </Form.Group>

          {motivoExclusao === "Óbito" && (
            <>
              <Card className="mb-3 border-0" style={{ backgroundColor: "#fff3cd" }}>
                <Card.Body>
                  <h6 className="mb-3">Dados obrigatórios para documento de óbito</h6>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          Data do Óbito <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={dataObito}
                          onChange={(e) => setDataObito(e.target.value)}
                          disabled={processando}
                        />
                        <small className="text-muted">
                          Campo livre: aceita backdate e afterdate.
                        </small>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Local do Óbito</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Informe o local do óbito"
                          value={localObito}
                          onChange={(e) => setLocalObito(e.target.value)}
                          disabled={processando}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>
                          Descrição do Óbito <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Descreva o ocorrido"
                          value={descricaoObito}
                          onChange={(e) => setDescricaoObito(e.target.value)}
                          disabled={processando}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr />

                  <Form.Label className="fw-semibold mb-2">
                    Pessoas de confirmação (até 4) <span className="text-danger">*</span>
                  </Form.Label>
                  <Row className="g-2">
                    {confirmacoesObito.map((nome, index) => (
                      <Col md={6} key={index}>
                        <Form.Control
                          type="text"
                          placeholder={`Confirmante ${index + 1}`}
                          value={nome}
                          onChange={(e) => atualizarConfirmacao(index, e.target.value)}
                          disabled={processando}
                          list="confirmacoes-obito-sugestoes"
                          autoComplete="off"
                        />
                      </Col>
                    ))}
                  </Row>
                  <datalist id="confirmacoes-obito-sugestoes">
                    {nomesConfirmacaoSugestoes.map((nomeSugestao) => (
                      <option key={nomeSugestao} value={nomeSugestao} />
                    ))}
                  </datalist>
                  <small className="text-muted d-block mt-2">
                    Preencha pelo menos 1 nome para confirmar o documento.
                  </small>
                </Card.Body>
              </Card>
            </>
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

      <Modal
        show={showModalComprovanteExclusao}
        onHide={handleFecharComprovanteExclusao}
        centered
        style={{ "--bs-modal-width": "min(96vw, 220mm)" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Comprovante de Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-3"
          style={{
            overflowX: "auto",
            background: "#f8f9fa",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div id="comprovante-exclusao-impressao" style={{ width: "210mm", maxWidth: "100%" }}>
            {exclusaoSelecionada && (
              <ObitoTemplate
                solipede={exclusaoSelecionada}
                tratamento={{
                  diagnostico: dadosObitoComprovante?.descricao || exclusaoSelecionada?.observacao || "Documento de exclusão",
                  prescricao: exclusaoSelecionada?.motivo_exclusao || "—",
                  usuario_nome: exclusaoSelecionada?.usuario_nome || usuarioLogado?.nome || "—",
                }}
                usuarioLogado={usuarioLogado}
                dadosObito={dadosObitoComprovante}
              />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFecharComprovanteExclusao}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleGerarPDFComprovanteExclusao} disabled={gerandoPDFComprovante}>
            {gerandoPDFComprovante ? (
              <><Spinner size="sm" className="me-2" />Gerando PDF...</>
            ) : (
              "Gerar PDF"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {dadosDocumentoObito && solipedeSelecionado && (
        <div style={{ position: "fixed", left: "-99999px", top: 0, visibility: "hidden" }}>
          <div id="obito-template-pdf">
            <ObitoTemplate
              solipede={solipedeSelecionado}
              tratamento={{
                diagnostico: descricaoObito,
                prescricao: observacao || "Documento de exclusão por óbito",
              }}
              usuarioLogado={usuarioLogado}
              dadosObito={dadosDocumentoObito}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExclusaoSolipede;
