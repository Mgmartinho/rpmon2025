import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  BsCalendarCheck,
  BsCheckCircle,
  BsExclamationTriangle,
  BsFileEarmarkExcel,
  BsFileEarmarkPdf,
  BsFilter,
  BsSearch,
  BsXCircle,
} from "react-icons/bs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../../../services/api";
import { buildUserErrorMessage } from "../../../utils/errorHandling";
import "./ferradoriastyles.css";

const STATUS = {
  EM_DIA: "EM_DIA",
  PROXIMO_VENCIMENTO: "PROXIMO_VENCIMENTO",
  VENCIDO: "VENCIDO",
  PENDENTE: "PENDENTE",
};

const OPCOES_ALOCACAO = [
  "RPMon",
  "Barro Branco",
  "Escola de Equitação do Exército",
  "Avaré",
  "Bauru",
  "Campinas",
  "Taubaté",
  "Colina",
  "Itapetininga",
  "Marília",
  "Mauá",
  "P. Prudente",
  "Hospital Veterinário",
  "Ribeirão Preto",
  "Rio de Janeiro",
  "Santos",
  "São Bernardo do Campo",
  "Sorocaba",
  "São José do Rio Preto",
  "Barretos",
  "Representação",
];

const normalizarTexto = (valor = "") =>
  String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const correspondeFiltroAlocacao = (alocacao, filtro) => {
  if (filtro === "TODOS") return true;

  const alocacaoNormalizada = normalizarTexto(alocacao);
  const filtroNormalizado = normalizarTexto(filtro);

  return alocacaoNormalizada === filtroNormalizado;
};

const toDate = (valor) => {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
};

const toDateISO = (data) => {
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) return "-";
  return data.toLocaleDateString("pt-BR");
};

const diffInDays = (dataAlvo) => {
  if (!(dataAlvo instanceof Date)) return null;
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const inicioAlvo = new Date(dataAlvo.getFullYear(), dataAlvo.getMonth(), dataAlvo.getDate());
  const umDiaMs = 24 * 60 * 60 * 1000;
  return Math.round((inicioAlvo.getTime() - inicioHoje.getTime()) / umDiaMs);
};

const classificarPrazo = (dataValidade) => {
  if (!(dataValidade instanceof Date)) {
    return { status: STATUS.PENDENTE, diasRestantes: null };
  }

  const diasRestantes = diffInDays(dataValidade);

  if (diasRestantes < 0) {
    return { status: STATUS.VENCIDO, diasRestantes };
  }

  if (diasRestantes <= 15) {
    return { status: STATUS.PROXIMO_VENCIMENTO, diasRestantes };
  }

  return { status: STATUS.EM_DIA, diasRestantes };
};

const escolherRegistroMaisRecente = (registros, extrairDataBase) => {
  if (!Array.isArray(registros) || registros.length === 0) return null;

  return [...registros]
    .map((item) => ({ item, dataBase: toDate(extrairDataBase(item)) }))
    .filter((entry) => entry.dataBase)
    .sort((a, b) => b.dataBase.getTime() - a.dataBase.getTime())[0]?.item || null;
};

const normalizarAieMormo = (item) => {
  const registro = item || {};
  const dataExame = toDate(registro.data_exame || registro.aiemormo_data_exame);
  const validadeDias = Number(registro.validade || registro.aiemormo_validade || 0);

  let dataValidade = null;
  if (dataExame && validadeDias > 0) {
    dataValidade = new Date(dataExame.getTime() + validadeDias * 24 * 60 * 60 * 1000);
  }

  return {
    resultado: registro.resultado || registro.aiemormo_resultado || "-",
    dataAplicacao: dataExame,
    dataValidade,
    validadeDias: validadeDias > 0 ? validadeDias : null,
  };
};

const labelStatus = {
  [STATUS.EM_DIA]: "Em dia",
  [STATUS.PROXIMO_VENCIMENTO]: "Próximo vencimento",
  [STATUS.VENCIDO]: "Vencido",
  [STATUS.PENDENTE]: "Pendente",
};

const badgeStatus = (status) => {
  if (status === STATUS.EM_DIA) return <Badge bg="success">Em dia</Badge>;
  if (status === STATUS.PROXIMO_VENCIMENTO) return <Badge bg="warning">Próximo vencimento</Badge>;
  if (status === STATUS.VENCIDO) return <Badge bg="danger">Vencido</Badge>;
  return <Badge bg="secondary">Pendente</Badge>;
};

const criarRegistroVazio = (sol) => ({
  ...sol,
  prontuarioId: null,
  aieMormo: { resultado: "-", dataAplicacao: null, dataValidade: null, validadeDias: null },
  statusAieMormo: STATUS.PENDENTE,
  diasParaVencimento: null,
  statusGeral: STATUS.PENDENTE,
  proximoCriticoDias: null,
});

