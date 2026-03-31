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
  BsInfoCircle,
  BsPlus,
  BsPencil,
  BsTrash,
} from "react-icons/bs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../../../services/api";
import { buildUserErrorMessage } from "../../../utils/errorHandling";
import { isAuthenticated, getUsuarioLogado } from "../../../utils/auth";

const normalizarNumeroSolipede = (numero) => {
  const valor = String(numero ?? "").trim();
  if (/^\d+$/.test(valor)) {
    return String(Number(valor));
  }
  return valor.toUpperCase();
};

const gerarChavesNumeroSolipede = (numero) => {
  const valorBruto = String(numero ?? "").trim();
  if (!valorBruto) return [];

  const chaves = new Set([
    valorBruto,
    valorBruto.toUpperCase(),
    normalizarNumeroSolipede(valorBruto),
  ]);

  if (/^\d+$/.test(valorBruto)) {
    chaves.add(String(Number(valorBruto)));
  }

  return Array.from(chaves).filter(Boolean);
};

const possuiObservacaoNoSet = (setNumeros, numero) =>
  gerarChavesNumeroSolipede(numero).some((chave) => setNumeros.has(chave));

const DashboardList = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Autenticação e permissões
  const usuarioLogado = getUsuarioLogado();
  
  // Permissão especial para Observações Comportamentais nesta página
  // Apenas perfil "Observacao Comportamental" pode adicionar observações comportamentais
  const perfisPermitidosObservacao = ["Observacao Comportamental", "Veterinario Admin", "Desenvolvedor"];
  const podeEditarObservacao =
    isAuthenticated() && usuarioLogado && perfisPermitidosObservacao.includes(usuarioLogado.perfil);
  const perfisPermitidosBaia = ["Pagador de cavalo", "Pagador de cavalos", "Veterinario", "Veterinario Admin", "Desenvolvedor"];
  const podeEditarBaia = isAuthenticated() && usuarioLogado && perfisPermitidosBaia.includes(usuarioLogado.perfil);

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
  
  // modal observações
  const [showModalObservacoes, setShowModalObservacoes] = useState(false);
  const [observacoesSelecionadas, setObservacoesSelecionadas] = useState(null);
  const [observacoes, setObservacoes] = useState([]);
  const [loadingObservacoes, setLoadingObservacoes] = useState(false);
  const [solipedesComObservacoes, setSolipedesComObservacoes] = useState(new Set());
  
  // modal criar observação
  const [showModalCriarObservacao, setShowModalCriarObservacao] = useState(false);
  const [solipedeSelecionadoParaCriar, setSolipedeSelecionadoParaCriar] = useState(null);
  const [novaObservacao, setNovaObservacao] = useState("");
  const [novaRecomendacao, setNovaRecomendacao] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [salvandoObservacao, setSalvandoObservacao] = useState(false);
  
  // modal editar observação
  const [showModalEditarObservacao, setShowModalEditarObservacao] = useState(false);
  const [observacaoEditando, setObservacaoEditando] = useState(null);
  const [observacaoEditada, setObservacaoEditada] = useState("");
  const [recomendacaoEditada, setRecomendacaoEditada] = useState("");
  const [editandoObservacao, setEditandoObservacao] = useState(false);
  
  // ferrageamento
  const [ferrageamentos, setFerrageamentos] = useState({});

  // modal editar baia
  const [showModalEditarBaia, setShowModalEditarBaia] = useState(false);
  const [solipedeEditandoBaia, setSolipedeEditandoBaia] = useState(null);
  const [baiaEditada, setBaiaEditada] = useState("");
  const [salvandoBaia, setSalvandoBaia] = useState(false);

  // 🔹 FUNÇÃO PARA CALCULAR IDADE
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "N/A";
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  };

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
  const obterDataObservacao = (obs) => obs?.data_lancamento || obs?.data_criacao;

  const dadosFiltrados = useMemo(() => {
    const termo = filtroTexto.toLowerCase();

    const filtrados = dados
      .filter(
        (item) =>
          item.nome?.toLowerCase().includes(termo) ||
          String(item.numero).includes(termo) ||
          item.esquadrao?.toLowerCase().includes(termo) ||
          item.baia?.toLowerCase().includes(termo)
      )
      .map(item => ({
        ...item,
        idade: calcularIdade(item.DataNascimento),
        temRestricao: solipedesComRestricao.has(normalizarNumeroSolipede(item.numero)),
        temObservacoes: possuiObservacaoNoSet(solipedesComObservacoes, item.numero)
      }));

    return filtrados.sort((a, b) => {
      let valorA = a[campoOrdenacao] ?? "";
      let valorB = b[campoOrdenacao] ?? "";

      // Se for ordenação por idade, converter "N/A" para -1 para manter no final
      if (campoOrdenacao === "idade") {
        valorA = valorA === "N/A" ? -1 : Number(valorA);
        valorB = valorB === "N/A" ? -1 : Number(valorB);
      }

      // Se for ordenação por campos booleanos (restrições/observações), converter para número
      if (campoOrdenacao === "temRestricao" || campoOrdenacao === "temObservacoes") {
        valorA = valorA ? 1 : 0;
        valorB = valorB ? 1 : 0;
      }

      if (typeof valorA === "number") {
        return direcaoOrdenacao === "asc"
          ? valorA - valorB
          : valorB - valorA;
      }

      return direcaoOrdenacao === "asc"
        ? String(valorA).localeCompare(String(valorB), "pt-BR")
        : String(valorB).localeCompare(String(valorA), "pt-BR");
    });
  }, [dados, filtroTexto, campoOrdenacao, direcaoOrdenacao, solipedesComRestricao, solipedesComObservacoes]);

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
  const exportarExcel = async () => {
    try {
      // Buscar restrições e observações para todos os solípedes filtrados
      const dadosExportacao = await Promise.all(
        dadosFiltrados.map(async (item) => {
          const ferrageamento = ferrageamentos[item.numero];
          const proximoFerrageamento = ferrageamento?.proximo_ferrageamento;
          const diasRestantes = proximoFerrageamento 
            ? Math.ceil((new Date(proximoFerrageamento) - new Date()) / (1000 * 60 * 60 * 24))
            : null;
          
          // Buscar restrições
          let restricoesTexto = "Nenhuma";
          try {
            const restricoes = await api.listarProntuarioPublico(item.numero);
            if (Array.isArray(restricoes) && restricoes.length > 0) {
              restricoesTexto = restricoes
                .map(r => `${new Date(r.data_criacao).toLocaleDateString("pt-BR")}: ${r.observacao}`)
                .join(" | ");
            }
          } catch (error) {
            console.error(`Erro ao buscar restrições do solípede ${item.numero}:`, error);
          }

          // Buscar observações
          let observacoesTexto = "Nenhuma";
          try {
            const obs = await api.listarObservacoesPublico(item.numero);
            if (Array.isArray(obs) && obs.length > 0) {
              observacoesTexto = obs
                .map((o) => {
                  const dataObs = obterDataObservacao(o);
                  const tipoObs = o.tipo || "Observações Comportamentais";
                  return `${new Date(dataObs).toLocaleDateString("pt-BR")} [${tipoObs}]: ${o.observacao}`;
                })
                .join(" | ");
            }
          } catch (error) {
            console.error(`Erro ao buscar observações do solípede ${item.numero}:`, error);
          }

          return {
            Número: item.numero,
            Nome: item.nome,
            Idade: `${calcularIdade(item.DataNascimento)} anos`,
            Esquadrão: item.esquadrao || "-",
            Status: item.status,
            Restrições: restricoesTexto,
            Observações: observacoesTexto,
            "Validade Ferrageamento": proximoFerrageamento 
              ? new Date(proximoFerrageamento).toLocaleDateString("pt-BR")
              : "-",
            "Dias Restantes": diasRestantes !== null 
              ? (diasRestantes < 0 ? `${Math.abs(diasRestantes)} dias vencido` : `${diasRestantes} dias`)
              : "-"
          };
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
      
      // Ajustar largura das colunas
      const columnWidths = [
        { wch: 8 },  // Número
        { wch: 20 }, // Nome
        { wch: 12 }, // Idade
        { wch: 15 }, // Esquadrão
        { wch: 10 }, // Status
        { wch: 60 }, // Restrições
        { wch: 60 }, // Observações
        { wch: 20 }, // Validade Ferrageamento
        { wch: 15 }  // Dias Restantes
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Solípedes RPMon");

      XLSX.writeFile(workbook, "solipedes_rpmon.xlsx");
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      alert(
        buildUserErrorMessage(
          "Falha ao exportar Excel",
          error,
          "Não foi possível gerar o arquivo Excel"
        )
      );
    }
  };

  // 📤 EXPORTA PDF
  const exportarPDF = () => {
    const doc = new jsPDF("landscape");

    doc.text("Solípedes Alocados – RPMon", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Número", "Nome", "Idade", "Esquadrão", "Status", "Restrições", "Observações", "Validade Ferrageamento"]],
      body: dadosFiltrados.map((item) => {
        const ferrageamento = ferrageamentos[item.numero];
        const proximoFerrageamento = ferrageamento?.proximo_ferrageamento;
        const diasRestantes = proximoFerrageamento 
          ? Math.ceil((new Date(proximoFerrageamento) - new Date()) / (1000 * 60 * 60 * 24))
          : null;
        
        const temRestricao = solipedesComRestricao.has(normalizarNumeroSolipede(item.numero));
        const temObservacoes = possuiObservacaoNoSet(solipedesComObservacoes, item.numero);

        return [
          item.numero,
          item.nome,
          `${calcularIdade(item.DataNascimento)} anos`,
          item.esquadrao || "-",
          item.status,
          temRestricao ? "Sim" : "Não",
          temObservacoes ? "Sim" : "Não",
          proximoFerrageamento 
            ? `${new Date(proximoFerrageamento).toLocaleDateString("pt-BR")} (${diasRestantes < 0 ? `${Math.abs(diasRestantes)}d vencido` : `${diasRestantes}d`})`
            : "-"
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 73, 58] }
    });

    doc.save("solipedes_rpmon.pdf");
  };

  // 📋 ABRIR MODAL DE PRONTUÁRIO
  const abrirProntuario = async (solipede) => {
    setLoadingProntuario(true);
    setProntuarioSelecionado(solipede);

    try {
      const response = await api.listarProntuarioPublico(solipede.numero);
      
      // A API já retorna apenas restrições (tipo = 'restrições')
      if (Array.isArray(response) && response.length > 0) {
        setProntuarios(response);
        setShowModalProntuario(true);
      } else {
        setProntuarios([]);
      }
    } catch (error) {
      console.error("Erro ao buscar prontuário:", error);
      setProntuarios([]);
    } finally {
      setLoadingProntuario(false);
    }
  };
  
  // 📝 ABRIR MODAL DE OBSERVAÇÕES
  const abrirObservacoes = async (solipede) => {
    setLoadingObservacoes(true);
    setObservacoesSelecionadas(solipede);

    try {
      const response = await api.listarObservacoesPublico(solipede.numero);
      
      if (Array.isArray(response) && response.length > 0) {
        setObservacoes(response);
        setSolipedesComObservacoes((prev) => {
          const proximo = new Set(prev);
          proximo.add(normalizarNumeroSolipede(solipede.numero));
          return proximo;
        });
        setShowModalObservacoes(true);
      } else {
        setObservacoes([]);
        setShowModalObservacoes(true);
      }
    } catch (error) {
      console.error("Erro ao buscar observações:", error);
      setObservacoes([]);
    } finally {
      setLoadingObservacoes(false);
    }
  };
  
  // ➕ ABRIR MODAL PARA CRIAR OBSERVAÇÃO
  const abrirModalCriarObservacao = (solipede) => {
    setSolipedeSelecionadoParaCriar(solipede);
    setNovaObservacao("");
    setNovaRecomendacao("");
    setShowModalCriarObservacao(true);
  };
  
  // 💾 SALVAR NOVA OBSERVAÇÃO
  const salvarNovaObservacao = async () => {
    if (!novaObservacao.trim()) {
      alert("Por favor, preencha a observação.");
      return;
    }

    if (!senhaConfirmacao.trim()) {
      alert("Por favor, digite sua senha para confirmar.");
      return;
    }

    setSalvandoObservacao(true);

    try {
      const dadosObservacao = {
        numero_solipede: solipedeSelecionadoParaCriar.numero,
        tipo: "Observações Comportamentais",
        observacao: novaObservacao.trim(),
        recomendacoes: novaRecomendacao.trim() || null,
        senha: senhaConfirmacao,
      };

      console.log("📤 Enviando dados para API:", dadosObservacao);
      
      const response = await api.criarObservacao(dadosObservacao);
      
      console.log("✅ Resposta da API:", response);

      if (response?.error) {
        throw new Error(response.error);
      }
      
      if (response.success || response.id) {
        alert(`✅ Observação comportamental criada com sucesso para ${solipedeSelecionadoParaCriar.nome}!`);
        
        // Fechar modal
        setShowModalCriarObservacao(false);
        
        // Recarregar lista de solípedes com observações
        try {
          const numerosComObservacoes = await api.listarSolipedesComObservacoes();
          const comObservacoes = new Set();
          (Array.isArray(numerosComObservacoes) ? numerosComObservacoes : []).forEach((numero) => {
            gerarChavesNumeroSolipede(numero).forEach((chave) => comObservacoes.add(chave));
          });
          setSolipedesComObservacoes(comObservacoes);
          console.log("🔄 Lista de observações atualizada");
        } catch (error) {
          console.error("⚠️ Erro ao recarregar lista de observações:", error);
        }
      } else {
        throw new Error(response.error || "Erro desconhecido ao salvar observação");
      }
      
    } catch (error) {
      console.error("❌ Erro ao salvar observação:", error);
      const mensagemErro = String(error?.message || "");

      if (mensagemErro.toLowerCase().includes("senha")) {
        alert("Não foi possível realizar a operação: senha incorreta.");
      } else {
        alert("Não foi possível realizar a operação. Tente novamente.");
      }
    } finally {
      setSalvandoObservacao(false);
    }
  };
  
  // ✏️ ABRIR MODAL PARA EDITAR OBSERVAÇÃO
  const abrirModalEditarObservacao = (observacao) => {
    setObservacaoEditando(observacao);
    setObservacaoEditada(observacao.observacao);
    setRecomendacaoEditada(observacao.recomendacoes || "");
    setShowModalEditarObservacao(true);
    setShowModalObservacoes(false); // Fechar modal de listagem
  };
  
  // 💾 SALVAR EDIÇÃO DE OBSERVAÇÃO
  const salvarEdicaoObservacao = async () => {
    if (!observacaoEditada.trim()) {
      alert("Por favor, preencha a observação.");
      return;
    }

    setEditandoObservacao(true);

    try {
      const dadosAtualizados = {
        observacao: observacaoEditada.trim(),
        recomendacoes: recomendacaoEditada.trim() || null,
      };

      console.log("📤 Editando observação ID:", observacaoEditando.id, dadosAtualizados);
      
      const response = await api.editarObservacao(observacaoEditando.id, dadosAtualizados);
      
      if (response.success) {
        alert("✅ Observação atualizada com sucesso!");
        
        setShowModalEditarObservacao(false);
        
        // Recarregar observações
        await abrirObservacoes(observacoesSelecionadas);
      } else {
        throw new Error(response.error || "Erro ao atualizar observação");
      }
    } catch (error) {
      console.error("❌ Erro ao editar observação:", error);
      alert(
        buildUserErrorMessage(
          "Falha ao editar observação",
          error,
          "Não foi possível atualizar a observação comportamental"
        )
      );
    } finally {
      setEditandoObservacao(false);
    }
  };
  
  // 🗑️ DELETAR OBSERVAÇÃO
  const deletarObservacao = async (id, solipede) => {
    if (!window.confirm("⚠️ Tem certeza que deseja excluir esta observação?")) {
      return;
    }

    try {
      console.log("🗑️ Deletando observação ID:", id);
      
      const response = await api.deletarObservacao(id);
      
      if (response.success) {
        alert("✅ Observação excluída com sucesso!");
        
        // Recarregar observações
        await abrirObservacoes(solipede);
        
        // Recarregar lista de solípedes com observações
        const numerosComObservacoes = await api.listarSolipedesComObservacoes();
        const comObservacoes = new Set();
        (Array.isArray(numerosComObservacoes) ? numerosComObservacoes : []).forEach((numero) => {
          gerarChavesNumeroSolipede(numero).forEach((chave) => comObservacoes.add(chave));
        });
        setSolipedesComObservacoes(comObservacoes);
      } else {
        throw new Error(response.error || "Erro ao excluir observação");
      }
    } catch (error) {
      console.error("❌ Erro ao deletar observação:", error);
      alert(
        buildUserErrorMessage(
          "Falha ao excluir observação",
          error,
          "Não foi possível excluir a observação comportamental"
        )
      );
    }
  };

  const abrirModalEditarBaia = (solipede) => {
    setSolipedeEditandoBaia(solipede);
    setBaiaEditada(solipede.baia || "");
    setShowModalEditarBaia(true);
  };

  const salvarEdicaoBaia = async () => {
    if (!solipedeEditandoBaia) return;

    setSalvandoBaia(true);

    try {
      const resposta = await api.atualizarSolipede(solipedeEditandoBaia.numero, {
        baia: baiaEditada.trim() || null,
      });

      if (resposta?.error) {
        throw new Error(resposta.error);
      }

      setDados((prev) =>
        prev.map((item) =>
          item.numero === solipedeEditandoBaia.numero
            ? { ...item, baia: baiaEditada.trim() || null }
            : item
        )
      );

      setShowModalEditarBaia(false);
      alert("✅ Baia atualizada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao atualizar baia:", error);
      alert(
        buildUserErrorMessage(
          "Falha ao atualizar baia",
          error,
          "Não foi possível atualizar a baia do solípede"
        )
      );
    } finally {
      setSalvandoBaia(false);
    }
  };

  // 🔍 VERIFICAR RESTRIÇÕES (chamado automaticamente ao carregar) - OTIMIZADO
  useEffect(() => {
    const verificarRestricoes = async () => {
      try {
        // 🚀 UMA ÚNICA CHAMADA: retorna array de números com lançamentos de restrição
        const numerosComRestricao = await api.listarSolipedesComRestricao();
        
        // Converter para Set para busca rápida
        const comRestricao = new Set(
          (Array.isArray(numerosComRestricao) ? numerosComRestricao : [])
            .map(normalizarNumeroSolipede)
            .filter(Boolean)
        );
        
        setSolipedesComRestricao(comRestricao);
        
        console.log(`✅ Restrições carregadas: ${comRestricao.size} solípedes com lançamentos de restrição`);
      } catch (error) {
        console.error("❌ Erro ao verificar restrições:", error);
        setSolipedesComRestricao(new Set());
      }
    };

    if (dados.length > 0) {
      verificarRestricoes();
    }
  }, [dados]);
  
  // 📝 VERIFICAR OBSERVAÇÕES
  useEffect(() => {
    const verificarObservacoes = async () => {
      try {
        const numerosComObservacoes = await api.listarSolipedesComObservacoes();
        const comObservacoes = new Set();
        (Array.isArray(numerosComObservacoes) ? numerosComObservacoes : []).forEach((numero) => {
          gerarChavesNumeroSolipede(numero).forEach((chave) => comObservacoes.add(chave));
        });

        setSolipedesComObservacoes(comObservacoes);
        console.log(`✅ Observações carregadas: ${comObservacoes.size} solípedes com observações`);
      } catch (error) {
        console.error("❌ Erro ao verificar observações:", error);
        setSolipedesComObservacoes(new Set());
      }
    };

    if (dados.length > 0) {
      verificarObservacoes();
    }
  }, [dados]);
  
  // 🔧 BUSCAR FERRAGEAMENTOS
  useEffect(() => {
    const buscarFerrageamentos = async () => {
      try {
        const response = await api.listarFerrageamentosPublico();
        
        // Criar objeto com último ferrageamento de cada solípede
        const ferrageamentosMap = {};
        if (Array.isArray(response)) {
          response.forEach(f => {
            if (!ferrageamentosMap[f.solipede_numero] || 
                new Date(f.proximo_ferrageamento) > new Date(ferrageamentosMap[f.solipede_numero].proximo_ferrageamento)) {
              ferrageamentosMap[f.solipede_numero] = f;
            }
          });
        }
        
        setFerrageamentos(ferrageamentosMap);
        console.log(`✅ Ferrageamentos carregados: ${Object.keys(ferrageamentosMap).length} registros`);
      } catch (error) {
        console.error("❌ Erro ao buscar ferrageamentos:", error);
        setFerrageamentos({});
      }
    };

    if (dados.length > 0) {
      buscarFerrageamentos();
    }
  }, [dados]);

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
            placeholder="Filtrar por nome, número, esquadrão ou baia"
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
              <CabecalhoOrdenavel label="Idade" campo="idade" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Esquadrão" campo="esquadrao" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Baia" campo="baia" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Status" campo="status" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Restrições" campo="temRestricao" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Observações" campo="temObservacoes" />
            </th>
            <th>
              <CabecalhoOrdenavel label="Validade Ferrageamento" campo="numero" />
            </th>
          </tr>
        </thead>

        <tbody>
          {dadosPaginados.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            dadosPaginados.map((item) => {
              const baixado = item.status?.toLowerCase() === "baixado";
              
              // Estados das restrições
              const temRestricao = solipedesComRestricao.has(normalizarNumeroSolipede(item.numero));
              
              // Observações
              const temObservacoes = item.temObservacoes || possuiObservacaoNoSet(solipedesComObservacoes, item.numero);
              
              // Ferrageamento
              const ferrageamento = ferrageamentos[item.numero];
              const proximoFerrageamento = ferrageamento?.proximo_ferrageamento;
              const diasRestantes = proximoFerrageamento 
                ? Math.ceil((new Date(proximoFerrageamento) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <tr key={item.numero}>
                  <td className="text-center fw-semibold">
                    {item.numero}
                  </td>
                  <td>{item.nome}</td>
                  <td className="text-center">{item.idade} anos</td>
                  <td className="text-center">
                    {item.esquadrao || "-"}
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <span>{item.baia || "-"}</span>
                      {podeEditarBaia && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          title="Editar baia"
                          onClick={() => abrirModalEditarBaia(item)}
                        >
                          <BsPencil size={12} />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    <Badge bg={baixado ? "danger" : temRestricao ? "warning" : "success"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {temRestricao && (
                      <span
                        style={{
                          backgroundColor: "#cfe2ff",
                          border: "2px solid #0d6efd",
                          borderRadius: "8px",
                          padding: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onClick={() => abrirProntuario(item)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#9ec5fe";
                          e.currentTarget.style.borderColor = "#0a58ca";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#cfe2ff";
                          e.currentTarget.style.borderColor = "#0d6efd";
                        }}
                        title="Possui restrições lançadas - Clique para ver"
                      >
                        <BsClockHistory
                          size={10}
                          role="button"
                          style={{
                            fontSize: "1.2rem",
                            color: "#0a58ca",
                          }}
                        />
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      {/* Botão adicionar observação - Apenas para usuários com permissão */}
                      {podeEditarObservacao && (
                        <span
                          style={{
                            backgroundColor: "#d4f4dd",
                            border: "2px solid #28a745",
                            borderRadius: "8px",
                            padding: "8px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onClick={() => abrirModalCriarObservacao(item)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#b8ecc7";
                            e.currentTarget.style.borderColor = "#1e7e34";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#d4f4dd";
                            e.currentTarget.style.borderColor = "#28a745";
                          }}
                          title="Adicionar observação comportamental"
                        >
                          <BsPlus
                            size={20}
                            role="button"
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                              color: "#1e7e34",
                            }}
                          />
                        </span>
                      )}
                      
                      {/* Botão ver observações - Apenas se houver observações no banco */}
                      {temObservacoes && (
                        <span
                          style={{
                            backgroundColor: "#ffffff",
                            border: "2px solid #6c757d",
                            borderRadius: "8px",
                            padding: "8px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onClick={() => abrirObservacoes(item)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f9fa";
                            e.currentTarget.style.borderColor = "#495057";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#ffffff";
                            e.currentTarget.style.borderColor = "#6c757d";
                          }}
                          title="Ver observações comportamentais"
                        >
                          <BsInfoCircle
                            size={16}
                            role="button"
                            className="text-dark"
                          />
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="text-center">
                    {proximoFerrageamento ? (
                      <div
                        style={{
                          display: "inline-block",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          // backgroundColor: "#ffffff",
                          // border: `2px solid ${diasRestantes < 0 ? "#dc3545" : diasRestantes <= 7 ? "#ffc107" : "#36493aff"}`,
                          fontSize: "13px",
                        }}
                      >
                        <div style={{ color: "#212529", fontWeight: "500" }}>
                          {/* <BsTools className="me-1" style={{ color: diasRestantes < 0 ? "#dc3545" : diasRestantes <= 7 ? "#ffc107" : "#36493aff" }} /> */}
                          {new Date(proximoFerrageamento).toLocaleDateString("pt-BR")}
                        </div>
                        {diasRestantes !== null && (
                          <small style={{ color: "#0a0c0eff", display: "block", marginTop: "2px" }}>
                            {diasRestantes < 0 
                              ? `${Math.abs(diasRestantes)} dias vencido` 
                              : `${diasRestantes} dias`}
                          </small>
                        )}
                      </div>
                    ) : (
                      <small className="text-muted">-</small>
                    )}
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

      <Modal
        show={showModalEditarBaia}
        onHide={() => setShowModalEditarBaia(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Editar Baia - {solipedeEditandoBaia?.nome} (#{solipedeEditandoBaia?.numero})
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">Baia</Form.Label>
            <Form.Control
              type="text"
              placeholder="Informe a baia do solípede"
              value={baiaEditada}
              onChange={(e) => setBaiaEditada(e.target.value)}
              maxLength={80}
            />
            <Form.Text className="text-muted">
              Deixe em branco para remover a informação da baia.
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalEditarBaia(false)}
            disabled={salvandoBaia}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={salvarEdicaoBaia}
            disabled={salvandoBaia}
          >
            {salvandoBaia ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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
              <p>Nenhuma restrição encontrada</p>
            </div>
          ) : (
            <Table striped bordered hover size="sm">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "15%" }}>Data</th>
                  <th>Restrição</th>
                  <th style={{ width: "25%" }}>Recomendações</th>
                  <th style={{ width: "15%" }}>Validade</th>
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
                    <td className="text-center">
                      {p.data_validade ? (
                        <Badge bg="warning" text="dark">
                          {new Date(p.data_validade).toLocaleDateString("pt-BR")}
                        </Badge>
                      ) : (
                        <small className="text-muted">-</small>
                      )}
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

      {/* 📝 MODAL OBSERVAÇÕES GERAIS */}
      <Modal
        show={showModalObservacoes}
        onHide={() => setShowModalObservacoes(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Observações - {observacoesSelecionadas?.nome} (#{observacoesSelecionadas?.numero})
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loadingObservacoes ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
              <div className="text-muted mt-2">Carregando observações...</div>
            </div>
          ) : observacoes.length === 0 ? (
            <div className="text-center text-muted py-4">
              <BsInfoCircle size={48} className="mb-3 opacity-50" />
              <p>Nenhuma observação encontrada</p>
            </div>
          ) : (
            <Table striped bordered hover size="sm">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "10%" }}>Data</th>
                  <th style={{ width: "auto" }}>Observações Comportamentais</th>
                  <th  style={{ width: "auto" }}>Recomendações</th>
                  <th style={{ width: "30%" }}>Usuário</th>
                  {podeEditarObservacao && <th style={{ width: "10%" }} className="text-center">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {observacoes.map((obs) => (
                  <tr key={obs.id}>
                    <td className="text-center align-items-center">
                      {new Date(obterDataObservacao(obs)).toLocaleDateString("pt-BR")}
                      <br />
                      <small className="text-muted ">
                        {new Date(obterDataObservacao(obs)).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </td>
                    
                    <td>
                      <div style={{ fontSize: "14px" }}>
                        {obs.observacao}
                      </div>
                    </td>
                    <td>
                       {obs.recomendacoes && (
                        <small className="text-muted d-block mt-1">
                          {obs.recomendacoes}
                        </small>
                      )}
                    </td>
                    <td style={{ fontSize: "13px" }}>
                      <div>
                        {obs.usuario_nome || "N/A"}
                        {obs.usuario_re && ` (RE: ${obs.usuario_re})`}
                      </div>
                      {obs.usuario_atualizacao_nome && (
                        <div className="mt-2">
                          <strong className="text-warning">Atualizado:</strong>
                          <br />
                          {obs.usuario_atualizacao_nome}
                          {obs.usuario_atualizacao_re && ` (RE: ${obs.usuario_atualizacao_re})`}
                          <br />
                          <small className="text-muted">
                            {new Date(obs.data_atualizacao).toLocaleDateString("pt-BR")} {new Date(obs.data_atualizacao).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </div>
                      )}
                    </td>
                    {podeEditarObservacao && !obs.somente_leitura && (
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            title="Editar observação"
                            onClick={() => abrirModalEditarObservacao(obs)}
                          >
                            <BsPencil size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Excluir observação"
                            onClick={() => deletarObservacao(obs.id, observacoesSelecionadas)}
                          >
                            <BsTrash size={14} />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalObservacoes(false)}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ➕ MODAL CRIAR OBSERVAÇÃO COMPORTAMENTAL */}
      <Modal
        show={showModalCriarObservacao}
        onHide={() => setShowModalCriarObservacao(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#f8f9fa" }}>
          <Modal.Title>
            <BsPlus size={28} className="text-success me-2" />
            Nova Observação Comportamental
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3 p-3" style={{ backgroundColor: "#e7f3ff", borderRadius: "8px", border: "1px solid #b3d9ff" }}>
            <div className="d-flex align-items-center">
              <BsInfoCircle size={20} className="text-primary me-2" />
              <div>
                <strong>Solípede:</strong> {solipedeSelecionadoParaCriar?.nome} 
                <Badge bg="secondary" className="ms-2">#{solipedeSelecionadoParaCriar?.numero}</Badge>
              </div>
            </div>
            <small className="text-muted d-block mt-1">
              Tipo: <strong>Observações Comportamentais</strong>
            </small>
          </div>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Observação <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Descreva a observação comportamental do solípede..."
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Recomendações <span className="text-muted">(opcional)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Adicione recomendações relacionadas à observação (opcional)..."
                value={novaRecomendacao}
                onChange={(e) => setNovaRecomendacao(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Senha de Confirmação <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Digite sua senha para confirmar a operação"
                value={senhaConfirmacao}
                onChange={(e) => setSenhaConfirmacao(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Por segurança, confirme sua senha para registrar esta observação.
              </Form.Text>
            </Form.Group>

            <div className="alert alert-info d-flex align-items-start" role="alert">
              <BsInfoCircle size={20} className="me-2 mt-1" />
              <div>
                <strong>Informações automáticas:</strong>
                <ul className="mb-0 mt-2" style={{ fontSize: "14px" }}>
                  <li>Data/hora de criação será registrada automaticamente</li>
                  <li>Seu usuário será vinculado como responsável pelo lançamento</li>
                  <li>Histórico de alterações será mantido</li>
                </ul>
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalCriarObservacao(false)}
            disabled={salvandoObservacao}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={salvarNovaObservacao}
            disabled={salvandoObservacao || !novaObservacao.trim() || !senhaConfirmacao.trim()}
          >
            {salvandoObservacao ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              <>
                <BsPlus size={20} />
                Salvar Observação
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✏️ MODAL EDITAR OBSERVAÇÃO */}
      <Modal
        show={showModalEditarObservacao}
        onHide={() => {
          setShowModalEditarObservacao(false);
          setShowModalObservacoes(true); // Reabrir modal de listagem
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#fff3cd", borderBottom: "2px solid #ffc107" }}>
          <Modal.Title>
            <BsPencil size={24} className="text-warning me-2" />
            Editar Observação Comportamental
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3 p-3" style={{ backgroundColor: "#e7f3ff", borderRadius: "8px", border: "1px solid #b3d9ff" }}>
            <div className="d-flex align-items-center">
              <BsInfoCircle size={20} className="text-primary me-2" />
              <div>
                <strong>Solípede:</strong> {observacoesSelecionadas?.nome} 
                <Badge bg="secondary" className="ms-2">#{observacoesSelecionadas?.numero}</Badge>
              </div>
            </div>
            <small className="text-muted d-block mt-1">
              Criado em: <strong>{observacaoEditando && new Date(obterDataObservacao(observacaoEditando)).toLocaleString("pt-BR")}</strong>
            </small>
          </div>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Observação <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={observacaoEditada}
                onChange={(e) => setObservacaoEditada(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Recomendações <span className="text-muted">(opcional)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={recomendacaoEditada}
                onChange={(e) => setRecomendacaoEditada(e.target.value)}
              />
            </Form.Group>

            <div className="alert alert-warning d-flex align-items-start" role="alert">
              <BsInfoCircle size={20} className="me-2 mt-1" />
              <div>
                <strong>Auditoria de alterações:</strong>
                <ul className="mb-0 mt-2" style={{ fontSize: "14px" }}>
                  <li>Seu usuário será registrado como responsável pela edição</li>
                  <li>Data/hora da alteração será salva automaticamente</li>
                  <li>O histórico completo será mantido</li>
                </ul>
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModalEditarObservacao(false);
              setShowModalObservacoes(true); // Reabrir modal de listagem
            }}
            disabled={editandoObservacao}
          >
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={salvarEdicaoObservacao}
            disabled={editandoObservacao || !observacaoEditada.trim()}
          >
            {editandoObservacao ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              <>
                <BsPencil size={16} className="me-1" />
                Salvar Alterações
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashboardList;
