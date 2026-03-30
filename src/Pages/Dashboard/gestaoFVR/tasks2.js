import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Badge,
  Spinner,
  Form,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsClipboard2 } from "react-icons/bs";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { api } from "../../../services/api";

import TasksTable from "./tabelaTasks/tasksTable";


export default function TaskCreatePage2() {
  const navigate = useNavigate();
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("em_andamento");
  const [filtroUsuario, setFiltroUsuario] = useState("Todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [solipedeNumero, setSolipedeNumero] = useState("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const normalizarLancamento = (registro) => ({
    ...registro,
    tipo: registro.tipo || "-",
    observacao: registro.observacao_clinica || registro.observacao || "",
    diagnosticos: registro.diagnostico || registro.diagnosticos || "",
    recomendacoes: registro.prescricao || registro.recomendacoes || "",
    precisa_baixar: registro.tratamento_precisa_baixar || registro.precisa_baixar || "",
    status_conclusao:
      registro.status_conclusao ||
      registro.tratamento_status ||
      registro.restricao_status ||
      registro.dieta_status ||
      registro.suplementacao_status ||
      registro.movimentacao_status ||
      registro.vacinacao_status ||
      "",
    data_conclusao: registro.tratamento_data_conclusao || registro.data_conclusao || null,
  });

  const normalizarStatus = (valor = "") =>
    String(valor)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

  const carregarLancamentos = useCallback(async () => {
    try {
      setLoading(true);

      console.log("🔄 Iniciando carregamento de lançamentos...");
      const data = await api.listarNovoModeloProntuarios();

      console.log("📦 Dados retornados:", data);
      console.log("📊 Tipo dos dados:", typeof data);
      console.log("📊 É array?", Array.isArray(data));
      console.log("📊 Quantidade:", Array.isArray(data) ? data.length : "não é array");

      if (Array.isArray(data)) {
        const lancamentosNormalizados = data.map(normalizarLancamento);

        console.log("✅ Setando lançamentos:", lancamentosNormalizados.length, "registro(s) do prontuario_geral");
        setLancamentos(lancamentosNormalizados);
      } else {
        console.log("⚠️ Dados não são array, setando vazio");
        setLancamentos([]);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar lançamentos:", err);
      setLancamentos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarLancamentos();
  }, [carregarLancamentos]);

  const getTipoColor = (tipo) => {
    const cores = {
      // "Consulta Clínica": "primary",
      "Tratamento": "danger",
      "Restrições": "warning",
      "Dieta": "success",
      "Suplementação": "info",
      "Movimentações": "primary",
      //"Exame": "secondary",
      // "Vacinação": "success",
      // "Vermifugação": "info",
      // "Exames AIE / Mormo": "warning",
    };
    return cores[tipo] || "secondary";
  };

  // Extrair usuários únicos dos lançamentos
  const usuariosDisponiveis = ["Todos", ...new Set(
    lancamentos
      .map(l => l.usuario_nome)
      .filter(nome => nome && nome.trim() !== "")
      .sort()
  )];

  

  // Filtros combinados
  const lancamentosFiltrados = lancamentos.filter((l) => {
    const statusLancamento = normalizarStatus(l.status_conclusao);

    // Filtro por número do solípede
    if (solipedeNumero && !String(l.numero_solipede || "").includes(solipedeNumero.trim())) return false;

    // Filtro por tipo
    if (filtroTipo !== "Todos" && l.tipo !== filtroTipo) return false;

    // Filtro por status
    if (filtroStatus !== "Todos" && statusLancamento !== filtroStatus) return false;
    
    // Filtro por usuário
    if (filtroUsuario !== "Todos" && l.usuario_nome !== filtroUsuario) return false;
    
    // Filtro por data de início
    if (dataInicio) {
      const dataLancamento = new Date(l.data_criacao);
      const dataInicioFiltro = new Date(dataInicio + "T00:00:00");
      if (dataLancamento < dataInicioFiltro) return false;
    }
    
    // Filtro por data de fim
    if (dataFim) {
      const dataLancamento = new Date(l.data_criacao);
      const dataFimFiltro = new Date(dataFim + "T23:59:59");
      if (dataLancamento > dataFimFiltro) return false;
    }
    
    return true;
  });

  // Cálculos de paginação
  const totalPages = itemsPerPage === "Todos"
    ? 1
    : Math.ceil(lancamentosFiltrados.length / itemsPerPage);

  const indexOfLastItem = itemsPerPage === "Todos"
    ? lancamentosFiltrados.length
    : currentPage * itemsPerPage;

  const indexOfFirstItem = itemsPerPage === "Todos"
    ? 0
    : indexOfLastItem - itemsPerPage;

  const currentItems = lancamentosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  // Reset da página ao mudar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroTipo, filtroStatus, filtroUsuario, dataInicio, dataFim, solipedeNumero, itemsPerPage]);

  const tiposDisponiveis = ["Todos", ...new Set(lancamentos.map((l) => l.tipo).filter(Boolean))];

  const contagemPorTipo = lancamentos.reduce((acc, l) => {
    acc[l.tipo] = (acc[l.tipo] || 0) + 1;
    return acc;
  }, {});

  const abrirProntuario = (numeroSolipede) => {
    navigate(`/dashboard/gestaofvr/solipede/prontuario/edit/${numeroSolipede}`);
  };

  const registrosFiltrados = currentItems;

  const formatarData = (valor) =>
    valor ? new Date(valor).toLocaleDateString("pt-BR") : "-";

  const formatarStatus = (valor) => {
    const status = normalizarStatus(valor);
    if (status === "em_andamento") return "Em andamento";
    if (status === "concluido") return "Concluido";
    return valor || "-";
  };

  const limparTrechoNomeArquivo = (valor) =>
    String(valor || "todos")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase();

  const montarNomeArquivo = (escopo) => {
    const dataAtual = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const tipo = limparTrechoNomeArquivo(filtroTipo);
    const status = limparTrechoNomeArquivo(filtroStatus);
    const usuario = limparTrechoNomeArquivo(filtroUsuario);
    const sufixoEscopo = escopo === "pagina" ? "pagina_atual" : "filtrados";

    return `lancamentos_prontuario_${tipo}_${status}_${usuario}_${sufixoEscopo}_${dataAtual}.xlsx`;
  };

  const gerarDadosExportacao = (registros) => {
    const tipoSelecionado = filtroTipo;

    if (tipoSelecionado === "Tratamento") {
      return registros.map((registro, index) => ({
        "Nº": index + 1,
        "Solípede": registro.numero_solipede || "-",
        "Baia": registro.solipede_baia || "-",
        "Data": formatarData(registro.data_criacao),
        "Usuário": registro.usuario_nome || "-",
        "Diagnóstico": registro.diagnosticos || "-",
        "Observações": registro.observacao || "-",
        "Prescrição": registro.recomendacoes || "-",
        "Precisa Baixar": registro.precisa_baixar || "-",
        "Status Conclusão": formatarStatus(registro.status_conclusao),
      }));
    }

    if (tipoSelecionado === "Restrições") {
      return registros.map((registro, index) => ({
        "Nº": index + 1,
        "Solípede": registro.numero_solipede || "-",
        "Baia": registro.solipede_baia || "-",
        "Data": formatarData(registro.data_criacao),
        "Usuário": registro.usuario_nome || "-",
        "Restrição": registro.restricao || registro.observacao || "-",
        "Recomendações": registro.recomendacoes || "-",
        "Data Validade": formatarData(registro.restricao_data_validade || registro.data_validade),
        "Status Conclusão": formatarStatus(registro.status_conclusao),
      }));
    }

    if (tipoSelecionado === "Dieta") {
      return registros.map((registro, index) => ({
        "Nº": index + 1,
        "Solípede": registro.numero_solipede || "-",
        "Baia": registro.solipede_baia || "-",
        "Data": formatarData(registro.data_criacao),
        "Usuário": registro.usuario_nome || "-",
        "Descrição": registro.descricao || registro.observacao || "-",
        "Recomendações": registro.recomendacoes || "-",
        "Data Fim": formatarData(registro.data_fim),
        "Status Conclusão": formatarStatus(registro.status_conclusao),
      }));
    }

    if (tipoSelecionado === "Suplementação") {
      return registros.map((registro, index) => ({
        "Nº": index + 1,
        "Solípede": registro.numero_solipede || "-",
        "Baia": registro.solipede_baia || "-",
        "Data": formatarData(registro.data_criacao),
        "Usuário": registro.usuario_nome || "-",
        "Produto": registro.suplementacao_produto || registro.produto || "-",
        "Dose": registro.suplementacao_dose || registro.dose || "-",
        "Frequência": registro.suplementacao_frequencia || registro.frequencia || "-",
        "Observações": registro.suplementacao_observacoes || registro.observacao || "-",
        "Status Conclusão": formatarStatus(registro.status_conclusao),
      }));
    }

    if (tipoSelecionado === "Movimentação") {
      return registros.map((registro, index) => ({
        "Nº": index + 1,
        "Solípede": registro.numero_solipede || "-",
        "Baia": registro.solipede_baia || "-",
        "Data": formatarData(registro.data_criacao),
        "Usuário": registro.usuario_nome || "-",
        "Origem": registro.movimentacao_origem || registro.origem || "-",
        "Destino": registro.destino || "-",
        "Motivo": registro.motivo || registro.observacao || "-",
        "Data Movimentação": formatarData(registro.data_movimentacao),
        "Status Conclusão": formatarStatus(registro.status_conclusao),
      }));
    }

    return registros.map((registro, index) => ({
      "Nº": index + 1,
      "Solípede": registro.numero_solipede || "-",
      "Baia": registro.solipede_baia || "-",
      "Tipo": registro.tipo || "-",
      "Data": formatarData(registro.data_criacao),
      "Usuário": registro.usuario_nome || "-",
      "Observações": registro.observacao || "-",
      "Diagnóstico": registro.diagnosticos || "-",
      "Prescrição/Recomendações": registro.recomendacoes || "-",
      "Origem": registro.movimentacao_origem || registro.origem || "-",
      "Destino": registro.destino || "-",
      "Status Conclusão": formatarStatus(registro.status_conclusao),
    }));
  };

  const gerarResumoExportacao = (registros, escopo) => [
    { Filtro: "Escopo", Valor: escopo === "pagina" ? "Página atual" : "Resultados filtrados" },
    { Filtro: "Tipo", Valor: filtroTipo },
    { Filtro: "Status", Valor: filtroStatus === "Todos" ? "Todos" : formatarStatus(filtroStatus) },
    { Filtro: "Usuário", Valor: filtroUsuario },
    { Filtro: "Nº Solípede", Valor: solipedeNumero || "Todos" },
    { Filtro: "Data Início", Valor: dataInicio || "Sem filtro" },
    { Filtro: "Data Fim", Valor: dataFim || "Sem filtro" },
    { Filtro: "Total exportado", Valor: registros.length },
  ];

  // Função para exportar dados para Excel
  const exportarParaExcel = (escopo = "filtrados") => {
    try {
      const origem = escopo === "pagina" ? registrosFiltrados : lancamentosFiltrados;
      if (!origem.length) {
        alert("Nao ha registros para exportar com os filtros atuais.");
        return;
      }

      const dadosExportacao = gerarDadosExportacao(origem);
      const dadosResumo = gerarResumoExportacao(origem, escopo);

      // Criar workbook com resumo + lançamentos
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);
      const wsResumo = XLSX.utils.json_to_sheet(dadosResumo);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");
      XLSX.utils.book_append_sheet(wb, ws, "Lançamentos");

      // Ajustar largura das colunas
      const chaves = Object.keys(dadosExportacao[0] || {});
      ws["!cols"] = chaves.map((chave) => ({ wch: Math.min(Math.max(chave.length + 4, 14), 45) }));
      wsResumo["!cols"] = [{ wch: 22 }, { wch: 35 }];

      // Gerar nome do arquivo com filtros aplicados
      const nomeArquivo = montarNomeArquivo(escopo);

      // Fazer download
      XLSX.writeFile(wb, nomeArquivo);

      console.log('✅ Exportação realizada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao exportar para Excel:', error);
      alert('Erro ao exportar dados para Excel. Tente novamente.');
    }
  };

    const mensagemPersonalizada = [
      {title: 'Tratamento', message: 'Observações clínicas'},
      {title: 'Restrições', message: 'Detalhes da restrição'},
      {title: 'Dieta', message: 'Observações'},
      {title: 'Suplementação', message: 'Detalhes da suplementação prescrita'},
      {title: 'Movimentação', message: 'Detalhes da movimentação'},
    ]


  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Carregando lançamentos...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* TÍTULO */}
      <Row className="mb-4">
        <Col>
          <h5 className="fw-semibold">
            <BsClipboard2 className="me-2" />
            Lançamentos de Prontuário
          </h5>
          <small className="text-muted">
            Histórico completo de todos os lançamentos veterinários
          </small>
        </Col>
      </Row>

      <Row className="g-4">
        {/* COLUNA ESQUERDA - Filtros e Estatísticas */}
        <Col xl={3} lg={4}>
          {/* FILTRO POR TIPO */}
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <h6 className="mb-3">Filtrar por Tipo</h6>
              <Form.Select
                size="sm"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                {tiposDisponiveis.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo} {tipo !== "Todos" && contagemPorTipo[tipo] ? `(${contagemPorTipo[tipo]})` : ""}
                  </option>
                ))}
              </Form.Select>
            </Card.Body>
          </Card>

          {/* ESTATÍSTICAS */}
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Estatísticas</h6>
              <div className="d-flex flex-column gap-2">
                <div>
                  <strong>Total de Lançamentos:</strong>
                  <Badge bg="primary" className="ms-2">
                    {lancamentos.length}
                  </Badge>
                </div>
                <hr className="my-2" />
                {Object.entries(contagemPorTipo).map(([tipo, qtd]) => (
                  <div
                    key={tipo}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <Badge bg={getTipoColor(tipo)}>{tipo}</Badge>
                    <span className="text-muted">{qtd}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUNA DIREITA - Lista de Lançamentos */}
        {/* FechamentoCampo de filtros de TASKS */}
        <Col xl={9} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <Row className="align-items-center mb-3">
                <Col md={6}>
                  <h6 className="mb-0">
                    {filtroTipo !== "Todos" ? `Lançamentos: ${filtroTipo}` : "Todos os Lançamentos"}
                    <Badge bg="secondary" className="ms-2">
                      {lancamentosFiltrados.length}
                    </Badge>
                  </h6>
                </Col>
                <Col md={6} className="text-end">
                  <div className="d-flex align-items-center justify-content-end gap-2">
                    <small className="text-muted">Exibir:</small>
                    <Form.Select
                      size="sm"
                      style={{ width: "100px" }}
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(e.target.value === "Todos" ? "Todos" : Number(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value="Todos">Todos</option>
                    </Form.Select>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => exportarParaExcel("filtrados")}
                      className="d-flex align-items-center gap-1"
                      title="Exportar resultados filtrados"
                    >
                      <FaFileExcel /> Exporte Com Filtros
                    </Button>
                  </div>
                </Col>
              </Row>
              
              {/* Linha de Filtros Avançados */}
              <Row className="g-2 align-items-end">
                <Col md={2} sm={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">Nº Solipede</Form.Label>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="número"
                      value={solipedeNumero}
                      onChange={(e) => setSolipedeNumero(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} sm={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">Status</Form.Label>
                    <Form.Select
                      size="sm"
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                      <option value="Todos">Todos</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="concluido">Concluído</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} sm={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">👤 Filtrar por Usuário</Form.Label>
                    <Form.Select
                      size="sm"
                      value={filtroUsuario}
                      onChange={(e) => setFiltroUsuario(e.target.value)}
                    >
                      {usuariosDisponiveis.map((usuario) => (
                        <option key={usuario} value={usuario}>
                          {usuario}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} sm={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">📅 Data Início</Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} sm={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">📅 Data Fim</Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} sm={12}>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() => {
                      setSolipedeNumero("");
                      setFiltroStatus("Todos");
                      setFiltroUsuario("Todos");
                      setDataInicio("");
                      setDataFim("");
                    }}
                  >
                    🔄 Limpar
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            {/* FechamentoCampo de filtros de TASKS */}

            {/* Campo de Lançamentos de TASKS */}
            <Card.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <TasksTable 
                    onConsultarRegistro={abrirProntuario} 
                    registros={registrosFiltrados} 
                    mensagemPersonalizada={mensagemPersonalizada} 
                  />
            </Card.Body>

            {/* Paginação */}
            {itemsPerPage !== "Todos" && totalPages > 1 && (


              
              <Card.Footer className="bg-white border-top">
               
         
                <Row className="align-items-center">
                  <Col md={6}>
                    <small className="text-muted">
                      Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, lancamentosFiltrados.length)} de {lancamentosFiltrados.length} registros
                    </small>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex justify-content-end align-items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        ← Anterior
                      </Button>
                      <Badge bg="primary" className="px-3">
                        Página {currentPage} de {totalPages}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Próxima →
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Footer>
            )}
          </Card>
        </Col>

        
      </Row>
    </Container>
  );
}
