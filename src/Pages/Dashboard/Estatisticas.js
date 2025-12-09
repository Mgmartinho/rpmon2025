import { useMemo, useState } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
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
  LineChart,
  Line,
} from "recharts";

import dadosBase from "./dadosBase";

const Estatisticas = () => {
  const [filtroEsqd, setFiltroEsqd] = useState("Todos");

  const normalizar = (txt) => txt.toLowerCase().trim();

  // ====== KPIs ======
  const total = dadosBase.length;
  const ativos = dadosBase.filter((d) => normalizar(d.status) === "ativo").length;
  const baixados = dadosBase.filter((d) => normalizar(d.status).includes("baix")).length;

  // Total de horas acumuladas
  const totalHoras = dadosBase.reduce(
    (acc, d) =>
      acc + (d.historicoHoras ? d.historicoHoras.reduce((a, h) => a + h.horas, 0) : 0),
    0
  );

  // Média de horas por cavalo ativo
  const mediaHorasAtivos = (
    totalHoras /
    (ativos || 1)
  ).toFixed(1);

  // ====== Filtro por Esquadrão ======
  const filtrados = useMemo(() => {
    if (filtroEsqd === "Todos") return dadosBase;
    return dadosBase.filter((d) => d.esquadrao === filtroEsqd);
  }, [filtroEsqd]);

  // ====== Cavalos por esquadrão ======
  const agrupados = {};
  filtrados.forEach((item) => {
    agrupados[item.esquadrao] = (agrupados[item.esquadrao] || 0) + 1;
  });

  const dadosEsqd = Object.entries(agrupados).map(([key, value]) => ({
    esquadrao: key,
    total: value,
  }));

  // ====== Status Pie ======
  const dadosStatus = [
    { name: "Ativos", value: ativos },
    { name: "Baixados", value: baixados },
  ];
  const cores = ["#28a745", "#f14b6dff"];

  // ====== Carga horária por cavalo ======
  const cargaPorCavalo = filtrados.map((d) => ({
    nome: d.nome,
    horas: d.historicoHoras ? d.historicoHoras.reduce((acc, h) => acc + h.horas, 0) : 0,
  }));

  // ====== Evolução mensal da carga horária (últimos 30 dias) ======
  const hoje = new Date();
  const data30Dias = new Date();
  data30Dias.setDate(hoje.getDate() - 30);

  const evolucaoMensal = [];
  for (let i = 0; i <= 30; i++) {
    const dia = new Date(data30Dias);
    dia.setDate(data30Dias.getDate() + i);
    const diaStr = dia.toISOString().split("T")[0];
    const totalDia = dadosBase.reduce((acc, d) => {
      const hDia = d.historicoHoras?.filter((h) => h.data === diaStr).reduce((a, h) => a + h.horas, 0) || 0;
      return acc + hDia;
    }, 0);
    evolucaoMensal.push({ data: diaStr, horas: totalDia });
  }

  return (
    <Container fluid>
      {/* ===== KPIs ===== */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3 text-center shadow-sm">
            <h5>Total de Cavalos</h5>
            <h2>{total}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center shadow-sm">
            <h5>Ativos</h5>
            <h2 className="text-success">{ativos}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center shadow-sm">
            <h5>Baixados</h5>
            <h2 className="text-danger">{baixados}</h2>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center shadow-sm">
            <h5>Total de Horas</h5>
            <h2>{totalHoras} h</h2>
          </Card>
        </Col>
        <Col md={3} className="mt-3">
          <Card className="p-3 text-center shadow-sm">
            <h5>Média por Ativo</h5>
            <h2>{mediaHorasAtivos} h</h2>
          </Card>
        </Col>
      </Row>

      {/* ===== Filtros ===== */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Select value={filtroEsqd} onChange={(e) => setFiltroEsqd(e.target.value)}>
            <option value="Todos">Todos os Esquadrões</option>
            <option value="1º Esqd">1º Esqd</option>
            <option value="2º Esqd">2º Esqd</option>
            <option value="3º Esqd">3º Esqd</option>
          </Form.Select>
        </Col>
      </Row>

      {/* ===== Gráfico Barras - Cavalos por esquadrão ===== */}
      <Row>
        <Col md={8} className="mb-4">
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Cavalos por Esquadrão</h5>
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

        {/* ===== Gráfico Pizza - Status geral ===== */}
        <Col md={4}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Status Geral</h5>
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

      {/* ===== Gráfico Barras - Carga horária por cavalo ===== */}
      <Row>
        <Col md={12} className="mb-4">
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Carga Horária por Cavalo</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cargaPorCavalo}>
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="horas" fill="#ffc107" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ===== Gráfico Linha - Evolução mensal ===== */}
      <Row>
        <Col md={12}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Evolução da Carga Horária (Últimos 30 dias)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoMensal}>
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="horas" stroke="#17a2b8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Estatisticas;
