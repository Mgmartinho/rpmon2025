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

const EstatisticasGestaoFVR = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEsqd, setFiltroEsqd] = useState("Todos");

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

  const normalizar = (txt) => (txt ? txt.toLowerCase().trim() : "");

  // ===== KPIs =====
  const total = dados.length;
  const ativos = dados.filter((d) => normalizar(d.status) === "ativo").length;
  const baixados = dados.filter((d) =>
    normalizar(d.status).includes("baix")
  ).length;
  const totalHoras = dados.reduce(
    (acc, d) =>
      acc + (d.historicoHoras || []).reduce((a, h) => a + (h.horas || 0), 0),
    0
  );
  const mediaHorasAtivos = (totalHoras / (ativos || 1)).toFixed(1);

  // ===== Filtro por esquadrão =====
  const filtrados = useMemo(() => {
    if (filtroEsqd === "Todos") return dados;
    return dados.filter((d) => d.esquadrao === filtroEsqd);
  }, [filtroEsqd, dados]);

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

  // ===== Evolução mensal por categoria =====
// ===== Evolução mensal por categoria =====
// ===== Evolução mensal por categoria (com relação ao cavalo) =====
const evolucaoMensalCategorias = useMemo(() => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const categorias = [
    "1 Esquadrao",
    "2 Esquadrao",
    "3 Esquadrao",
    "4 Esquadrao",
    "Equoterapia",
    "Representação",
  ];

  // Objeto temporário para agrupar por data
  const agrupadosPorData = {};

  // Percorre cada cavalo válido
  dados.forEach((cavalo) => {
    const historico = cavalo.historicoHoras || [];
    historico.forEach((h) => {
      const data = new Date(h.data);
      const dataStr = h.data;

      // Considera apenas registros do mês/ano atual
      if (data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual) {
        // Inicializa objeto para a data se ainda não existir
        if (!agrupadosPorData[dataStr]) {
          agrupadosPorData[dataStr] = { data: dataStr };
          categorias.forEach((c) => (agrupadosPorData[dataStr][c] = 0));
        }

        // Só adiciona horas se a categoria for válida
        if (categorias.includes(h.categoria)) {
          agrupadosPorData[dataStr][h.categoria] += h.horas || 0;
        }
      }
    });
  });

  // Converte para array e ordena por data
  return Object.values(agrupadosPorData).sort(
    (a, b) => new Date(a.data) - new Date(b.data)
  );
}, [dados]);



  // ===== Carga horária por esquadrão =====
  const cargaPorEsqd = useMemo(() => {
    const agrupados = {};
    dados.forEach((d) => {
      const esquadrao = d.esquadrao || "Sem Esquadrão";
      const totalHoras = d.cargaHoraria || 0;
      agrupados[esquadrao] = (agrupados[esquadrao] || 0) + totalHoras;
    });

    return Object.entries(agrupados)
      .filter(([esqd]) => filtroEsqd === "Todos" || esqd === filtroEsqd)
      .map(([esqd, horas]) => ({ esquadrao: esqd, horas }))
      .sort((a, b) => a.esquadrao.localeCompare(b.esquadrao));
  }, [dados, filtroEsqd]);

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
      const totalDia = dados.reduce((acc, d) => {
        const historico = d.historicoHoras || [];
        const hDia = historico
          .filter((h) => h.data === diaStr)
          .reduce((a, h) => a + (h.horas || 0), 0);
        return acc + hDia;
      }, 0);
      resultado.push({ data: diaStr, horas: totalDia });
    }
    return resultado;
  }, [dados]);

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
            { label: "Total de Cavalos", value: filtroEsqd === "Todos" ? total : filtrados.length },
            { label: "Ativos", value: filtroEsqd === "Todos" ? ativos : filtrados.filter((d) => normalizar(d.status) === "ativo").length, color: "success" },
            { label: "Baixados", value: filtroEsqd === "Todos" ? baixados : filtrados.filter((d) => normalizar(d.status).includes("baix")).length, color: "danger" },
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
              <h5 className="text-center">Evolução da Carga Horária (Mês Atual)</h5>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={evolucaoMensalCategorias}>
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="1 Esquadrao" fill="#1f77b4" />
                  <Bar dataKey="2 Esquadrao" fill="#ff7f0e" />
                  <Bar dataKey="3 Esquadrao" fill="#2ca02c" />
                  <Bar dataKey="4 Esquadrao" fill="#d62728" />
                  <Bar dataKey="Equoterapia" fill="#9467bd" />
                  <Bar dataKey="Representação" fill="#8c564b" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default EstatisticasGestaoFVR;
