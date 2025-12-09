import { useState } from "react";
import { Table, Button, Badge, Form, Row, Col, Modal } from "react-bootstrap";
import { BsPencilSquare, BsTrash, BsClockHistory } from "react-icons/bs";
import dadosBase from "./dadosBase"; // sua lista de cavalos
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from "react-icons/bs";
import autoTable from "jspdf-autotable"; // ✅ import correto

const DashboardList = () => {
  // Exportar Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dadosFiltrados); // use dados filtrados
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Solipedes");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "solipedes.xlsx");
  };

// Exportar PDF
const exportToPDF = () => {
  const doc = new jsPDF();

  const tableColumn = ["ID", "Nome", "Esquadrão", "Status"];
  const tableRows = [];

  dadosFiltrados.forEach((item) => {
    tableRows.push([item.id, item.nome, item.esquadrao, item.status]);
  });

  doc.text("Tabela de Solípedes", 14, 15);

  // Use autoTable diretamente
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save("solipedes.pdf");
};

  // 🔹 AGORA dadosBase PODE SER EDITADO
  const [dados, setDados] = useState(dadosBase);

  // 🔹 FILTROS
  const [filtros, setFiltros] = useState({
    id: "",
    nome: "",
    esquadrao: "",
    status: "",
  });

  // 🔹 PAGINAÇÃO
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);

  // -----------------------------------------
  //
  // 🔹 ESTADOS PARA EDIÇÃO
  //
  // -----------------------------------------

  const [showEdit, setShowEdit] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const handleEditar = (item) => {
    setItemEditando({ ...item });
    setShowEdit(true);
  };

  const handleSalvar = () => {
    setDados((prev) =>
      prev.map((d) => (d.id === itemEditando.id ? itemEditando : d))
    );
    setShowEdit(false);
  };

  const handleChangeEdit = (campo, valor) => {
    setItemEditando((prev) => ({ ...prev, [campo]: valor }));
  };

  // -----------------------------------------
  //
  // 🔹 FILTRAR LISTA
  //
  // -----------------------------------------

  const dadosFiltrados = dados.filter((item) => {
    return (
      (filtros.id ? item.id.toString().includes(filtros.id) : true) &&
      item.nome.toLowerCase().includes(filtros.nome.toLowerCase()) &&
      (filtros.esquadrao ? item.esquadrao === filtros.esquadrao : true) &&
      (filtros.status
        ? item.status.toLowerCase() === filtros.status.toLowerCase()
        : true)
    );
  });

  // 🔹 PAGINAR LISTA
  const indexInicio = (paginaAtual - 1) * itensPorPagina;
  const indexFim =
    itensPorPagina === "todos"
      ? dadosFiltrados.length
      : indexInicio + itensPorPagina;

  const dadosPaginados =
    itensPorPagina === "todos"
      ? dadosFiltrados
      : dadosFiltrados.slice(indexInicio, indexFim);

  const totalPaginas =
    itensPorPagina === "todos"
      ? 1
      : Math.ceil(dadosFiltrados.length / itensPorPagina);

  // Função para alternar histórico
  const [showHistorico, setShowHistorico] = useState(false);
  const [itemHistorico, setItemHistorico] = useState(null);

  const handleVerHistorico = (item) => {
    setItemHistorico(item);
    setShowHistorico(true);
  };

  

  return (
    <>
      <h3 className="mb-3">Solípedes</h3>
      {/* FILTROS */};
      <div className="p-3 mb-4 border rounded bg-light">
        <Row className="align-items-end">
          {/* FILTROS */}
          <Col md={2}>
            <Form.Label>Pesquisar por Número</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o número..."
              value={filtros.id}
              onChange={(e) => setFiltros({ ...filtros, id: e.target.value })}
            />
          </Col>

          <Col md={2}>
            <Form.Label>Pesquisar por Nome</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome..."
              value={filtros.nome}
              onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
            />
          </Col>

          <Col md={2}>
            <Form.Label>Esquadrão</Form.Label>
            <Form.Select
              value={filtros.esquadrao}
              onChange={(e) =>
                setFiltros({ ...filtros, esquadrao: e.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="1º Esqd">1º Esqd</option>
              <option value="2º Esqd">2º Esqd</option>
              <option value="3º Esqd">3º Esqd</option>
              <option value="4º Esqd">4º Esqd</option>
              <option value="Equoterapia">Equoterapia</option>
              <option value="Representacao">Representação</option>
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={filtros.status}
              onChange={(e) =>
                setFiltros({ ...filtros, status: e.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Baixado">Baixado</option>
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Label>Itens por página</Form.Label>
            <Form.Select
              value={itensPorPagina}
              onChange={(e) => {
                setItensPorPagina(
                  e.target.value === "todos" ? "todos" : Number(e.target.value)
                );
                setPaginaAtual(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="todos">Todos</option>
            </Form.Select>
          </Col>

          {/* EXPORTAÇÃO */}
          <Col md={2} className="d-flex justify-content-end">
            <Button
              variant="success"
              className="me-2"
              onClick={exportToExcel}
              title="Exportar Excel"
            >
              <BsFileEarmarkExcel size={20} />
            </Button>
            <Button variant="danger" onClick={exportToPDF} title="Exportar PDF">
              <BsFileEarmarkPdf size={20} />
            </Button>
          </Col>
        </Row>
      </div>
      {/* TABELA */}
      <Table striped hover responsive className="shadow-sm">
        <thead className="table-primary text-center">
          <tr>
            <th>Número</th>
            <th>Nome</th>
            <th>Esquadrão</th>
            <th>Status</th>
            <th>Histórico</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dadosPaginados.map((item) => (
            <tr key={item.id}>
              <td className="text-center fw-bold">{item.id}</td>
              <td>{item.nome}</td>
              <td className="text-center">{item.esquadrao}</td>
              <td className="text-center">
                {item.status.toLowerCase() === "baixado" ||
                item.status === "Baixados" ? (
                  <Badge bg="danger">Baixado</Badge>
                ) : (
                  <Badge bg="success">Ativo</Badge>
                )}
              </td>

              <td className="text-center">
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleVerHistorico(item)}
                  disabled={!item.historico || item.historico.length === 0} // ✅ aqui
                >
                  <BsClockHistory size={16} className="me-1" />
                  Ver histórico
                </Button>
              </td>

              <td className="text-center">
                {/* EDITAR */}
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEditar(item)}
                >
                  <BsPencilSquare size={16} />
                </Button>

                {/* EXCLUIR – deixei intacto */}
                <Button variant="danger" size="sm">
                  <BsTrash size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* PAGINAÇÃO */}
      {itensPorPagina !== "todos" && (
        <div className="d-flex justify-content-center mt-3">
          <Button
            variant="secondary"
            className="me-2"
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual(paginaAtual - 1)}
          >
            Anterior
          </Button>

          <span className="px-3 py-2 fw-bold">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <Button
            variant="secondary"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual(paginaAtual + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
      {/* -------------------------------------------------------------
          MODAL DE EDIÇÃO — bem simples para manter seu layout
      -------------------------------------------------------------- */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Registro</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {itemEditando && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={itemEditando.nome}
                  onChange={(e) => handleChangeEdit("nome", e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Esquadrão</Form.Label>
                <Form.Control
                  type="text"
                  value={itemEditando.esquadrao}
                  onChange={(e) =>
                    handleChangeEdit("esquadrao", e.target.value)
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={itemEditando.status}
                  onChange={(e) => handleChangeEdit("status", e.target.value)}
                >
                  <option>Ativo</option>
                  <option>Baixado</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleSalvar}>
            Salvar alterações
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showHistorico}
        onHide={() => setShowHistorico(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Histórico de {itemHistorico?.nome}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {itemHistorico?.historico.length > 0 ? (
            <ul>
              {itemHistorico.historico.map((registro, index) => (
                <li key={index}>{registro}</li>
              ))}
            </ul>
          ) : (
            <p>Sem histórico registrado.</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistorico(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashboardList;
