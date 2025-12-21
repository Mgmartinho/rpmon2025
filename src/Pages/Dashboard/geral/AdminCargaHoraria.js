import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Form,
  Button,
  Modal,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { FaClock, FaFileExcel, FaFilePdf, FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { api } from "../../../services/api";

import * as XLSX from "xlsx";

/* =========================
   ADMIN CARGA HORÁRIA
========================= */
const AdminCargaHoraria = () => {
  /* ===== VALIDAÇÃO DE LOGIN (ROBUSTA) ===== */
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const updateUsuario = () => {
      try {
        const u = JSON.parse(localStorage.getItem("usuario"));
        setUsuarioLogado(u && u.id ? u : null);
      } catch {
        setUsuarioLogado(null);
      }
    };

    updateUsuario();
    window.addEventListener('storage', updateUsuario);

    // Verificar a cada 100ms para mudanças no localStorage
    const interval = setInterval(updateUsuario, 100);

    return () => {
      window.removeEventListener('storage', updateUsuario);
      clearInterval(interval);
    };
  }, []);

  /* ===== STATES ===== */
  const [dados, setDados] = useState([]);
  const [loadingDados, setLoadingDados] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);

  const [selecionados, setSelecionados] = useState([]);
  const [horasAdicionar, setHorasAdicionar] = useState(0);
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [historico, setHistorico] = useState([]);
  const [historicoNumero, setHistoricoNumero] = useState(null);

  const [filtroEsqd, setFiltroEsqd] = useState("Todos");
  const [filtroNome, setFiltroNome] = useState("");

  const [filtroNumeroModal, setFiltroNumeroModal] = useState("");


  /* ===== PAGINAÇÃO ===== */
  const [limiteVisualizacao, setLimiteVisualizacao] = useState(10);


  /* ===== LOAD INICIAL ===== */
  const fetchDados = async () => {
    setLoadingDados(true);
    try {
      const lista = usuarioLogado
        ? await api.listarSolipedes()
        : await api.listarSolipedesPublico();

      setDados(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setDados([]);
    } finally {
      setLoadingDados(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  /* =====================================================
     FILTRO RPMon + FILTROS DE TELA (SEM DEPENDER DE LOGIN)
  ===================================================== */
  const solipedesFiltrados = useMemo(() => {
    return dados
      .filter(
        (d) =>
          d.alocacao === "RPMon"
      )
      .filter(
        (d) =>
          (filtroEsqd === "Todos" || d.esquadrao === filtroEsqd) &&
          (d.nome || "").toLowerCase().includes(filtroNome.toLowerCase())
      );
  }, [dados, filtroEsqd, filtroNome]);

  /* ===== PAGINAÇÃO ===== */
  const solipedesPaginados = useMemo(() => {
    if (limiteVisualizacao === "todos") return solipedesFiltrados;
    return solipedesFiltrados.slice(0, Number(limiteVisualizacao));
  }, [solipedesFiltrados, limiteVisualizacao]);


  /* ===== SELEÇÃO ===== */
  const handleSelecionar = (numero) => {
    setSelecionados((prev) =>
      prev.includes(numero)
        ? prev.filter((n) => n !== numero)
        : [...prev, numero]
    );
  };

  const solipedesModal = useMemo(() => {
    if (!filtroNumeroModal) return solipedesFiltrados;

    return solipedesFiltrados.filter((s) =>
      String(s.numero).includes(filtroNumeroModal)
    );
  }, [solipedesFiltrados, filtroNumeroModal]);


  /* ===== APLICAR HORAS ===== */
  const aplicarHoras = async () => {
    if (!selecionados.length || horasAdicionar <= 0 || !senhaConfirmacao.trim()) {
      setFeedbackMessage("Preencha todos os campos corretamente.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
      return;
    }

    setCarregando(true);
    try {
      console.log("usuarioLogado:", usuarioLogado, "tipo de id:", typeof usuarioLogado?.id, "valor id:", usuarioLogado?.id);
      if (!usuarioLogado?.id) {
        throw new Error("Usuário não identificado. Faça login novamente.");
      }
      console.log("Aplicando horas, usuarioId:", usuarioLogado?.id, "usuarioLogado:", usuarioLogado);
      await Promise.all(
        selecionados.map((numero) =>
          api.adicionarHoras({
            numero,
            horas: Number(horasAdicionar),
            senha: senhaConfirmacao,
            usuarioId: usuarioLogado.id,
          })
        )
      );

      await fetchDados();

      setFeedbackMessage("Horas aplicadas com sucesso!");
      setFeedbackSuccess(true);
      setShowFeedback(true);

      setShowModal(false);
      setShowConfirmSenha(false);
      setSelecionados([]);
      setHorasAdicionar(0);
      setSenhaConfirmacao("");
    } catch (err) {
      console.error("Erro completo:", err);
      setFeedbackMessage(err.message || "Erro ao aplicar horas.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
    } finally {
      setCarregando(false);
    }
  };

  const abrirHistorico = async (numero) => {
    try {
      const response = usuarioLogado
        ? await api.historicoHoras(numero)
        : await api.historicoHorasPublico(numero);

      if (Array.isArray(response)) {
        setHistorico(response);
      } else {
        console.warn("Histórico não é array:", response);
        setHistorico([]);
      }

      setHistoricoNumero(numero);
      setShowHistorico(true);
    } catch (err) {
      console.error(err);
      setHistorico([]);
      setFeedbackMessage("Erro ao buscar histórico.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
    }
  };


  const atualizarHora = async (id, horas) => {
    try {
      await api.atualizarHistorico(id, Number(horas));
      await abrirHistorico(historicoNumero);
      await fetchDados();

      setFeedbackMessage("Histórico atualizado com sucesso!");
      setFeedbackSuccess(true);
      setShowFeedback(true);
    } catch {
      setFeedbackMessage("Erro ao atualizar histórico.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
    }
  };

  /* ===== EXPORTAÇÕES (LAZY LOAD) ===== */

  const exportExcel = () => {
    // Usar os dados filtrados da tela
    const dadosParaExportar = solipedesFiltrados.map((item) => ({
      Numero: item.numero,
      Nome: item.nome,
      Alocacao: item.alocacao,
      Esquadrao: item.esquadrao,
      Carga_Horaria: item.cargaHoraria || 0,

    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Solipedes");

    XLSX.writeFile(workbook, "carga_horaria.xlsx");
  };


  const exportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    await import("jspdf-autotable");

    const doc = new jsPDF("landscape");
    doc.text("Carga Horária – RPMon", 14, 15);
    doc.autoTable({
      head: [["Número", "Nome", "Esquadrão", "Carga Horária"]],
      body: solipedesFiltrados.map((s) => [
        s.numero,
        s.nome,
        s.esquadrao,
        s.cargaHoraria || 0,
      ]),
      startY: 25,
    });
    doc.save("carga_horaria_rpmon.pdf");
  };

  /* =========================
           RENDER
  ========================= */
  return (
    <div className="mt-4">
      {loadingDados ? (
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p>Carregando solípedes...</p>
        </div>
      ) : (
        <>
          {/* ===== FILTROS ===== */}
          <div className="d-flex justify-content-between mb-3">
            <div className="d-flex gap-2">
              <Form.Select
                value={filtroEsqd}
                onChange={(e) => setFiltroEsqd(e.target.value)}
              >
                <option value="Todos">Todos</option>
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

              <Form.Select
                style={{ width: "160px" }}
                value={limiteVisualizacao}
                onChange={(e) => setLimiteVisualizacao(e.target.value)}
                placeholder="Limite por pagina"
              >
                <option value={10}>Paginação</option>
                <option value={10}>10</option>
                <option value={20}>20 </option>
                <option value={30}>30 </option>
                <option value="todos">Todos</option>
              </Form.Select>
            </div>


            <div className="d-flex gap-2">
              {usuarioLogado && (
                <Button onClick={() => setShowModal(true)}>
                  <FaClock className="me-1" />
                  Aplicar Carga Horária
                </Button>
              )}
              <Button variant="outline-dark" onClick={exportExcel}>
                <FaFileExcel />
              </Button>
              <Button variant="outline-dark" onClick={exportPDF}>
                <FaFilePdf />
              </Button>
            </div>
          </div>

          {/* ===== TABELA ===== */}
          <Table striped bordered hover className="text-center">
            <thead className="table-primary">
              <tr>
                <th>Número</th>
                <th>Nome</th>
                <th>Esquadrão</th>
                <th>Carga Horária</th>
                <th>Histórico</th>
              </tr>
            </thead>
            <tbody>
              {solipedesPaginados.map((s) => (
                <tr key={s.numero}>
                  <td>{s.numero}</td>
                  <td className="text-start">{s.nome}</td>
                  <td>{s.esquadrao}</td>
                  <td>{s.cargaHoraria || 0} h</td>
                  <td>
                   <Button
  variant="link"
  className="rounded-2 shadow-sm"
  style={{ border: "1px solid black", color: "black" }}
  onClick={() => abrirHistorico(s.numero)}
>
  <FaClock />
</Button>

                  </td>
                </tr>
              ))}
            </tbody>
          </Table>


        </>
      )}

      {/* ===== MODAL APLICAR CARGA HORÁRIA ===== */}
      {showModal && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Aplicar Carga Horária</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* ===== FILTROS ===== */}
            <Form.Group className="mb-3">
              <Form.Label>Filtros</Form.Label>

              <div className="row">
                <div className="col-md-6">
                  <Form.Label>Filtrar por número</Form.Label>
                  <FormControl
                    placeholder="Ex: 1935"
                    value={filtroNumeroModal}
                    onChange={(e) => setFiltroNumeroModal(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <Form.Label>Horas a adicionar</Form.Label>
                  <FormControl
                    type="number"
                    min="1"
                    value={horasAdicionar}
                    onChange={(e) => setHorasAdicionar(e.target.value)}
                  />
                </div>
              </div>
            </Form.Group>


            {/* ===== TABELA COMPLETA (SEM PAGINAÇÃO) ===== */}
            <Table striped bordered hover size="sm">
              <thead className="table-secondary">
                <tr>
                  <th></th>
                  <th>Número</th>
                  <th>Nome</th>
                  <th>Esquadrão</th>
                  <th>Carga Atual</th>
                </tr>
              </thead>
              <tbody>
                {solipedesModal.map((s) => (
                  <tr key={s.numero}>
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={selecionados.includes(s.numero)}
                        onChange={() => handleSelecionar(s.numero)}
                      />
                    </td>
                    <td>{s.numero}</td>
                    <td>{s.nome}</td>
                    <td>{s.esquadrao}</td>
                    <td>{s.cargaHoraria || 0} h</td>
                  </tr>
                ))}

                {!solipedesModal.length && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Nenhum cavalo encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>


          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>

            <Button
              variant="success"
              onClick={() => {
                setShowModal(false);
                setShowConfirmSenha(true);
              }}
              disabled={!selecionados.length || horasAdicionar <= 0}
            >
              Continuar
            </Button>

          </Modal.Footer>
        </Modal>
      )}


      {/* ===== MODAL HISTÓRICO ===== */}
      {showHistorico && (
        <Modal show centered size="lg" onHide={() => setShowHistorico(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-2">
              Histórico – {historicoNumero}
              <OverlayTrigger
                overlay={
                  <Tooltip>
                    Apenas usuários logados podem editar lançamentos
                  </Tooltip>
                }
              >
                <FaInfoCircle />
              </OverlayTrigger>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Horas</th>
                  {usuarioLogado && <th>Ações</th>}
                </tr>
              </thead>

              <tbody>
                {historico.map((h) => (
                  <tr key={h.id}>
                    <td>
                      {new Date(h.dataLancamento).toLocaleString()}
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        <strong>Usuário:</strong>{" "}
                        {h.usuarioNome || "Usuário não identificado"}
                      </div>
                    </td>

                    <td>
                      <FormControl
                        type="number"
                        value={h.horas}
                        disabled={!usuarioLogado}
                        onChange={(e) =>
                          usuarioLogado &&
                          setHistorico((prev) =>
                            prev.map((x) =>
                              x.id === h.id
                                ? { ...x, horas: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    {usuarioLogado && (
                      <td>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => atualizarHora(h.id, h.horas)}
                        >
                          Salvar
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>

            </Table>
          </Modal.Body>
        </Modal>
      )}

      {/* ===== MODAL CONFIRMAR SENHA ===== */}
      {showConfirmSenha && (
        <Modal
          show={showConfirmSenha}
          onHide={() => setShowConfirmSenha(false)}
          centered
          size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmar operação</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p className="text-muted mb-2">
              Confirme sua senha para aplicar <strong>{horasAdicionar}h</strong> em{" "}
              <strong>{selecionados.length}</strong> cavalo(s).
            </p>

            <Form.Group>
              <Form.Label>Senha</Form.Label>
              <FormControl
                type="password"
                placeholder="Digite sua senha"
                value={senhaConfirmacao}
                onChange={(e) => setSenhaConfirmacao(e.target.value)}
                autoFocus
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmSenha(false)}
            >
              Voltar
            </Button>

            <Button
              variant="success"
              onClick={aplicarHoras}
              disabled={!senhaConfirmacao || carregando}
            >
              {carregando ? "Aplicando..." : "Confirmar"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}


      {/* ===== FEEDBACK ===== */}
      <Modal show={showFeedback} onHide={() => setShowFeedback(false)} centered>
        <Modal.Body>{feedbackMessage}</Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminCargaHoraria;
