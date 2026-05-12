import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Form,
  Button,
  Modal,
  FormControl,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Popover,
} from "react-bootstrap";


import { GoArrowSwitch } from "react-icons/go";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";


import { FaClock, FaFileExcel, FaFilePdf, FaInfoCircle } from "react-icons/fa";

import { api } from "../../../services/api";
import { buildUserErrorMessage } from "../../../utils/errorHandling";
import { temPermissao } from "../../../utils/permissions";

import * as XLSX from "xlsx";

const mesesDoAno = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/* =========================
   ADMIN CARGA HORÁRIA
========================= */
const AdminCargaHoraria = () => {
  const anoCorrente = new Date().getFullYear();
  const mesAtualCalendario = new Date().getMonth() + 1;

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

  const [selecionados, setSelecionados] = useState([]);
  const [horasAdicionar, setHorasAdicionar] = useState(0);
  const [dataLancamento, setDataLancamento] = useState(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  });
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
  const [ordenacaoHoras, setOrdenacaoHoras] = useState(null); // null, 'asc', 'desc'
  const [mesSelecionado, setMesSelecionado] = useState(mesAtualCalendario);

  const [filtroNumeroModal, setFiltroNumeroModal] = useState("");
  const [horasMensais, setHorasMensais] = useState({});
  const [loadingHoras, setLoadingHoras] = useState(true);

  /* ===== PAGINAÇÃO ===== */
  const [limiteVisualizacao, setLimiteVisualizacao] = useState(10);

  const opcoesMeses = useMemo(
    () =>
      mesesDoAno
        .slice(0, mesAtualCalendario)
        .map((label, index) => ({ value: index + 1, label })),
    [mesAtualCalendario]
  );


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
        console.log(`🔍 Buscando horas do mês ${mesSelecionado}/${anoCorrente} do backend...`);
        const horasDoBackend = await api.horasMesAtual(mesSelecionado, anoCorrente);
        console.log("✅ Horas recebidas do backend:", horasDoBackend);

        // Verificar se é um objeto válido
        if (horasDoBackend && typeof horasDoBackend === 'object' && !horasDoBackend.error) {
          setHorasMensais(horasDoBackend);
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
  }, [anoCorrente, dados.length, mesSelecionado]);

  // Função para invalidar cache de horas de solípedes específicos
  const invalidarCacheHoras = async () => {
    // Rebuscar todas as horas do backend para garantir consistência
    try {
      const horasDoBackend = await api.horasMesAtual(mesSelecionado, anoCorrente);
      setHorasMensais(horasDoBackend);
    } catch (err) {
      console.error("Erro ao atualizar cache de horas:", err);
    }
  };

  /* ===== FUNÇÃO PARA ALTERNAR ORDENAÇÃO ===== */
  const toggleOrdenacaoHoras = () => {
    if (ordenacaoHoras === null) {
      setOrdenacaoHoras('desc'); // Primeiro clique: maior para menor
    } else if (ordenacaoHoras === 'desc') {
      setOrdenacaoHoras('asc'); // Segundo clique: menor para maior
    } else {
      setOrdenacaoHoras(null); // Terceiro clique: sem ordenação
    }
  };

  /* =====================================================
     FILTRO RPMon + FILTROS DE TELA (SEM DEPENDER DE LOGIN)
  ===================================================== */
  const solipedesFiltrados = useMemo(() => {
    let resultado = dados
      .filter(
        (d) =>
          d.alocacao === "RPMon"
      )
      .filter(
        (d) =>
          (filtroEsqd === "Todos" || d.esquadrao === filtroEsqd) &&
          ((d.nome || "").toLowerCase().includes(filtroNome.toLowerCase()) ||
            String(d.numero).includes(filtroNome))
      );

    // Aplicar ordenação por carga horária se ativa
    if (ordenacaoHoras) {
      resultado = [...resultado].sort((a, b) => {
        const horasA = horasMensais[a.numero] || 0;
        const horasB = horasMensais[b.numero] || 0;
        return ordenacaoHoras === 'asc' ? horasA - horasB : horasB - horasA;
      });
    }

    return resultado;
  }, [dados, filtroEsqd, filtroNome, ordenacaoHoras, horasMensais]);

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
            dataLancamento,
            senha: senhaConfirmacao,
            usuarioId: usuarioLogado.id,
          })
        )
      );

      // Verificar se algum resultado contém erro
      const erros = resultados.filter(r => r.error || r.message?.includes("Senha"));
      if (erros.length > 0) {
        const mensagemErro = buildUserErrorMessage(
          "Falha parcial ao aplicar horas",
          erros[0],
          "Uma ou mais operações de lançamento de horas falharam"
        );
        throw new Error(mensagemErro);
      }

      // Aguardar um pouco para o backend processar
      await new Promise(resolve => setTimeout(resolve, 500));

      // Invalidar cache apenas dos solípedes afetados
      await invalidarCacheHoras();

      await fetchDados();

      setFeedbackMessage("Horas aplicadas com sucesso!");
      setShowFeedback(true);

      setShowModal(false);
      setShowConfirmSenha(false);
      setSelecionados([]);
      setHorasAdicionar(0);
      // mantém a data selecionada; usuário pode reutilizar
      setSenhaConfirmacao("");
    } catch (err) {
      console.error("Erro completo:", err);
      setFeedbackMessage(
        buildUserErrorMessage(
          "Falha ao aplicar horas",
          err,
          "Não foi possível lançar as horas selecionadas"
        )
      );
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
        const historicoFiltrado = response.filter((h) => {
          const data = new Date(h.dataLancamento);
          return (
            data.getMonth() + 1 === mesSelecionado &&
            data.getFullYear() === anoCorrente
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
      setFeedbackMessage(
        buildUserErrorMessage(
          "Falha ao buscar histórico",
          err,
          "Não foi possível consultar o histórico de horas"
        )
      );
      setShowFeedback(true);
    }
  };


  const atualizarHora = async (id, horas) => {
    try {
      await api.atualizarHistorico(id, Number(horas));

      // Aguardar um pouco para o backend processar
      await new Promise(resolve => setTimeout(resolve, 500));

      // Invalidar cache do solípede atual
      await invalidarCacheHoras();

      await fetchDados();
      await abrirHistorico(historicoNumero);

      setFeedbackMessage("Histórico atualizado com sucesso!");
      setShowFeedback(true);
    } catch (err) {
      console.error(err);
      setFeedbackMessage(
        buildUserErrorMessage(
          "Falha ao atualizar histórico",
          err,
          "Não foi possível atualizar as horas lançadas"
        )
      );
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
      setShowFeedback(true);
      return;
    }

    if (esquadraoDestino === solipedeMovimentacao.esquadrao) {
      setFeedbackMessage("O solípede já está neste esquadrão.");
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
      await invalidarCacheHoras();

      await fetchDados();

      setFeedbackMessage(`${solipedeMovimentacao.nome} movimentado para ${esquadraoDestino} com sucesso!`);
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
      setFeedbackMessage(
        buildUserErrorMessage(
          "Falha ao realizar movimentação",
          err,
          "Não foi possível concluir a movimentação do solípede"
        )
      );
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

  const popover = (
    <Popover id="popover-info">
      <Popover.Body>
        Selecione os solípedes e a quantidade de horas para aplicar o lançamento em lote.
        <br />
        * Aplique as seguintes horas padrão para cada tipo de atividade: <br />
        <br />
        - 6h para Policiamento Ordinário, <br />
        - 5h para Dejem ou Delegada, <br />
        - 3h para Curso Tropa Montada, <br />
        - 1h para Instruções.
       </Popover.Body>
    </Popover>
  );

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
          <p>Calculando horas de {mesesDoAno[mesSelecionado - 1]} de {anoCorrente}...</p>
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
                placeholder="Pesquisar por nome ou número"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />

              <Form.Select
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(Number(e.target.value))}
              >
                {opcoesMeses.map((mes) => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label} de {anoCorrente}
                  </option>
                ))}
              </Form.Select>

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
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={toggleOrdenacaoHoras}
                  title="Clique para ordenar"
                >
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <div>
                      Carga Horária ({mesesDoAno[mesSelecionado - 1]})
                      <div style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                        {String(mesSelecionado).padStart(2, '0')}/{anoCorrente}
                      </div>
                    </div>
                    <div>
                      {ordenacaoHoras === null && <FaSort />}
                      {ordenacaoHoras === 'desc' && <FaSortDown />}
                      {ordenacaoHoras === 'asc' && <FaSortUp />}
                    </div>
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
            <Modal.Title className="d-flex align-items-center gap-2">
              Aplicar Carga Horária

              <OverlayTrigger trigger="click" placement="right" overlay={popover}>
                <FaInfoCircle style={{ cursor: "pointer" }} />
              </OverlayTrigger>

            </Modal.Title>
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

                <div className="col-md-3">
                  <Form.Label>Horas a adicionar</Form.Label>
                  <FormControl
                    type="number"
                    min="1"
                    value={horasAdicionar}
                    onChange={(e) => setHorasAdicionar(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <Form.Label>Data do lançamento</Form.Label>
                  <FormControl
                    type="date"
                    value={dataLancamento}
                    onChange={(e) => setDataLancamento(e.target.value)}
                  />
                  <small className="text-muted">Permite backdate do registro</small>
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
                  <th>Carga em {mesesDoAno[mesSelecionado - 1]}</th>
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
                {mesesDoAno[mesSelecionado - 1]} de {anoCorrente}
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
                      {new Date(h.dataLancamento).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
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