const processarEmLotes = async (itens, tamanhoLote, processador) => {
  const resultados = [];

  for (let i = 0; i < itens.length; i += tamanhoLote) {
    const lote = itens.slice(i, i + tamanhoLote);
    const loteProcessado = await Promise.all(lote.map(processador));
    resultados.push(...loteProcessado);
  }

  return resultados;
};

const mapearProntuarioPorNumero = (prontuariosRaw) => {
  const mapa = new Map();

  if (!Array.isArray(prontuariosRaw)) return mapa;

  prontuariosRaw.forEach((item) => {
    const numero =
      item?.numero_solipede || item?.solipede_numero || item?.numero || item?.solipedeNumero || null;
    const prontuarioId = item?.prontuario_id || item?.id || null;

    if (numero && prontuarioId && !mapa.has(Number(numero))) {
      mapa.set(Number(numero), prontuarioId);
    }
  });

  return mapa;
};

const ControleExamesVacinas = () => {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [registros, setRegistros] = useState([]);

  const [filtroNumero, setFiltroNumero] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroAlocacao, setFiltroAlocacao] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro("");

      const solipedesData = await api.listarSolipedes();
      const listaSolipedes = Array.isArray(solipedesData) ? solipedesData : [];
      const prontuariosRaw = await api.listarNovoModeloProntuarios().catch(() => []);
      const prontuarioPorNumero = mapearProntuarioPorNumero(prontuariosRaw);

      const agregados = await processarEmLotes(listaSolipedes, 12, async (sol) => {
        const prontuarioId =
          sol?.prontuario_id ||
          sol?.prontuarioId ||
          sol?.id_prontuario ||
          prontuarioPorNumero.get(Number(sol?.numero)) ||
          null;

        if (!prontuarioId) {
          return criarRegistroVazio(sol);
        }

        const aieRaw = await api.listarProntuarioAieMormo(prontuarioId).catch(() => []);
        const aieMormo = Array.isArray(aieRaw) ? aieRaw : [];

        const aieAtual = normalizarAieMormo(
          escolherRegistroMaisRecente(aieMormo, (item) => item.data_exame || item.aiemormo_data_exame)
        );

        const statusAie = classificarPrazo(aieAtual.dataValidade);

        return {
          ...sol,
          prontuarioId,
          aieMormo: aieAtual,
          statusAieMormo: statusAie.status,
          diasParaVencimento: statusAie.diasRestantes,
          statusGeral: statusAie.status,
          proximoCriticoDias: statusAie.diasRestantes,
        };
      });

      setRegistros(agregados);
    } catch (error) {
      setErro(
        buildUserErrorMessage(
          "Falha ao carregar retornos de AIE/Mormo",
          error,
          "Não foi possível carregar os dados de AIE/Mormo"
        )
      );
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const statusReferencia = useCallback((item) => item.statusAieMormo, []);

  const dadosFiltrados = useMemo(() => {
    const termoNumero = filtroNumero.trim();
    const termoNome = normalizarTexto(filtroNome);

    return registros.filter((item) => {
      if (!correspondeFiltroAlocacao(item.alocacao, filtroAlocacao)) return false;

      if (statusFilter !== "TODOS" && statusReferencia(item) !== statusFilter) return false;

      if (termoNumero && !String(item.numero || "").includes(termoNumero)) return false;

      if (termoNome && !normalizarTexto(item.nome || "").includes(termoNome)) return false;

      return true;
    });
  }, [registros, filtroAlocacao, statusFilter, filtroNumero, filtroNome, statusReferencia]);

  const indicadores = useMemo(() => {
    const base = registros.filter((item) => correspondeFiltroAlocacao(item.alocacao, filtroAlocacao));

    const total = registros.length;
    const emDia = base.filter((item) => statusReferencia(item) === STATUS.EM_DIA).length;
    const proximoVencimento = base.filter(
      (item) => statusReferencia(item) === STATUS.PROXIMO_VENCIMENTO
    ).length;
    const vencido = base.filter((item) => statusReferencia(item) === STATUS.VENCIDO).length;
    const pendente = base.filter((item) => statusReferencia(item) === STATUS.PENDENTE).length;

    return { total, emDia, proximoVencimento, vencido, pendente };
  }, [registros, filtroAlocacao, statusReferencia]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dadosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dadosFiltrados.length / itemsPerPage);

  const exportarExcel = () => {
    const dadosExport = dadosFiltrados.map((item) => ({
      Numero: item.numero,
      Nome: item.nome || "-",
      Alocacao: item.alocacao || "-",
      AieMormoResultado: item.aieMormo?.resultado || "-",
      DataExameAieMormo: toDateISO(item.aieMormo?.dataAplicacao),
      VencimentoAieMormo: toDateISO(item.aieMormo?.dataValidade),
      StatusAieMormo: labelStatus[item.statusAieMormo],
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AIE Mormo FVR");
    XLSX.writeFile(workbook, `controle_aie_mormo_fvr_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Controle de Retornos - AIE/Mormo", 14, 14);
    doc.setFontSize(9);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 20);

    const tableData = dadosFiltrados.map((item) => [
      item.numero,
      item.nome || "-",
      item.alocacao || "-",
      item.aieMormo?.resultado || "-",
      toDateISO(item.aieMormo?.dataAplicacao),
      toDateISO(item.aieMormo?.dataValidade),
      labelStatus[item.statusAieMormo],
    ]);

    autoTable(doc, {
      startY: 24,
      head: [[
        "Nº",
        "Nome",
        "Alocação",
        "Resultado",
        "Data Exame",
        "Venc. AIE/Mormo",
        "Status AIE/Mormo",
      ]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 110, 253] },
    });

    doc.save(`controle_aie_mormo_fvr_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const limparFiltros = () => {
    setFiltroNumero("");
    setFiltroNome("");
    setFiltroAlocacao("TODOS");
    setStatusFilter("TODOS");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Row className="mb-4 g-3">
        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <BsCalendarCheck size={44} className="text-primary me-3" />
                <div>
                  <h4 className="mb-1">Controle de Retornos AIE/Mormo</h4>
                  <small className="text-muted">
                    Listagem consolidada de exames e vencimentos de AIE/Mormo
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="h-100 text-center shadow-sm border-start" onClick={exportarExcel} style={{ cursor: "pointer" }}>
            <Card.Body className="d-flex flex-column justify-content-center">
              <BsFileEarmarkExcel size={22} className="mb-2 text-success mx-auto" />
              <small className="fw-semibold">Exportar Excel</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={2}>
          <Card className="h-100 text-center shadow-sm border-start" onClick={exportarPDF} style={{ cursor: "pointer" }}>
            <Card.Body className="d-flex flex-column justify-content-center">
              <BsFileEarmarkPdf size={22} className="mb-2 text-danger mx-auto" />
              <small className="fw-semibold">Exportar PDF</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {erro && (
        <Alert variant="danger" className="mb-4">
          <BsXCircle className="me-2" />
          {erro}
        </Alert>
      )}

      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="indicator-card indicator-total" onClick={() => setStatusFilter("TODOS")}>
            <Card.Body>
              <div className="indicator-icon">
                <BsFilter />
              </div>
              <small>Total</small>
              <h4>{indicadores.total}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="indicator-card indicator-success" onClick={() => setStatusFilter(STATUS.EM_DIA)}>
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
          <Card className="indicator-card indicator-warning" onClick={() => setStatusFilter(STATUS.PROXIMO_VENCIMENTO)}>
            <Card.Body>
              <div className="indicator-icon">
                <BsExclamationTriangle />
              </div>
              <small>Próximo Venc.</small>
              <h4>{indicadores.proximoVencimento}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="indicator-card indicator-danger" onClick={() => setStatusFilter(STATUS.VENCIDO)}>
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
                  Número
                </Form.Label>
                <Form.Control
                  type="text"
                  value={filtroNumero}
                  onChange={(e) => setFiltroNumero(e.target.value)}
                  placeholder="Digite o número"
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <BsSearch className="me-2" />
                  Nome
                </Form.Label>
                <Form.Control
                  type="text"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  placeholder="Digite o nome"
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold">Alocação</Form.Label>
                <Form.Select value={filtroAlocacao} onChange={(e) => setFiltroAlocacao(e.target.value)}>
                  <option value="TODOS">Todas</option>
                  {OPCOES_ALOCACAO.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  <option value={STATUS.EM_DIA}>Em dia</option>
                  <option value={STATUS.PROXIMO_VENCIMENTO}>Próximo vencimento</option>
                  <option value={STATUS.VENCIDO}>Vencido</option>
                  <option value={STATUS.PENDENTE}>Pendente</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={1} className="d-flex align-items-end">
              <Button variant="outline-secondary" className="w-100" onClick={limparFiltros}>
                Limpar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">Controle de Retornos AIE/Mormo</h5>
          <Badge bg="primary" className="px-3 py-2">
            {dadosFiltrados.length} {dadosFiltrados.length === 1 ? "registro" : "registros"}
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {currentItems.length === 0 ? (
            <div className="text-center py-5 text-muted">Nenhum registro encontrado</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Nome</th>
                  <th>Alocação</th>
                  <th>Esquadrão</th>
                  <th>Data exame</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.numero}>
                    <td className="fw-bold">{item.numero}</td>
                    <td>{item.nome || "-"}</td>
                    <td>{item.alocacao || "-"}</td>
                    <td>{item.esquadrao || "-"}</td>
                    <td>{toDateISO(item.aieMormo?.dataAplicacao)}</td>
                    <td>{toDateISO(item.aieMormo?.dataValidade)}</td>
                    <td>{badgeStatus(item.statusAieMormo)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

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
                    onClick={() => setCurrentPage((prev) => prev - 1)}
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
                    onClick={() => setCurrentPage((prev) => prev + 1)}
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
    </div>
  );
};

export default ControleExamesVacinas;
