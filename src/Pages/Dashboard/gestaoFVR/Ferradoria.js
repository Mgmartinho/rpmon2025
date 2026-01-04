import { useEffect, useState, useMemo } from "react";
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
  BsCheckCircle,
  BsXCircle,
  BsExclamationTriangle,
  BsClockHistory,
  BsFilter,
  BsSearch,
  BsFileEarmarkExcel,
  BsFileEarmarkPdf,
  BsHammer,
} from "react-icons/bs";

import { GiHorseshoe } from "react-icons/gi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../../../services/api";
import "./ferradoriastyles.css";

const Ferradoria = () => {
  // Estilos específicos para esta página


  const [solipedes, setSolipedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("TODOS"); // TODOS, EM_DIA, PROXIMO_VENCIMENTO, VENCIDO
  
  // Modal de novo ferrageamento
  const [showModal, setShowModal] = useState(false);
  const [solipedeSelecionado, setSolipedeSelecionado] = useState(null);
  const [dataFerrageamento, setDataFerrageamento] = useState("");
  const [prazoValidade, setPrazoValidade] = useState(32); // dias padrão
  const [tamanhoFerradura, setTamanhoFerradura] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [processando, setProcessando] = useState(false);

  // Modal de histórico
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [historicoSolipede, setHistoricoSolipede] = useState([]);

  // Filtros
  const [filtroNumero, setFiltroNumero] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroAlocacao, setFiltroAlocacao] = useState("TODOS");
  const [filtroPeriodoInicio, setFiltroPeriodoInicio] = useState("");
  const [filtroPeriodoFim, setFiltroPeriodoFim] = useState("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados de ferrageamento...');
      
      // Buscar solípedes e ferrageamentos com status
      const [solipedesData, ferrageamentosData] = await Promise.all([
        api.listarSolipedes(),
        api.listarFerrageamentosComStatus()
      ]);
      
      console.log('📊 Solípedes recebidos:', solipedesData?.length || 0);
      console.log('🔨 Ferrageamentos recebidos:', ferrageamentosData?.length || 0);
      
      if (Array.isArray(solipedesData)) {
        // Criar um mapa de ferrageamentos por número de solípede
        const ferrageamentosMap = {};
        if (Array.isArray(ferrageamentosData)) {
          ferrageamentosData.forEach(ferr => {
            ferrageamentosMap[ferr.solipede_numero] = {
              ultimoFerrageamento: ferr.data_ferrageamento,
              proximoFerrageamento: ferr.proximo_ferrageamento,
              diasRestantes: ferr.dias_restantes,
              statusFerrageamento: ferr.status_ferrageamento,
              prazoValidade: ferr.prazo_validade
            };
          });
        }

        console.log('📋 Ferrageamentos mapeados:', Object.keys(ferrageamentosMap).length);

        // Filtrar apenas solípedes alocados em RPMon ou Barro Branco
        const solipedesFiltrados = solipedesData.filter(sol => {
          const alocacao = sol.alocacao?.toLowerCase() || '';
          return alocacao.includes('rpmon') || alocacao.includes('barro branco');
        });

        console.log('🏢 Solípedes filtrados (RPMon/Barro Branco):', solipedesFiltrados.length);

        // Combinar dados
        const solipedesComFerrageamento = solipedesFiltrados.map(sol => {
          const ferrInfo = ferrageamentosMap[sol.numero];
          return {
            ...sol,
            ultimoFerrageamento: ferrInfo?.ultimoFerrageamento || null,
            proximoFerrageamento: ferrInfo?.proximoFerrageamento || null,
            diasRestantes: ferrInfo?.diasRestantes || null,
            statusFerrageamento: ferrInfo?.statusFerrageamento || 'PENDENTE',
            prazoValidade: ferrInfo?.prazoValidade || 45
          };
        });
        
        setSolipedes(solipedesComFerrageamento);
        console.log('✅ Dados carregados e combinados com sucesso!');
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setErro("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Indicadores
  const indicadores = useMemo(() => {
    const total = solipedes.length;
    const emDia = solipedes.filter(s => s.statusFerrageamento === 'EM_DIA').length;
    const proximoVencimento = solipedes.filter(s => s.statusFerrageamento === 'PROXIMO_VENCIMENTO').length;
    const vencido = solipedes.filter(s => s.statusFerrageamento === 'VENCIDO').length;
    const pendente = solipedes.filter(s => s.statusFerrageamento === 'PENDENTE').length;
    
    return { total, emDia, proximoVencimento, vencido, pendente };
  }, [solipedes]);

  // Filtrar dados
  const dadosFiltrados = useMemo(() => {
    return solipedes.filter((item) => {
      // Filtro por status
      if (statusFilter !== "TODOS" && item.statusFerrageamento !== statusFilter) {
        return false;
      }

      // Filtro por alocação
      if (filtroAlocacao !== "TODOS") {
        const alocacao = item.alocacao?.toLowerCase() || '';
        if (filtroAlocacao === "RPMON" && !alocacao.includes('rpmon')) {
          return false;
        }
        if (filtroAlocacao === "BARRO_BRANCO" && !alocacao.includes('barro branco')) {
          return false;
        }
      }

      // Filtro por número
      const matchNumero = filtroNumero
        ? item.numero.toString().includes(filtroNumero)
        : true;

      // Filtro por nome
      const matchNome = filtroNome
        ? item.nome?.toLowerCase().includes(filtroNome.toLowerCase())
        : true;

      return matchNumero && matchNome;
    });
  }, [solipedes, statusFilter, filtroAlocacao, filtroNumero, filtroNome]);

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dadosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dadosFiltrados.length / itemsPerPage);

  // Abrir modal de novo ferrageamento
  const handleNovoFerrageamento = (solipede) => {
    setSolipedeSelecionado(solipede);
    setDataFerrageamento(new Date().toISOString().split('T')[0]);
    setPrazoValidade(32);
    setTamanhoFerradura("");
    setResponsavel("");
    setObservacoes("");
    setErro("");
    setSucesso("");
    setShowModal(true);
  };

  // Salvar ferrageamento
  const salvarFerrageamento = async () => {
    setErro("");
    setSucesso("");

    if (!dataFerrageamento) {
      setErro("Data do ferrageamento é obrigatória");
      return;
    }

    if (!prazoValidade || prazoValidade <= 0) {
      setErro("Prazo de validade deve ser maior que zero");
      return;
    }

    try {
      setProcessando(true);
      
      const dados = {
        solipede_numero: solipedeSelecionado.numero,
        data_ferrageamento: dataFerrageamento,
        prazo_validade: prazoValidade,
        tamanho_ferradura: tamanhoFerradura || null,
        responsavel: responsavel || null,
        observacoes: observacoes || null
      };

      const resultado = await api.criarFerrageamento(dados);

      console.log('📥 Resultado da criação:', resultado);

      if (resultado.error) {
        setErro(resultado.error);
        return;
      }

      setSucesso("Ferrageamento registrado com sucesso!");
      
      // Aguardar um momento e recarregar os dados
      setTimeout(async () => {
        setShowModal(false);
        setSucesso("");
        await carregarDados(); // Recarregar dados imediatamente
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setErro("Erro ao salvar ferrageamento");
    } finally {
      setProcessando(false);
    }
  };

  // Ver histórico
  const verHistorico = async (solipede) => {
    setSolipedeSelecionado(solipede);
    try {
      const historico = await api.historicoFerrageamento(solipede.numero);
      setHistoricoSolipede(historico || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      setHistoricoSolipede([]);
    }
    setShowHistoricoModal(true);
  };

  // Exportar Excel
  const exportarExcel = () => {
    const dadosExport = dadosFiltrados.map(item => ({
      Numero: item.numero,
      Nome: item.nome,
      Alocacao: item.alocacao,
      'Último Ferrageamento': item.ultimoFerrageamento ? new Date(item.ultimoFerrageamento).toLocaleDateString('pt-BR') : 'Nunca',
      'Próximo Ferrageamento': item.proximoFerrageamento ? new Date(item.proximoFerrageamento).toLocaleDateString('pt-BR') : '-',
      'Dias Restantes': item.diasRestantes !== null ? item.diasRestantes : '-',
      Status: item.statusFerrageamento
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ferradoria");
    XLSX.writeFile(workbook, `ferradoria_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Relatório de Ferradoria", 14, 15);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);

    const tableData = dadosFiltrados.map(item => [
      item.numero,
      item.nome || '-',
      item.alocacao || '-',
      item.ultimoFerrageamento ? new Date(item.ultimoFerrageamento).toLocaleDateString('pt-BR') : 'Nunca',
      item.proximoFerrageamento ? new Date(item.proximoFerrageamento).toLocaleDateString('pt-BR') : '-',
      item.diasRestantes !== null ? item.diasRestantes : '-',
      item.statusFerrageamento
    ]);

    autoTable(doc, {
      head: [['Nº', 'Nome', 'Alocação', 'Último Ferr.', 'Próximo Ferr.', 'Dias Rest.', 'Status']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 110, 253] },
    });

    doc.save(`ferradoria_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Badge de status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'EM_DIA':
        return <Badge bg="success">Em Dia</Badge>;
      case 'PROXIMO_VENCIMENTO':
        return <Badge bg="warning">Próximo Vencimento</Badge>;
      case 'VENCIDO':
        return <Badge bg="danger">Vencido</Badge>;
      case 'PENDENTE':
        return <Badge bg="secondary">Pendente</Badge>;
      default:
        return <Badge bg="secondary">-</Badge>;
    }
  };
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      
      <div className="container-fluid py-4">
      {/* Header */}
      <Row className="mb-4 g-3">
        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <GiHorseshoe size={50} className="text-primary me-3" />
                <div>
                  <h4 className="mb-1">
                    <BsHammer className="me-2" />
                    Controle de Ferradoria
                  </h4>
                  <small className="text-muted">
                    Gerenciamento de ferrageamento e manutenção de cascos
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Botões de Exportação */}
        <Col md={2}>
          <Card
            className="h-100 text-center shadow-sm border-start"
            onClick={exportarExcel}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <BsFileEarmarkExcel size={22} className="mb-2 text-success" />
              <small className="fw-semibold">Exportar Excel</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card
            className="h-100 text-center shadow-sm border-start"
            onClick={exportarPDF}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <BsFileEarmarkPdf size={22} className="mb-2 text-danger" />
              <small className="fw-semibold">Exportar PDF</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Indicadores */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card
            className="indicator-card indicator-total"
            onClick={() => setStatusFilter("TODOS")}
          >
            <Card.Body>
              <div className="indicator-icon">
                <GiHorseshoe />
              </div>
              <small>Total de Solípedes</small>
              <h4>{indicadores.total}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="indicator-card indicator-success"
            onClick={() => setStatusFilter("EM_DIA")}
          >
            <Card.Body>
              <div className="indicator-icon">
                <BsCheckCircle />
              </div>
              <small>Em Dia</small>
              <h4>{indicadores.emDia}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="indicator-card indicator-warning"
            onClick={() => setStatusFilter("PROXIMO_VENCIMENTO")}
          >
            <Card.Body>
              <div className="indicator-icon">
                <BsExclamationTriangle />
              </div>
              <small>Próximo Vencimento</small>
              <h4>{indicadores.proximoVencimento}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="indicator-card indicator-danger"
            onClick={() => setStatusFilter("VENCIDO")}
          >
            <Card.Body>
              <div className="indicator-icon">
                <BsXCircle />
              </div>
              <small>Vencido</small>
              <h4>{indicadores.vencido}</h4>
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
            <Col md={2}>
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
            <Col md={3}>
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
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <BsFilter className="me-2" />
                  Alocação
                </Form.Label>
                <Form.Select
                  value={filtroAlocacao}
                  onChange={(e) => setFiltroAlocacao(e.target.value)}
                  className="border-2"
                >
                  <option value="TODOS">Todas</option>
                  <option value="RPMON">RPMon</option>
                  <option value="BARRO_BRANCO">Barro Branco</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold">Data Início</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroPeriodoInicio}
                  onChange={(e) => setFiltroPeriodoInicio(e.target.value)}
                  className="border-2"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold">Data Fim</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroPeriodoFim}
                  onChange={(e) => setFiltroPeriodoFim(e.target.value)}
                  className="border-2"
                />
              </Form.Group>
            </Col>
            <Col md={1} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setFiltroNumero("");
                  setFiltroNome("");
                  setFiltroAlocacao("TODOS");
                  setFiltroPeriodoInicio("");
                  setFiltroPeriodoFim("");
                }}
              >
                <BsXCircle className="me-2" />
                Limpar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">
            <GiHorseshoe className="me-2 text-primary" />
            Controle de Ferrageamento
          </h5>
          <Badge bg="primary" className="px-3 py-2">
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
                  <th>Alocação</th>
                  <th>Último Ferrageamento</th>
                  <th>Próximo Ferrageamento</th>
                  <th>Dias Restantes</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.numero}>
                    <td className="fw-bold">{item.numero}</td>
                    <td>{item.nome || "—"}</td>
                    <td>
                      <span 
                        onClick={() => {
                          const alocacao = item.alocacao?.toLowerCase() || '';
                          if (alocacao.includes('rpmon')) {
                            setFiltroAlocacao('RPMON');
                          } else if (alocacao.includes('barro branco')) {
                            setFiltroAlocacao('BARRO_BRANCO');
                          }
                        }}
                        title="Clique para filtrar por esta alocação"
                      >
                        {item.alocacao || "—"}
                      </span>
                    </td>
                    <td>
                      {item.ultimoFerrageamento
                        ? new Date(item.ultimoFerrageamento).toLocaleDateString('pt-BR')
                        : <span className="text-muted">Nunca</span>}
                    </td>
                    <td>
                      {item.proximoFerrageamento
                        ? new Date(item.proximoFerrageamento).toLocaleDateString('pt-BR')
                        : "—"}
                    </td>
                    <td>
                      {item.diasRestantes !== null ? (
                        <span className={item.diasRestantes < 0 ? 'text-danger fw-bold' : item.diasRestantes <= 7 ? 'text-warning fw-bold' : 'text-success'}>
                          {item.diasRestantes} dias
                        </span>
                      ) : "—"}
                    </td>
                    <td>{getStatusBadge(item.statusFerrageamento)}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        onClick={() => handleNovoFerrageamento(item)}
                      >
                        <BsHammer /> Ferrar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() => verHistorico(item)}
                      >
                        <BsClockHistory /> Histórico
                      </Button>
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

      {/* Modal de Novo Ferrageamento */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="d-flex align-items-center">
            <div style={{
              backgroundColor: '#e7f1ff',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <BsHammer className="text-primary" size={20} />
            </div>
            Registrar Ferrageamento
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

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Data do Ferrageamento <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dataFerrageamento}
                  onChange={(e) => setDataFerrageamento(e.target.value)}
                  disabled={processando}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Prazo de Validade (dias) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={prazoValidade}
                  onChange={(e) => setPrazoValidade(Number(e.target.value))}
                  disabled={processando}
                />
                <Form.Text className="text-muted">
                  Padrão: 32 dias
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tamanho da Ferradura</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: 0, 1, 2, 3, 4, 5..."
                  value={tamanhoFerradura}
                  onChange={(e) => setTamanhoFerradura(e.target.value)}
                  disabled={processando}
                />
                <Form.Text className="text-muted">
                  Informe o tamanho/número da ferradura
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Responsável pelo Ferrageamento</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nome do ferrador ou seção responsável"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  disabled={processando}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Observações sobre o ferrageamento..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={processando}
            />
          </Form.Group>

          {dataFerrageamento && prazoValidade && (
            <Alert variant="info">
              <strong>Próximo ferrageamento previsto:</strong>{' '}
              {new Date(new Date(dataFerrageamento).getTime() + prazoValidade * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
            </Alert>
          )}
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
            variant="primary"
            onClick={salvarFerrageamento}
            disabled={processando}
          >
            {processando ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              <>
                <BsCheckCircle className="me-2" />
                Registrar Ferrageamento
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Histórico */}
      <Modal show={showHistoricoModal} onHide={() => setShowHistoricoModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="d-flex align-items-center">
            <div style={{
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <BsClockHistory className="text-warning" size={20} />
            </div>
            Histórico de Ferrageamentos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {solipedeSelecionado && (
            <div className="mb-3">
              <strong>Solípede:</strong> {solipedeSelecionado.numero} - {solipedeSelecionado.nome || "—"}
            </div>
          )}

          {historicoSolipede.length === 0 ? (
            <Alert variant="info">
              <BsXCircle className="me-2" />
              Nenhum ferrageamento registrado para este solípede.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tamanho</th>
                  <th>Responsável</th>
                  <th>Prazo (dias)</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {[...historicoSolipede]
                  .sort((a, b) => new Date(b.data_ferrageamento) - new Date(a.data_ferrageamento))
                  .map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.data_ferrageamento).toLocaleDateString('pt-BR')}</td>
                      <td>{item.tamanho_ferradura || "—"}</td>
                      <td>{item.responsavel || "—"}</td>
                      <td>{item.prazo_validade} dias</td>
                      <td>{item.observacoes || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowHistoricoModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
    </>
  );
};

export default Ferradoria;
