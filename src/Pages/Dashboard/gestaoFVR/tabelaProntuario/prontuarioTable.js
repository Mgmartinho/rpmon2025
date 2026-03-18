import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useParams } from "react-router-dom";

import { api } from "../../../../services/api";

const ProntuarioTable = ({ onConsultarRegistro }) => {
  const params = useParams();
  const numeroSelecionado = useMemo(() => params.numero || params.id, [params]);

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregarProntuario = async () => {
      if (!numeroSelecionado) {
        setErro("Não foi possível identificar o solípede selecionado.");
        setDados([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErro("");

      try {
        const resposta = await api.listarProntuario(Number(numeroSelecionado));

        if (Array.isArray(resposta)) {
          setDados(resposta);
          return;
        }

        if (Array.isArray(resposta?.data)) {
          setDados(resposta.data);
          return;
        }

        setDados([]);
      } catch (error) {
        console.error("Erro ao carregar prontuário:", error);
        setErro("Erro ao carregar lançamentos do prontuário.");
        setDados([]);
      } finally {
        setLoading(false);
      }
    };

    carregarProntuario();
  }, [numeroSelecionado]);

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Card.Title className="mb-3">Lançamentos do Prontuário</Card.Title>

        {loading && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <Spinner animation="border" size="sm" />
            <span>Carregando lançamentos...</span>
          </div>
        )}

        {!loading && erro && (
          <Alert variant="danger" className="mb-0">
            {erro}
          </Alert>
        )}

        {!loading && !erro && dados.length === 0 && (
          <Alert variant="light" className="mb-0 border">
            Nenhum lançamento encontrado para o solípede Nº {numeroSelecionado}.
          </Alert>
        )}

        {!loading && !erro && dados.length > 0 && (
          <Table responsive hover className="align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nº Solípede</th>
                <th>Tipo</th>
                <th>Data Criação</th>
                <th>Usuário</th>
                <th>Consulta</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item) => (
                <tr key={item.id || `${item.tipo}-${item.data_criacao}`}>
                  <td>{item.id || "-"}</td>
                  <td>{item.numero_solipede || numeroSelecionado}</td>
                  <td>{item.tipo || "-"}</td>
                  <td>
                    {item.data_criacao
                      ? new Date(item.data_criacao).toLocaleString("pt-BR")
                      : "-"}
                  </td>
                  <td>{item.usuario_nome || item.usuario || "-"}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onConsultarRegistro?.(item)}
                    >
                      Consultar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProntuarioTable;
