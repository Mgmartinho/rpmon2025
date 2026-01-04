import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Badge,
  Form,
  Row,
  Col,
  Spinner,
  Card,
  Button,
  Modal,
} from "react-bootstrap";
import {
  BsClockHistory,
  BsFileExcel,
  BsFilePdf,
  BsChevronUp,
  BsChevronDown,
} from "react-icons/bs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../../../services/api";

const DashboardList = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);

  // ordenação
  const [campoOrdenacao, setCampoOrdenacao] = useState("numero");
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState("asc");

  // modal prontuário
  const [showModalProntuario, setShowModalProntuario] = useState(false);
  const [prontuarioSelecionado, setProntuarioSelecionado] = useState(null);
  const [prontuarios, setProntuarios] = useState([]);
  const [loadingProntuario, setLoadingProntuario] = useState(false);
  const [solipedesComRestricao, setSolipedesComRestricao] = useState(new Set());
  const [solipedesSemRestricao, setSolipedesSemRestricao] = useState(new Set());

  // 🔹 BUSCA DADOS
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const data = await api.listarSolipedesPublico();

        if (Array.isArray(data)) {
          const apenasRPMon = data.filter(
            (item) =>
              item.alocacao &&
              item.alocacao.toLowerCase() === "rpmon"
          );

          setDados(apenasRPMon);
        } else {
          setDados([]);
        }
      } catch (error) {
        console.error("Erro:", error);
        setDados([]);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // 🔹 FILTRO + ORDENAÇÃO
  const dadosFiltrados = useMemo(() => {
    const termo = filtroTexto.toLowerCase();

    const filtrados = dados.filter(
      (item) =>
        item.nome?.toLowerCase().includes(termo) ||
        String(item.numero).includes(termo) ||
        item.esquadrao?.toLowerCase().includes(termo)
    );

    return filtrados.sort((a, b) => {
      const valorA = a[campoOrdenacao] ?? "";
      const valorB = b[campoOrdenacao] ?? "";

      if (typeof valorA === "number") {
        return direcaoOrdenacao === "asc"
          ? valorA - valorB
          : valorB - valorA;
      }

      return direcaoOrdenacao === "asc"
        ? String(valorA).localeCompare(String(valorB), "pt-BR")
        : String(valorB).localeCompare(String(valorA), "pt-BR");
    });
  }, [dados, filtroTexto, campoOrdenacao, direcaoOrdenacao]);

  // 🔹 PAGINAÇÃO
  const totalPaginas =
    itensPorPagina === "all"
      ? 1
      : Math.ceil(dadosFiltrados.length / itensPorPagina);

  const dadosPaginados = useMemo(() => {
    if (itensPorPagina === "all") return dadosFiltrados;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return dadosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [dadosFiltrados, paginaAtual, itensPorPagina]);

  // 🔹 ORDENAÇÃO CLICK
  const ordenarPor = (campo) => {
    if (campoOrdenacao === campo) {
      setDirecaoOrdenacao((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setCampoOrdenacao(campo);
      setDirecaoOrdenacao("asc");
    }
  };

  const CabecalhoOrdenavel = ({ label, campo }) => (
    <span
      role="button"
      className="d-inline-flex align-items-center gap-1"
      onClick={() => ordenarPor(campo)}
    >
      {label}
      {campoOrdenacao === campo &&
        (direcaoOrdenacao === "asc" ? (
          <BsChevronUp size={12} />
        ) : (
          <BsChevronDown size={12} />
        ))}
    </span>
  );

  // 📤 EXPORTA EXCEL
  const exportarExcel = () => {
    const dadosExportacao = dadosFiltrados.map((item) => ({
      Número: item.numero,
      Nome: item.nome,
      Esquadrão: item.esquadrao,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Solípedes RPMon");

    XLSX.writeFile(workbook, "solipedes_rpmon.xlsx");
  };

  // 📤 EXPORTA PDF
  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.text("Solípedes Alocados – RPMon", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Número", "Nome", "Esquadrão", "Status"]],
      body: dadosFiltrados.map((item) => [
        item.numero,
        item.nome,
        item.esquadrao || "-",
        item.status,
      ]),
    });

    doc.save("solipedes_rpmon.pdf");
  };

  // 📋 ABRIR MODAL DE PRONTUÁRIO
  const abrirProntuario = async (solipede) => {
    // Se já verificamos e não tem restrições, não faz nada
    if (solipedesSemRestricao.has(solipede.numero)) {
      return;
    }

    setLoadingProntuario(true);
    setProntuarioSelecionado(solipede);

    try {
      const response = await api.listarProntuarioPublico(solipede.numero);
      
      // A API já retorna apenas restrições (tipo = 'restrições')
      if (Array.isArray(response) && response.length > 0) {
        setProntuarios(response);
        setSolipedesComRestricao((prev) => new Set([...prev, solipede.numero]));
        setShowModalProntuario(true); // Só abre modal se houver restrições
      } else {
        // Marca como "sem restrições" para não tentar novamente
        setSolipedesSemRestricao((prev) => new Set([...prev, solipede.numero]));
        setProntuarios([]);
      }
    } catch (error) {
      console.error("Erro ao buscar prontuário:", error);
      setProntuarios([]);
    } finally {
      setLoadingProntuario(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="secondary" />
        <div className="text-muted mt-2">Carregando dados...</div>
      </div>
    );
  }

  return (
    <>
      {/* 🧱 CARD TÍTULO */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 text-secondary fw-semibold">
                Solípedes Alocados – RPMon
              </h5>
              <small className="text-muted">
                Consulta geral com ordenação, filtros e exportação
              </small>
            </Col>

            <Col className="text-end">
              <Button
                variant="outline-success"
                size="sm"
                className="me-2"
                onClick={exportarExcel}
              >
                <BsFileExcel className="me-1" />
                Excel
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={exportarPDF}
              >
                <BsFilePdf className="me-1" />
                PDF
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 🔎 FILTROS */}
      <Row className="mb-3 g-2">
        <Col md={6}>
          <Form.Control
            placeholder="Filtrar por nome, número ou esquadrão"
            value={filtroTexto}
            onChange={(e) => {
              setFiltroTexto(e.target.value);
              setPaginaAtual(1);
            }}
          />
        </Col>

        <Col md={3}>
          <Form.Select
            value={itensPorPagina}
            onChange={(e) => {
              const valor =
                e.target.value === "all"
                  ? "all"
                  : Number(e.target.value);
              setItensPorPagina(valor);
              setPaginaAtual(1);
            }}
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={30}>30 por página</option>
            <option value="all">Todos</option>
          </Form.Select>
        </Col>
      </Row>

      {/* 📋 TABELA */}
      <Table hover responsive className="shadow-sm align-middle border">
        <thead className="bg-light text-center">
          <tr>
            <th>
              <CabecalhoOrdenavel label="Número" campo="numero" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Nome" campo="nome" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Esquadrão" campo="esquadrao" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Status" campo="status" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Histórico" campo="numero" />
            </th>
          </tr>
        </thead>

        <tbody>
          {dadosPaginados.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted py-4">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            dadosPaginados.map((item) => {
              const baixado =
                item.status?.toLowerCase() === "baixado";

              return (
                <tr key={item.numero}>
                  <td className="text-center fw-semibold">
                    {item.numero}
                  </td>
                  <td>{item.nome}</td>
                  <td className="text-center">
                    {item.esquadrao || "-"}
                  </td>
                  <td className="text-center">
                    <Badge bg={baixado ? "danger" : "success"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <BsClockHistory
                      role="button"
                      className={
                        solipedesComRestricao.has(item.numero)
                          ? "text-danger"
                          : solipedesSemRestricao.has(item.numero)
                          ? "text-muted"
                          : "text-secondary"
                      }
                      style={{
                        cursor: solipedesSemRestricao.has(item.numero) ? "not-allowed" : "pointer",
                        fontSize: "1.2rem",
                        opacity: solipedesComRestricao.has(item.numero) 
                          ? 1 
                          : solipedesSemRestricao.has(item.numero) 
                          ? 0.3 
                          : 0.6,
                        pointerEvents: solipedesSemRestricao.has(item.numero) ? "none" : "auto",
                      }}
                      onClick={() => abrirProntuario(item)}
                      title={
                        solipedesComRestricao.has(item.numero)
                          ? "Possui restrições ativas - Clique para ver"
                          : solipedesSemRestricao.has(item.numero)
                          ? "Sem restrições ativas"
                          : "Clique para verificar restrições"
                      }
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      {/* 🔢 PAGINAÇÃO */}
      {itensPorPagina !== "all" && totalPaginas > 1 && (
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual((p) => p - 1)}
          >
            Anterior
          </Button>

          <span className="align-self-center text-muted">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <Button
            size="sm"
            variant="outline-secondary"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* 📋 MODAL PRONTUÁRIO/RESTRIÇÕES */}
      <Modal
        show={showModalProntuario}
        onHide={() => setShowModalProntuario(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Restrições - {prontuarioSelecionado?.nome} (#{prontuarioSelecionado?.numero})
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loadingProntuario ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
              <div className="text-muted mt-2">Carregando restrições...</div>
            </div>
          ) : prontuarios.length === 0 ? (
            <div className="text-center text-muted py-4">
              <BsClockHistory size={48} className="mb-3 opacity-50" />
              <p>Nenhuma restrição ativa encontrada</p>
            </div>
          ) : (
            <Table striped bordered hover size="sm">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "20%" }}>Data</th>
                  <th>Restrição</th>
                  <th style={{ width: "25%" }}>Recomendações</th>
                </tr>
              </thead>
              <tbody>
                {prontuarios.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {new Date(p.data_criacao).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <div className="fw-semibold text-danger">
                        {p.observacao}
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        {p.recomendacoes || "-"}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalProntuario(false)}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashboardList;
