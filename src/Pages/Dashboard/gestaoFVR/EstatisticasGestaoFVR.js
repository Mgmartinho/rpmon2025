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
  const [filtroAlocacao, setFiltroAlocacao] = useState("Todos");

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

  // Função para calcular idade
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  // ===== KPIs =====
  const total = dados.length;
  const ativos = dados.filter((d) => normalizar(d.status) === "ativo").length;
  const baixados = dados.filter((d) =>
    normalizar(d.status).includes("baix")
  ).length;
  
  // KPIs por idade
  const cavalosAte10Anos = dados.filter((d) => calcularIdade(d.DataNascimento) <= 10).length;
  const cavalos10OuMais = dados.filter((d) => calcularIdade(d.DataNascimento) > 10).length;
  
  // KPIs por sexo
  const tiposMachos = ["macho", "macho castrado", "Garanhao", "criptorquida"];
  const machos = dados.filter((d) => tiposMachos.includes(normalizar(d.sexo))).length;
  const femeas = dados.filter((d) => normalizar(d.sexo) === "femea" || normalizar(d.sexo) === "fêmea").length;
  
  // Pelagens mais comuns
  const pelagemContagem = dados.reduce((acc, d) => {
    const pelagem = d.pelagem || "Não informada";
    acc[pelagem] = (acc[pelagem] || 0) + 1;
    return acc;
  }, {});
  const pelagemMaisComum = Object.entries(pelagemContagem)
    .sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

  // ===== Filtro por alocação =====
  const filtrados = useMemo(() => {
    if (filtroAlocacao === "Todos") return dados;
    return dados.filter((d) => d.alocacao === filtroAlocacao);
  }, [filtroAlocacao, dados]);

  // Lista de alocações disponíveis
  const alocacoesDisponiveis = useMemo(() => {
    const alocacoes = new Set(dados.map(d => d.alocacao).filter(Boolean));
    return Array.from(alocacoes).sort();
  }, [dados]);

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

  // ===== Cavalos por alocação =====
  const dadosAlocacao = useMemo(() => {
    const agrupados = {};
    filtrados.forEach((item) => {
      const alocacao = item.alocacao || "Sem alocação";
      agrupados[alocacao] = (agrupados[alocacao] || 0) + 1;
    });
    return Object.entries(agrupados)
      .map(([key, value]) => ({ alocacao: key, total: value }))
      .sort((a, b) => b.total - a.total)
  }, [filtrados]);

  // ===== Dados por sexo =====
  const dadosSexo = useMemo(() => {
    const agrupados = {};
    filtrados.forEach((item) => {
      const sexo = item.sexo || "Não informado";
      agrupados[sexo] = (agrupados[sexo] || 0) + 1;
    });
    return Object.entries(agrupados)
      .map(([key, value]) => ({ name: key, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtrados]);

  // ===== Dados por pelagem =====
  const dadosPelagem = useMemo(() => {
    const agrupados = {};
    filtrados.forEach((item) => {
      const pelagem = item.pelagem || "Não informada";
      agrupados[pelagem] = (agrupados[pelagem] || 0) + 1;
    });
    return Object.entries(agrupados)
      .map(([key, value]) => ({ name: key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 pelagens
  }, [filtrados]);



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
            { label: "Total de Cavalos", value: filtroAlocacao === "Todos" ? total : filtrados.length, color: "primary" },
            { label: "Ativos", value: filtroAlocacao === "Todos" ? ativos : filtrados.filter((d) => normalizar(d.status) === "ativo").length, color: "success" },
            { label: "Baixados", value: filtroAlocacao === "Todos" ? baixados : filtrados.filter((d) => normalizar(d.status).includes("baix")).length, color: "danger" },
            { label: "Até 10 anos", value: filtroAlocacao === "Todos" ? cavalosAte10Anos : filtrados.filter((d) => calcularIdade(d.DataNascimento) <= 10).length, color: "info" },
            { label: "10 anos ou +", value: filtroAlocacao === "Todos" ? cavalos10OuMais : filtrados.filter((d) => calcularIdade(d.DataNascimento) > 10).length, color: "warning" },
            { label: "Machos", value: filtroAlocacao === "Todos" ? machos : filtrados.filter((d) => tiposMachos.includes(normalizar(d.sexo))).length, color: "secondary" },
            { label: "Fêmeas", value: filtroAlocacao === "Todos" ? femeas : filtrados.filter((d) => normalizar(d.sexo) === "femea" || normalizar(d.sexo) === "fêmea").length, color: "secondary" },
            { label: `Pelagem Comum`, value: pelagemMaisComum[0], subtitle: `${pelagemMaisComum[1]} cavalos` },
          ].map((kpi, idx) => (
            <Col key={idx} xs={6} md={3}>
              <Card className="p-3 text-center shadow-sm border-0 rounded-3">
                <h6 className="text-muted mb-2">{kpi.label}</h6>
                <h3 className={kpi.color ? `text-${kpi.color}` : ""}>{kpi.value}</h3>
                {kpi.subtitle && <small className="text-muted">{kpi.subtitle}</small>}
              </Card>
            </Col>
          ))}
        </Row>

        {/* ===== Filtros ===== */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Select
              value={filtroAlocacao}
              onChange={(e) => setFiltroAlocacao(e.target.value)}
              className="shadow-sm rounded-3"
            >
              <option value="Todos">Todas as Alocações</option>
              {alocacoesDisponiveis.map((alocacao) => (
                <option key={alocacao} value={alocacao}>
                  {alocacao}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* ===== Gráficos ===== */}
        <Row>
          <Col md={8} className="mb-4">
            <Card className="p-3 shadow-sm border-0 rounded-3">
              <h5 className="text-center">
                Cavalos por Alocação  {filtroAlocacao !== "Todos" && `(Filtro: ${filtroAlocacao})`}
              </h5>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dadosAlocacao}>
                  <XAxis dataKey="alocacao" angle={-45} textAnchor="end" height={100} />
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
                Status {filtroAlocacao !== "Todos" && `(Filtro: ${filtroAlocacao})`}
              </h5>
              <ResponsiveContainer width="100%" height={350}>
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
          <Col md={6} className="mb-4">
            <Card className="p-3 shadow-sm border-0 rounded-3">
              <h5 className="text-center">
                Distribuição por Sexo {filtroAlocacao !== "Todos" && `(Filtro: ${filtroAlocacao})`}
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={dadosSexo} dataKey="value" nameKey="name" outerRadius={100} label>
                    <Cell fill="#17a2b8" />
                    <Cell fill="#ff6b9d" />
                    <Cell fill="#6c757d" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="p-3 shadow-sm border-0 rounded-3">
              <h5 className="text-center">
                Pelagens Mais Comuns (Top 8) {filtroAlocacao !== "Todos" && `(Filtro: ${filtroAlocacao})`}
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosPelagem} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#28a745" />
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
