import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { api } from "../../../../services/api";

const HOJE = new Date().toISOString().split("T")[0];

export default function VermifugacaoLote() {
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const [solipedes, setSolipedes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selecionados, setSelecionados] = useState(() => new Set());
  const [form, setForm] = useState({
    produto: "",
    partida: "",
    fabricacao: "",
    data_inicio: HOJE,
    data_fabricacao: "",
    data_validade: "",
    descricao: "",
    status_conclusao: "concluido",
    senha_confirmacao: "",
  });
  const [filtro, setFiltro] = useState("");
  const [filtroBusca, setFiltroBusca] = useState("");

  const [loteLoading, setLoteLoading] = useState(false);
  const [loteErro, setLoteErro] = useState("");
  const [loteSucesso, setLoteSucesso] = useState("");

  useEffect(() => {
    api.listarSolipedes()
      .then((data) => setSolipedes(Array.isArray(data) ? data : []))
      .catch(() => setSolipedes([]))
      .finally(() => setLoading(false));
  }, []);

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
    setForm({
      produto: "",
      partida: "",
      fabricacao: "",
      data_inicio: HOJE,
      data_fabricacao: "",
      data_validade: "",
      descricao: "",
      status_conclusao: "concluido",
      senha_confirmacao: "",
    });
    setFiltro("");
    setFiltroBusca("");
  }, []);

  const confirmarLancamentoLote = async () => {
    if (!form.produto.trim()) {
      setLoteErro("Informe o produto do vermífugo.");
      return;
    }

    if (!form.senha_confirmacao.trim()) {
      setLoteErro("Informe a confirmação de senha.");
      return;
    }

    const numeros = Array.from(selecionados);

    if (numeros.length === 0) {
      setLoteErro("Selecione ao menos um solípede para lançar em lote.");
      return;
    }

    try {
      setLoteErro("");
      setLoteSucesso("");
      setLoteLoading(true);

      const operacoes = numeros.map((numero_solipede) =>
        api.criarProntuarioVermifugacao({
          numero_solipede,
          produto: form.produto.trim(),
          partida: form.partida.trim() || null,
          fabricacao: form.fabricacao || null,
          data_inicio: form.data_inicio || HOJE,
          data_fabricacao: form.data_fabricacao || null,
          data_validade: form.data_validade || null,
          descricao: form.descricao.trim() || null,
          status_conclusao: "concluido",
          senha: form.senha_confirmacao,
        })
      );

      const resultados = await Promise.allSettled(operacoes);

      const sucesso = [];
      const falha = [];

      resultados.forEach((resultado, index) => {
        if (resultado.status === "fulfilled" && !resultado.value?.error && !resultado.value?.erro) {
          sucesso.push(numeros[index]);
        } else {
          falha.push(numeros[index]);
        }
      });

      if (sucesso.length > 0) {
        setLoteSucesso(`Lançamento de vermifugação criado para ${sucesso.length} solípede(s).`);
      }

      if (falha.length > 0) {
        setLoteErro(`Falha ao lançar para: ${falha.join(", ")}.`);
      }

      if (falha.length === 0) {
        const primeiroNumero = sucesso[0];
        limparFormulario();
        if (primeiroNumero) {
          setTimeout(() => {
            navigate(`/dashboard/gestaofvr/solipede/prontuario/edit/${primeiroNumero}`);
          }, 1200);
        }
      }
    } catch (e) {
      setLoteErro(e.message || "Erro inesperado");
    } finally {
      setLoteLoading(false);
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
        <Row className="mb-3 ">
          <Col md={8}>
            <h5 className="mb-1">Informações referente a Vermifugação</h5>
            <small className="text-muted">
              Descreva os detalhes da vermifugação, como Data e Local.
            </small>
          </Col>
        </Row>
        <Row className="mb-3 ">

          <Col md={4} className="p-2">
            <Form.Group>
              <Form.Label>Produto *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Vacina Raiva"
                value={form.produto}
                onChange={(e) => setForm((prev) => ({ ...prev, produto: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="p-2">
            <Form.Group>
              <Form.Label>Partida *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: xx/xx/xxxx - Lote 123"
                value={form.partida}
                onChange={(e) => setForm((prev) => ({ ...prev, partida: e.target.value }))}
              />
            </Form.Group>
          </Col>


          <Col  md={4} className="p-2">
            <Form.Group>
              <Form.Label>Data de Fabricação *</Form.Label>
              <Form.Control
                type="date"
                value={form.fabricacao}
                onChange={(e) => setForm((prev) => ({ ...prev, fabricacao: e.target.value }))}

              />
            </Form.Group>
          </Col>
          <Col md={4} className="p-2">
            <Form.Group>
              <Form.Label>Data de Fabricação *</Form.Label>
              <Form.Control
                type="date"
                value={form.data_fabricacao}
                onChange={(e) => setForm((prev) => ({ ...prev, data_fabricacao: e.target.value }))}

              />
            </Form.Group>
          </Col>
          <Col md={4} className="p-2">
            <Form.Group>
              <Form.Label>Data de Validade *</Form.Label>
              <Form.Control
                type="date"
                value={form.data_validade}
                onChange={(e) => setForm((prev) => ({ ...prev, data_validade: e.target.value }))}

              />
            </Form.Group>
          </Col>
          
        </Row>

        <Row>
          <Row className="mb-3">
            <Col md={8}>
              <h5 className="mb-1">Detalhes da Aplicação</h5>
              <small className="text-muted">
                Descreva os detalhes da aplicação da vermifugação, como Data e Local.
              </small>
            </Col>
          </Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Data da Vermifugação *</Form.Label>
              <Form.Control
                type="date"
                value={form.data_inicio}
                onChange={(e) => setForm((prev) => ({ ...prev, data_inicio: e.target.value }))}
                max={HOJE}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Senha do Usuário *</Form.Label>
              <Form.Control
                type="password"
                value={form.senha_confirmacao}
                onChange={(e) => setForm((prev) => ({ ...prev, senha_confirmacao: e.target.value }))}
                placeholder="Confirme sua senha"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="border rounded p-2 mb-3 mt-5">
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

        {loteErro && <Alert variant="danger" className="mb-2">{loteErro}</Alert>}
        {loteSucesso && <Alert variant="success" className="mb-2">{loteSucesso}</Alert>}

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={limparFormulario} disabled={loteLoading}>
            Limpar
          </Button>
          <Button
            variant="primary"
            disabled={loteLoading || !form.produto.trim() || !form.data_inicio || !form.senha_confirmacao.trim() || totalSelecionados === 0}
            onClick={confirmarLancamentoLote}
          >
            {loteLoading ? <><Spinner size="sm" className="me-1" />Aplicando...</> : `Confirmar (${totalSelecionados})`}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

