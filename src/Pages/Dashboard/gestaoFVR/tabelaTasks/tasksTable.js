import { useMemo } from "react";
import {
  Card,
  Table,
  Alert,
} from "react-bootstrap";

const TasksTable = ({ onConsultarRegistro, registros = [] }) => {
  const dados = useMemo(() => (Array.isArray(registros) ? registros : []), [registros]);

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Card.Title className="mb-3">Lançamentos</Card.Title>

        {dados.length === 0 && (
          <Alert variant="light" className="mb-0 border">
            Nenhum lançamento encontrado no prontuário geral.
          </Alert>
        )}

        {dados.length > 0 && (
          <Table responsive hover className="align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nº Solípede</th>
                <th>Tipo</th>
                <th>Data Criação</th>
                <th>Usuário</th>
                <th>Ciclo de atendimento</th>
                <th>Consulta</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item) => (
                <tr key={item.id || `${item.tipo}-${item.data_criacao}`}>
                  <td>{item.id || "-"}</td>
                  <td>{item.numero_solipede || "-"}</td>
                  <td>{item.tipo || "-"}</td>
                  <td>
                    {item.data_criacao
                      ? new Date(item.data_criacao).toLocaleString("pt-BR")
                      : "-"}
                  </td>
                  <td>{item.usuario_nome || item.usuario || "-"}</td>
                  <td>{item.status_conclusao || "-"}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onConsultarRegistro?.(item.numero_solipede)}
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

export default TasksTable;
