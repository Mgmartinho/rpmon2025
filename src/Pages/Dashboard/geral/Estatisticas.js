import { useMemo, useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Spinner } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../../services/api";

const Estatisticas = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEsqd, setFiltroEsqd] = useState("Todos");
  const [evolucaoAnualCategorias, setEvolucaoAnualCategorias] = useState([]);
  const [categoriasHoras, setCategoriasHoras] = useState([
    "1 Esquadrao",
    "2 Esquadrao",
    "3 Esquadrao",
    "4 Esquadrao",
    "Equoterapia",
    "Representacao",
  ]);
  const [historicoCompleto, setHistoricoCompleto] = useState({});

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const res = await api.listarSolipedesPublico();
        if (res && res.error) {
          console.warn("Erro ao buscar dados:", res.error);
          setDados([]);
        } else if (Array.isArray(res)) {
          setDados(res);
        } else {
          setDados([]);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setDados([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  // Buscar horas do mês atual do backend (otimizado)
  useEffect(() => {
    if (dados.length === 0) return;

    const buscarHorasMesAtual = async () => {
      try {
        const horasMensais = await api.horasMesAtual();
        
        // Agrupar por esquadrão
        const historicos = {};
        dados.filter(d => d.alocacao === "RPMon").forEach(solipede => {
          historicos[solipede.numero] = {
            esquadrao: solipede.esquadrao,
            horasMesAtual: horasMensais[solipede.numero] || 0
          };
        });
        
        setHistoricoCompleto(historicos);
      } catch (err) {
        console.error("Erro ao buscar horas do mês atual:", err);
        setHistoricoCompleto({});
      }
    };

    buscarHorasMesAtual();
  }, [dados]);

  useEffect(() => {
    const fetchIndicadores = async () => {
      try {
        const anoAtual = new Date().getFullYear();
        const res = await api.indicadoresAnuais(anoAtual);
        if (res) {
          setEvolucaoAnualCategorias(res.meses || []);
          if (Array.isArray(res.categorias)) {
            setCategoriasHoras(res.categorias);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar indicadores anuais", err);
      }
    };
    fetchIndicadores();
  }, []);

  

  const normalizar = (txt) => (txt ? txt.toLowerCase().trim() : "");

  // ===== Filtrar somente RPMon =====
  const dadosRPMon = useMemo(() => {
    return dados.filter((d) => d.alocacao === "RPMon");
  }, [dados]);

  // ===== KPIs =====
  const total = dadosRPMon.length;
  const ativos = dadosRPMon.filter((d) => normalizar(d.status) === "ativo").length;
  const baixados = dadosRPMon.filter((d) =>
    normalizar(d.status).includes("baix")
  ).length;
  const totalHoras = dadosRPMon.reduce(
    (acc, d) =>
      acc + (d.historicoHoras || []).reduce((a, h) => a + (h.horas || 0), 0),
    0
  );
  const mediaHorasAtivos = (totalHoras / (ativos || 1)).toFixed(1);

  // ===== Filtro por esquadrão =====
  const filtrados = useMemo(() => {
    if (filtroEsqd === "Todos") return dadosRPMon;
    return dadosRPMon.filter((d) => d.esquadrao === filtroEsqd);
  }, [filtroEsqd, dadosRPMon]);

  // ===== Cavalos por esquadrão =====
  const dadosEsqd = useMemo(() => {
    const agrupados = {};
    filtrados.forEach((item) => {
      agrupados[item.esquadrao] = (agrupados[item.esquadrao] || 0) + 1;
    });
    return Object.entries(agrupados)
      .map(([key, value]) => ({ esquadrao: key, total: value }))
      .sort((a, b) => a.esquadrao.localeCompare(b.esquadrao));
  }, [filtrados]);

  // ===== Carga horária por esquadrão (MÊS ATUAL) =====
  const cargaPorEsqd = useMemo(() => {
    const agrupados = {};
    
    Object.keys(historicoCompleto).forEach((numero) => {
      const { esquadrao, horasMesAtual } = historicoCompleto[numero];
      const esqdNome = esquadrao || "Sem Esquadrão";
      
      agrupados[esqdNome] = (agrupados[esqdNome] || 0) + horasMesAtual;
    });

    return Object.entries(agrupados)
      .filter(([esqd]) => filtroEsqd === "Todos" || esqd === filtroEsqd)
      .map(([esqd, horas]) => ({ esquadrao: esqd, horas }))
      .sort((a, b) => a.esquadrao.localeCompare(b.esquadrao));
  }, [historicoCompleto, filtroEsqd]);

  // ===== Status Pie =====
  const cores = ["#28a745", "#f14b6dff"];
  const dadosStatus = useMemo(() => {
    const ativosCount = filtrados.filter(
      (d) => normalizar(d.status) === "ativo"
    ).length;
    const baixadosCount = filtrados.filter((d) =>
      normalizar(d.status).includes("baix")
    ).length;
    return [
      { name: "Ativos", value: ativosCount },
      { name: "Baixados", value: baixadosCount },
    ];
  }, [filtrados]);

  const paletaCoresCategorias = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#17becf",
    "#e377c2",
  ];

  // ===== Carga horária por cavalo =====
  const cargaPorCavalo = useMemo(
    () =>
      filtrados.map((d) => ({
        nome: d.nome || "Sem Nome",
        horas: (d.historicoHoras || []).reduce(
          (acc, h) => acc + (h.horas || 0),
          0
        ),
      })),
    [filtrados]
  );

  // ===== Evolução mensal =====
  const evolucaoMensal = useMemo(() => {
    const hoje = new Date();
    const data30Dias = new Date();
    data30Dias.setDate(hoje.getDate() - 30);

    const resultado = [];
    for (let i = 0; i <= 30; i++) {
      const dia = new Date(data30Dias);
      dia.setDate(data30Dias.getDate() + i);
      const diaStr = dia.toISOString().split("T")[0];
      const totalDia = dadosRPMon.reduce((acc, d) => {
        const historico = d.historicoHoras || [];
        const hDia = historico
          .filter((h) => h.data === diaStr)
          .reduce((a, h) => a + (h.horas || 0), 0);
        return acc + hDia;
      }, 0);
      resultado.push({ data: diaStr, horas: totalDia });
    }
    return resultado;
  }, [dadosRPMon]);

  // ===== Loader =====
  if (loading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="d-flex justify-content-center">
      <div className="w-100 pt-5 border rounded-3 p-4 bg-light">
        {/* ===== KPIs ===== */}
        <Row className="mb-4 g-3">
          {[
            { label: "Total de Cavalos", value: filtrados.length },
            { label: "Ativos", value: filtrados.filter((d) => normalizar(d.status) === "ativo").length, color: "success" },
            { label: "Baixados", value: filtrados.filter((d) => normalizar(d.status).includes("baix")).length, color: "danger" },
            { label: "Total de Horas", value: `${filtrados.reduce((acc, d) => acc + (d.historicoHoras || []).reduce((a, h) => a + (h.horas || 0), 0), 0)} h` },
            { label: "Média por Ativo", value: `${(filtrados.reduce((acc, d) => acc + (d.historicoHoras || []).reduce((a, h) => a + (h.horas || 0), 0), 0) / (filtrados.filter((d) => normalizar(d.status) === "ativo").length || 1)).toFixed(1)} h` },
          ].map((kpi, idx) => (
            <Col key={idx} md={3}>
              <Card className="p-3 text-center shadow-sm border-0 rounded-3">
                <h6 className="text-muted">{kpi.label}</h6>
                <h3 className={kpi.color ? `text-${kpi.color}` : ""}>{kpi.value}</h3>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ===== Filtros ===== */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Select
              value={filtroEsqd}
              onChange={(e) => setFiltroEsqd(e.target.value)}
              className="shadow-sm rounded-3"
            >
              <option value="Todos">Todos os Esquadrões</option>
              <option value="1 Esquadrao">1º Esqd</option>
              <option value="2 Esquadrao">2º Esqd</option>
              <option value="3 Esquadrao">3º Esqd</option>
              <option value="4 Esquadrao">4º Esqd</option>
              <option value="Equoterapia">Equoterapia</option>
              <option value="Representacao">Representação</option>
            </Form.Select>
          </Col>
        </Row>

        {/* ===== Gráficos ===== */}
        <Row>
          <Col md={8} className="mb-4">
            <Card className="p-3 shadow-sm border-0 rounded-3">
              <h5 className="text-center">
                Cavalos por Esquadrão {filtroEsqd !== "Todos" && `(Filtro: ${filtroEsqd})`}
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosEsqd}>
                  <XAxis dataKey="esquadrao" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="p-3 shadow-sm border-0 rounded-3">
              <h5 className="text-center">
                Status {filtroEsqd !== "Todos" && `(Filtro: ${filtroEsqd})`}
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={dadosStatus} dataKey="value" nameKey="name" outerRadius={100}>
                    {dadosStatus.map((entry, index) => (
                      <Cell key={index} fill={cores[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-4">
            <Card className="p-3 shadow-sm border-0 rounded-3">
              <h5 className="text-center">
                Carga Horária por Esquadrão {filtroEsqd !== "Todos" && `(Filtro: ${filtroEsqd})`}
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cargaPorEsqd}>
                  <XAxis dataKey="esquadrao" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="horas" fill="#f36812ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row>
  <Col md={12}>
    <Card className="p-3 shadow-sm border-0 rounded-3">
      <h5 className="text-center">Comparativo Mensal por Esquadrão (Ano Atual)</h5>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={evolucaoAnualCategorias}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          {categoriasHoras.map((cat, idx) => (
            <Bar
              key={cat}
              dataKey={cat}
              fill={paletaCoresCategorias[idx % paletaCoresCategorias.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </Col>
</Row>

      </div>
    </Container>
  );
};

export default Estatisticas;
