import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Form,
  Button,
  Modal,
  InputGroup,
  FormControl,
  Spinner,
  Col,
} from "react-bootstrap";

import { GoArrowSwitch } from "react-icons/go";


import { FaClock, FaFileExcel, FaFilePdf, FaInfoCircle } from "react-icons/fa";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { api } from "../../../services/api";
import { temPermissao } from "../../../utils/permissions";

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

    return () => {
      window.removeEventListener('storage', updateUsuario);
    };
  }, []);

  /* ===== STATES ===== */
  const [dados, setDados] = useState([]);
  const [loadingDados, setLoadingDados] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showMovimentacao, setShowMovimentacao] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);

  const [selecionados, setSelecionados] = useState([]);
  const [horasAdicionar, setHorasAdicionar] = useState(0);
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [historico, setHistorico] = useState([]);
  const [historicoNumero, setHistoricoNumero] = useState(null);

  const [solipedeMovimentacao, setSolipedeMovimentacao] = useState(null);
  const [historicoMovimentacao, setHistoricoMovimentacao] = useState([]);
  const [esquadraoDestino, setEsquadraoDestino] = useState("");
  const [senhaMovimentacao, setSenhaMovimentacao] = useState("");

  const [filtroEsqd, setFiltroEsqd] = useState("Todos");
  const [filtroNome, setFiltroNome] = useState("");

  const [filtroNumeroModal, setFiltroNumeroModal] = useState("");
  const [horasMensais, setHorasMensais] = useState({});
  const [horasMensaisCache, setHorasMensaisCache] = useState({});
  const [loadingHoras, setLoadingHoras] = useState(true);

  /* ===== PAGINAÇÃO ===== */
  const [limiteVisualizacao, setLimiteVisualizacao] = useState(10);


  /* ===== LOAD INICIAL ===== */
  const fetchDados = async () => {
    console.log("🔴 AdminCargaHoraria - fetchDados chamado");
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
    console.log("🟢 AdminCargaHoraria - useEffect fetchDados executado");
    fetchDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Buscar horas mensais do backend (otimizado - uma única requisição)
  useEffect(() => {
    if (dados.length === 0) return;

    const buscarHorasMensais = async () => {
      try {
        console.log("🔍 Buscando horas do mês atual do backend...");
        const horasDoBackend = await api.horasMesAtual();
        console.log("✅ Horas recebidas do backend:", horasDoBackend);
        
        // Verificar se é um objeto válido
        if (horasDoBackend && typeof horasDoBackend === 'object' && !horasDoBackend.error) {
          setHorasMensais(horasDoBackend);
          setHorasMensaisCache(horasDoBackend);
          console.log(`📊 Total de solípedes com horas: ${Object.keys(horasDoBackend).length}`);
        } else {
          console.error("❌ Resposta inválida do backend:", horasDoBackend);
          setHorasMensais({});
        }
        setLoadingHoras(false);
      } catch (err) {
        console.error("❌ Erro ao buscar horas mensais:", err);
        setHorasMensais({});
        setLoadingHoras(false);
      }
    };

    buscarHorasMensais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados.length]);

  // Função para invalidar cache de horas de solípedes específicos
  const invalidarCacheHoras = async (numeros) => {
    // Rebuscar todas as horas do backend para garantir consistência
    try {
      const horasDoBackend = await api.horasMesAtual();
      setHorasMensais(horasDoBackend);
      setHorasMensaisCache(horasDoBackend);
    } catch (err) {
      console.error("Erro ao atualizar cache de horas:", err);
    }
  };

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
      
      const resultados = await Promise.all(
        selecionados.map((numero) =>
          api.adicionarHoras({
            numero,
            horas: Number(horasAdicionar),
            senha: senhaConfirmacao,
            usuarioId: usuarioLogado.id,
          })
        )
      );

      // Verificar se algum resultado contém erro
      const erros = resultados.filter(r => r.error || r.message?.includes("Senha"));
      if (erros.length > 0) {
        const mensagemErro = erros[0].error || erros[0].message || "Erro ao aplicar horas";
        throw new Error(mensagemErro);
      }

      // Aguardar um pouco para o backend processar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidar cache apenas dos solípedes afetados
      invalidarCacheHoras(selecionados);
      
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
    console.log("🟦 AdminCargaHoraria - abrirHistorico chamado para número:", numero);
    try {
      const response = usuarioLogado
        ? await api.historicoHoras(numero)
        : await api.historicoHorasPublico(numero);

      if (Array.isArray(response)) {
        // Filtrar pelo mês atual
        const hoje = new Date();
        const mesAtual = hoje.getMonth() + 1;
        const anoAtual = hoje.getFullYear();
        
        const historicoFiltrado = response.filter((h) => {
          const data = new Date(h.dataLancamento);
          return (
            data.getMonth() + 1 === mesAtual &&
            data.getFullYear() === anoAtual
          );
        });
        setHistorico(historicoFiltrado);
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
      
      // Aguardar um pouco para o backend processar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidar cache do solípede atual
      invalidarCacheHoras([historicoNumero]);
      
      await fetchDados();
      await abrirHistorico(historicoNumero);

      setFeedbackMessage("Histórico atualizado com sucesso!");
      setFeedbackSuccess(true);
      setShowFeedback(true);
    } catch (err) {
      console.error(err);
      setFeedbackMessage("Erro ao atualizar histórico.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
    }
  };

  /* ===== MOVIMENTAÇÃO ===== */
  const abrirMovimentacao = async (solipede) => {
    try {
      // Buscar histórico
      const response = usuarioLogado
        ? await api.historicoMovimentacao(solipede.numero)
        : await api.historicoMovimentacaoPublico(solipede.numero);

      if (Array.isArray(response)) {
        setHistoricoMovimentacao(response);
      } else {
        console.warn("Histórico de movimentação não é array:", response);
        setHistoricoMovimentacao([]);
      }

      setSolipedeMovimentacao(solipede);
      setEsquadraoDestino(solipede.esquadrao);
      setSenhaMovimentacao("");
      setShowMovimentacao(true);
    } catch (err) {
      console.error(err);
      setHistoricoMovimentacao([]);
      setSolipedeMovimentacao(solipede);
      setEsquadraoDestino(solipede.esquadrao);
      setSenhaMovimentacao("");
      setShowMovimentacao(true);
    }
  };

  const aplicarMovimentacao = async () => {
    if (!esquadraoDestino || !senhaMovimentacao.trim()) {
      setFeedbackMessage("Selecione o esquadrão e confirme sua senha.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
      return;
    }

    if (esquadraoDestino === solipedeMovimentacao.esquadrao) {
      setFeedbackMessage("O solípede já está neste esquadrão.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
      return;
    }

    setCarregando(true);
    try {
      if (!usuarioLogado?.id) {
        throw new Error("Usuário não identificado. Faça login novamente.");
      }

      const dados = {
        esquadrao: esquadraoDestino,
        senha: senhaMovimentacao,
        usuarioId: usuarioLogado.id,
        esquadraoOrigem: solipedeMovimentacao.esquadrao,
      };

      console.log("🔄 Enviando movimentação:", dados);
      console.log("   Número:", solipedeMovimentacao.numero);

      // Atualizar o esquadrão do solípede
      const resultado = await api.atualizarSolipede(solipedeMovimentacao.numero, dados);
      console.log("📥 Resultado da movimentação:", resultado);

      if (resultado.error) {
        throw new Error(resultado.error);
      }

      // Aguardar um pouco para o backend processar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidar cache do solípede movimentado
      invalidarCacheHoras([solipedeMovimentacao.numero]);
      
      await fetchDados();

      setFeedbackMessage(`${solipedeMovimentacao.nome} movimentado para ${esquadraoDestino} com sucesso!`);
      setFeedbackSuccess(true);
      setShowFeedback(true);

      setShowMovimentacao(false);
      setSolipedeMovimentacao(null);
      setEsquadraoDestino("");
      setSenhaMovimentacao("");
    } catch (err) {
      console.error("❌ Erro completo na movimentação:", err);
      console.error("   Tipo:", typeof err);
      console.error("   Message:", err.message);
      console.error("   Stack:", err.stack);
      setFeedbackMessage(err.message || "Erro ao realizar movimentação.");
      setFeedbackSuccess(false);
      setShowFeedback(true);
    } finally {
      setCarregando(false);
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
      Carga_Horaria_Mes: horasMensais[item.numero] || 0,
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
      head: [["Número", "Nome", "Esquadrão", "Carga Horária (Mês)"]],
      body: solipedesFiltrados.map((s) => [
        s.numero,
        s.nome,
        s.esquadrao,
        `${horasMensais[s.numero] || 0} h`,
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
      ) : loadingHoras ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p>Calculando horas do mês atual...</p>
          <small className="text-muted">Isso pode levar alguns segundos na primeira vez</small>
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
                <option value="Todos">Todos Esquadrões</option>
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
                style={{ width: "120px" }}
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
              {usuarioLogado && temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS") && (
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
                <th>
                  Carga Horária (Mês Atual)
                  <div style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                    {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </div>
                </th>
                <th>Histórico</th>
              </tr>
            </thead>
            <tbody>
              {solipedesPaginados.map((s) => (
                <tr key={s.numero}>
                  <td>{s.numero}</td>
                  <td className="text-start">{s.nome}</td>
                  <td>{s.esquadrao}</td>
                  <td>{horasMensais[s.numero] || 0} h</td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        variant="link"
                        className="rounded-2 shadow-sm"
                        style={{ border: "1px solid black", color: "black" }}
                        onClick={() => abrirHistorico(s.numero)}
                        title="Alteração de carga horária"
                      >
                        <FaClock />
                      </Button>
                      <Button
                        variant="link"
                        className="rounded-2 shadow-sm"
                        style={{ border: "1px solid black", color: "black" }}
                        onClick={() => abrirMovimentacao(s)}
                        title="Movimentação"
                      >
                        <GoArrowSwitch />
                      </Button>
                    </div>
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

          {/* Filtros e tabeoa */}
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

          </Modal.Body>

           {/* Movimentação entre esquadrões */}
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


            {/* ===== TABELA COMPLETA LANÇAMENTO EM LOTE (SEM PAGINAÇÃO) ===== */}
            <Table striped bordered hover size="sm">
              <thead className="table-secondary">
                <tr>
                  <th></th>
                  <th>Número</th>
                  <th>Nome</th>
                  <th>Esquadrão</th>
                  <th>Carga Mês Atual</th>
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
                    <td>{horasMensais[s.numero] || 0} h</td>
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
              <span className="badge bg-info text-dark ms-2">
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <OverlayTrigger
                overlay={
                  <Tooltip>
                    {usuarioLogado && temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS")
                      ? "Você pode editar os lançamentos, caso tenha inserido valores incorretos alterar para 0 ou valor correto e salvar."
                      : "Apenas usuários com permissão podem editar lançamentos"}
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
                  {usuarioLogado && temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS") && <th>Ações</th>}
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
                        step="1"
                        value={Math.round(h.horas)}
                        disabled={!usuarioLogado || !temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS")}
                        onChange={(e) =>
                          usuarioLogado && temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS") &&
                          setHistorico((prev) =>
                            prev.map((x) =>
                              x.id === h.id
                                ? { ...x, horas: parseInt(e.target.value) || 0 }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    {usuarioLogado && temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS") && (
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


      {/* ===== MODAL MOVIMENTAÇÃO ===== */}
      {showMovimentacao && solipedeMovimentacao && (
        <Modal
          show={showMovimentacao}
          onHide={() => setShowMovimentacao(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Movimentação de Solípede</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="mb-4">
              <h6>Informações do Solípede</h6>
              <p className="mb-1">
                <strong>Nome:</strong> {solipedeMovimentacao.nome}
              </p>
              <p className="mb-1">
                <strong>Número:</strong> {solipedeMovimentacao.numero}
              </p>
              <p className="mb-3">
                <strong>Esquadrão Atual:</strong> {solipedeMovimentacao.esquadrao}
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Novo Esquadrão</Form.Label>
                <Form.Select
                  value={esquadraoDestino}
                  onChange={(e) => setEsquadraoDestino(e.target.value)}
                  disabled={!usuarioLogado || !temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS")}
                >
                  <option value="">Selecione o esquadrão</option>
                  <option value="1 Esquadrao">1º Esquadrão</option>
                  <option value="2 Esquadrao">2º Esquadrão</option>
                  <option value="3 Esquadrao">3º Esquadrão</option>
                  <option value="4 Esquadrao">4º Esquadrão</option>
                  <option value="Equoterapia">Equoterapia</option>
                  <option value="Representacao">Representação</option>
                </Form.Select>
              </Form.Group>

              {usuarioLogado && temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS") && (
                <Form.Group className="mb-3">
                  <Form.Label>Confirme sua senha</Form.Label>
                  <FormControl
                    type="password"
                    placeholder="Digite sua senha"
                    value={senhaMovimentacao}
                    onChange={(e) => setSenhaMovimentacao(e.target.value)}
                  />
                </Form.Group>
              )}

              {usuarioLogado && temPermissao(usuarioLogado.perfil, "ADICIONAR_HORAS") && (
                <Button
                  variant="info"
                  onClick={aplicarMovimentacao}
                  disabled={!esquadraoDestino || !senhaMovimentacao || carregando || esquadraoDestino === solipedeMovimentacao.esquadrao}
                  className="w-100"
                >
                  {carregando ? "Movimentando..." : "Confirmar Movimentação"}
                </Button>
              )}
            </div>

            <hr />

            <div>
              <h6 className="mb-3">Histórico de Movimentações</h6>
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoMovimentacao.map((h) => (
                    <tr key={h.id}>
                      <td>{new Date(h.dataMovimentacao).toLocaleString()}</td>
                      <td>{h.esquadraoOrigem}</td>
                      <td>{h.esquadraoDestino}</td>
                      <td className="text-muted" style={{ fontSize: "0.875rem" }}>
                        {h.usuarioNome || "Usuário não identificado"}
                      </td>
                    </tr>
                  ))}

                  {!historicoMovimentacao.length && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        Nenhuma movimentação registrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowMovimentacao(false)}
            >
              Fechar
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
