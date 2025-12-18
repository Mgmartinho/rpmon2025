import { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Modal,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { FaClock, FaFileExcel, FaFilePdf } from "react-icons/fa";
import axios from "axios";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminCargaHoraria = () => {
  const [dados, setDados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selecionados, setSelecionados] = useState([]);
  const [horasAdicionar, setHorasAdicionar] = useState(0);

  // Modal de feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);

  // Modal de histórico
  const [showHistorico, setShowHistorico] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [historicoNumero, setHistoricoNumero] = useState(null);

  // Filtros
  const [filtroEsqd, setFiltroEsqd] = useState("Todos");
  const [filtroNome, setFiltroNome] = useState("");

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      const response = await axios.get("http://localhost:3000/solipedes");
      setDados(response.data);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };

  const filtrados = dados.filter(
    (d) =>
      (filtroEsqd === "Todos" || d.esquadrao === filtroEsqd) &&
      d.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  const handleSelecionar = (numero) => {
    setSelecionados((prev) =>
      prev.includes(numero)
        ? prev.filter((n) => n !== numero)
        : [...prev, numero]
    );
  };

  const aplicarHoras = async () => {
    if (!selecionados.length || horasAdicionar <= 0) return;

    try {
      await Promise.all(
        selecionados.map((numero) =>
          axios.post(`http://localhost:3000/solipedes/adicionarHoras`, {
            numero,
            horas: Number(horasAdicionar),
          })
        )
      );

      setDados((prevDados) =>
        prevDados.map((item) =>
          selecionados.includes(item.numero)
            ? {
                ...item,
                cargaHoraria: (item.cargaHoraria || 0) + Number(horasAdicionar),
              }
            : item
        )
      );

      setFeedbackMessage("Horas aplicadas com sucesso!");
      setFeedbackSuccess(true);
      setShowFeedback(true);

      setShowModal(false);
      setSelecionados([]);
      setHorasAdicionar(0);
    } catch (err) {
      console.error("Erro ao aplicar horas:", err);
      setFeedbackMessage("Erro ao aplicar horas. Tente novamente.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
    }
  };

  const abrirHistorico = async (numero) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/solipedes/${numero}/historico`
      );
      setHistorico(response.data);
      setHistoricoNumero(numero);
      setShowHistorico(true);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      setFeedbackMessage("Erro ao buscar histórico");
      setFeedbackSuccess(false);
      setShowFeedback(true);
    }
  };

  const atualizarHora = async (id, novasHoras) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/historicoHoras/${id}`,
        {
          horas: Number(novasHoras),
        }
      );

      const totalHorasAtualizado = response.data.totalHoras;

      setHistorico((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, horas: Number(novasHoras) } : item
        )
      );

      setDados((prevDados) =>
        prevDados.map((item) =>
          item.numero === historicoNumero
            ? { ...item, cargaHoraria: totalHorasAtualizado }
            : item
        )
      );

      setFeedbackMessage("Histórico atualizado com sucesso!");
      setFeedbackSuccess(true);
      setShowFeedback(true);
    } catch (err) {
      console.error("Erro ao atualizar histórico:", err);
      setFeedbackMessage("Erro ao atualizar histórico!");
      setFeedbackSuccess(false);
      setShowFeedback(true);
    }
  };

  // ===== EXPORTAÇÃO =====
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtrados.map(({ numero, nome, esquadrao, cargaHoraria }) => ({
        Número: numero,
        Nome: nome,
        Esquadrão: esquadrao,
        "Carga Horária": cargaHoraria || 0,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CargaHoraria");
    XLSX.writeFile(wb, "CargaHoraria.xlsx");
  };

const exportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Administração de Carga Horária", 14, 20);

  const tableColumn = ["Número", "Nome", "Esquadrão", "Carga Horária"];
  const tableRows = filtrados.map(
    ({ numero, nome, esquadrao, cargaHoraria }) => [
      numero,
      nome,
      esquadrao,
      cargaHoraria || 0,
    ]
  );

  doc.autoTable({
    startY: 30,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [0, 123, 255], textColor: 255 }, // azul bootstrap
    styles: { fontSize: 10, halign: "center" },
    columnStyles: {
      1: { halign: "left" }, // Nome alinhado à esquerda
    },
  });

  doc.save("CargaHoraria.pdf");
};


  return (
    <div className="justify-content-center mt-4">
      <div className="p-4 bg-light rounded shadow-sm">
        <h3 className="mb-4 text-center text-primary fw-bold">
          Administração de Carga Horária
        </h3>

        {/* ===== FILTROS e EXPORTAÇÃO ===== */}
        <div className="d-flex mb-2 gap-2">
          <Form.Select
            value={filtroEsqd}
            onChange={(e) => setFiltroEsqd(e.target.value)}
          >
            <option value="Todos">Todos os Esquadrões</option>
            <option value="1 Esquadrao">1º Esqd</option>
            <option value="2 Esquadrao">2º Esqd</option>
            <option value="3 Esquadrao">3º Esqd</option>
            <option value="4 Esquadrao">4º Esqd</option>
            <option value="Equoterapia">Equoterapia</option>
            <option value="Representacao">Representação</option>
          </Form.Select>

          <FormControl
            placeholder="Pesquisar por nome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />

          <Button variant="success" onClick={exportExcel}>
            <FaFileExcel className="me-1" /> Excel
          </Button>
          <Button variant="danger" onClick={exportPDF}>
            <FaFilePdf className="me-1" /> PDF
          </Button>
        </div>

        {/* ===== TABELA PRINCIPAL ===== */}
        <div className="table-responsive shadow-sm rounded">
          <Table
            striped
            hover
            bordered
            className="mb-4 align-middle text-center"
          >
            <thead className="table-primary">
              <tr>
                <th>Número</th>
                <th>Nome</th>
                <th>Esquadrão</th>
                <th>Carga Horária Atual</th>
                <th>Histórico</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.numero}>
                  <td>{item.numero}</td>
                  <td className="text-start">{item.nome}</td>
                  <td>{item.esquadrao}</td>
                  <td>{item.cargaHoraria || 0} h</td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => abrirHistorico(item.numero)}
                    >
                      <FaClock size={20} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* ===== MODAIS ===== */}
        {/* Modal de adicionar horas */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Adicionar Carga Horária</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Text>Horas a adicionar</InputGroup.Text>
              <FormControl
                type="number"
                min="0"
                value={horasAdicionar}
                onChange={(e) => setHorasAdicionar(Number(e.target.value))}
              />
            </InputGroup>

            <div className="table-responsive">
              <Table
                striped
                hover
                bordered
                className="align-middle text-center"
              >
                <thead className="table-secondary">
                  <tr>
                    <th>Selecionar</th>
                    <th>Número</th>
                    <th>Nome</th>
                    <th>Esquadrão</th>
                    <th>Carga Horária Atual</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((item) => (
                    <tr key={item.numero}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selecionados.includes(item.numero)}
                          onChange={() => handleSelecionar(item.numero)}
                        />
                      </td>
                      <td>{item.numero}</td>
                      <td className="text-start">{item.nome}</td>
                      <td>{item.esquadrao}</td>
                      <td>{item.cargaHoraria || 0} h</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="success"
              disabled={!selecionados.length || horasAdicionar <= 0}
              onClick={aplicarHoras}
            >
              Aplicar Horas
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de histórico */}
        <Modal
          show={showHistorico}
          onHide={() => setShowHistorico(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Carga Horária - Individual {historicoNumero}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover className="text-center">
              <thead className="table-secondary">
                <tr>
                  <th>Data</th>
                  <th>Horas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.dataLancamento).toLocaleString()}
                      <br />
                      <small>Atualizado por:</small>
                    </td>
                    <td>
                      <FormControl
                        type="number"
                        value={item.horas}
                        onChange={(e) => {
                          const novasHoras = e.target.value;
                          setHistorico((prev) =>
                            prev.map((h) =>
                              h.id === item.id
                                ? { ...h, horas: Number(novasHoras) }
                                : h
                            )
                          );
                        }}
                      />
                    </td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => atualizarHora(item.id, item.horas)}
                      >
                        Salvar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowHistorico(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de feedback */}
        <Modal
          show={showFeedback}
          onHide={() => setShowFeedback(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{feedbackSuccess ? "Sucesso" : "Erro"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{feedbackMessage}</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowFeedback(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AdminCargaHoraria;
