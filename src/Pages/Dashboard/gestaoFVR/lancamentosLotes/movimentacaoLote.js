import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { api } from "../../../../services/api";

const OPCOES_DESTINO = [
  "RPMon","Barro Branco","Hospital Veterinario","Avare","Barretos","Bauru",
  "Campinas","Colina","Escola Equitacao Exercito","Itapetininga","Marilia",
  "Maua","Presidente Prudente","Ribeirao Preto","Santos","Sao Bernardo do Campo",
  "Sao Jose do Rio Preto","Sorocaba","Taubate","Representacao",
];

const HOJE = new Date().toISOString().split("T")[0];

export default function MovimentacaoLote() {
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const [solipedes, setSolipedes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set para selecionados: lookup O(1) ao invés de O(n) com array
  const [selecionados, setSelecionados] = useState(() => new Set());
  const [destino, setDestino] = useState("");
  const [data_movimentacao, setData_movimentacao] = useState(HOJE);
  const [motivo, setMotivo] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [filtro, setFiltro] = useState("");
  const [filtroBusca, setFiltroBusca] = useState(""); // valor com debounce

  const [movLoading, setMovLoading] = useState(false);
  const [movErro, setMovErro] = useState("");
  const [movSucesso, setMovSucesso] = useState("");

  useEffect(() => {
    api.listarSolipedes()
      .then((data) => setSolipedes(Array.isArray(data) ? data : []))
      .catch(() => setSolipedes([]))
      .finally(() => setLoading(false));
  }, []);

  // Debounce no filtro: só recalcula 250ms após parar de digitar
  const handleFiltroChange = useCallback((e) => {
    const val = e.target.value;
    setFiltro(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setFiltroBusca(val), 250);
  }, []);

  const solipedesFiltrados = useMemo(() => {
    const termo = filtroBusca.trim().toLowerCase();
    if (!termo) return solipedes;
    return solipedes.filter(
      (s) =>
        s.nome?.toLowerCase().includes(termo) ||
        String(s.numero).includes(termo) ||
        (s.alocacao || "").toLowerCase().includes(termo)
    );
  }, [solipedes, filtroBusca]);

  const todosSelecionados = useMemo(
    () => solipedesFiltrados.length > 0 && solipedesFiltrados.every((s) => selecionados.has(s.numero)),
    [solipedesFiltrados, selecionados]
  );

  const toggleSolipede = useCallback((numero, checked) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (checked) next.add(numero);
      else next.delete(numero);
      return next;
    });
  }, []);

  const toggleTodos = useCallback(() => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosSelecionados) {
        solipedesFiltrados.forEach((s) => next.delete(s.numero));
      } else {
        solipedesFiltrados.forEach((s) => next.add(s.numero));
      }
      return next;
    });
  }, [todosSelecionados, solipedesFiltrados]);

  const limparFormulario = useCallback(() => {
    setSelecionados(new Set());
    setSenhaConfirmacao("");
    setDestino("");
    setData_movimentacao(HOJE);
    setMotivo("");
    setFiltro("");
    setFiltroBusca("");
  }, []);

  const confirmarMovimentacao = async () => {
    const numeros = Array.from(selecionados);
    const primeiroNumero = numeros[0];
    try {
      setMovErro("");
      setMovSucesso("");
      setMovLoading(true);

      const resp = await api.movimentacaoBulk({
        numeros,
        destino,
        data_movimentacao,
        motivo: motivo.trim() || null,
        senha: senhaConfirmacao,
      });

      if (resp && resp.success) {
        setSolipedes((prev) =>
          prev.map((d) => selecionados.has(d.numero) ? { ...d, alocacao: destino } : d)
        );
        setMovSucesso(`Movimentação concluída para ${resp.count} solípede(s)! Abrindo prontuário...`);
        limparFormulario();
        setTimeout(() => {
          if (primeiroNumero) navigate(`/dashboard/gestaofvr/solipede/prontuario/edit/${primeiroNumero}`);
        }, 2000);
      } else {
        setMovErro(resp?.error || "Falha ao aplicar movimentação");
      }
    } catch (e) {
      setMovErro(e.message || "Erro inesperado");
    } finally {
      setMovLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p className="mt-2 mb-0">Carregando solipedes...</p>
      </div>
    );
  }

  const totalSelecionados = selecionados.size;

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Destino *</Form.Label>
              <Form.Select value={destino} onChange={(e) => setDestino(e.target.value)}>
                <option value="">Selecione o destino</option>
                {OPCOES_DESTINO.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Data da Movimentacao *</Form.Label>
              <Form.Control
                type="date"
                value={data_movimentacao}
                onChange={(e) => setData_movimentacao(e.target.value)}
                max={HOJE}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Senha do Usuario *</Form.Label>
              <Form.Control
                type="password"
                value={senhaConfirmacao}
                onChange={(e) => setSenhaConfirmacao(e.target.value)}
                placeholder="Confirme sua senha"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-bold">Motivo da movimentação *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                maxLength={500}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descrição do motivo da movimentação"
              />
              <small className="text-muted">caracteres: {motivo.length}/500</small>
            </Form.Group>
          </Col>
        </Row>

        <div className="border rounded p-2 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>
              <strong>Selecionar Solipedes</strong>
              {totalSelecionados > 0 && (
                <Badge bg="primary" className="ms-2">{totalSelecionados} selecionado(s)</Badge>
              )}
            </span>
            <div className="d-flex gap-2">
              <Form.Control
                size="sm"
                placeholder="Filtrar por numero, nome ou alocacao"
                value={filtro}
                onChange={handleFiltroChange}
                style={{ width: 260 }}
              />
              <Button size="sm" variant="outline-secondary" onClick={toggleTodos}>
                {todosSelecionados ? "Desmarcar todos" : "Selecionar todos"}
              </Button>
            </div>
          </div>

          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            <Table size="sm" hover className="align-middle mb-0">
              <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Nº</th>
                  <th>Nome</th>
                  <th>Alocacao Atual</th>
                </tr>
              </thead>
              <tbody>
                {solipedesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-3">
                      Nenhum solipede encontrado.
                    </td>
                  </tr>
                ) : (
                  solipedesFiltrados.map((s) => (
                    <tr key={s.numero}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selecionados.has(s.numero)}
                          onChange={(e) => toggleSolipede(s.numero, e.target.checked)}
                        />
                      </td>
                      <td className="fw-semibold">{s.numero}</td>
                      <td>{s.nome}</td>
                      <td className="text-muted">{s.alocacao || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {movErro && <Alert variant="danger" className="mb-2">{movErro}</Alert>}
        {movSucesso && <Alert variant="success" className="mb-2">{movSucesso}</Alert>}

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={limparFormulario} disabled={movLoading}>
            Limpar
          </Button>
          <Button
            variant="primary"
            disabled={movLoading || !senhaConfirmacao || !destino || !data_movimentacao || !motivo.trim() || totalSelecionados === 0}
            onClick={confirmarMovimentacao}
          >
            {movLoading ? <><Spinner size="sm" className="me-1" />Aplicando...</> : `Confirmar (${totalSelecionados})`}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

