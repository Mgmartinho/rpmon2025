import { useMemo } from "react";
import {
  Card,
  Table,
  Alert,
  Button,
} from "react-bootstrap";
import * as XLSX from "xlsx";

const TasksTable = ({ onConsultarRegistro, registros = [] }) => {
  const dados = useMemo(() => (Array.isArray(registros) ? registros : []), [registros]);

  const formatarStatus = (valor) => {
    if (!valor) return "-";
    const normalizado = String(valor).trim().toLowerCase();

    if (normalizado.includes("concl")) return "Concluído";
    if (normalizado.includes("andamento") || normalizado.includes("pendente") || normalizado.includes("aberto")) {
      return "Em andamento";
    }

    return String(valor);
  };

  const resolverStatus = (item) => {
    const statusBruto =
      item?.status_conclusao ||
      item?.cirurgia_status ||
      item?.aiemormo_status ||
      item?.aie_mormo_status ||
      item?.vermifugacao_status ||
      item?.vacinacao_status ||
      item?.tratamento_status ||
      item?.restricao_status ||
      item?.dieta_status ||
      item?.suplementacao_status ||
      item?.movimentacao_status ||
      item?.status;

    return formatarStatus(statusBruto);
  };

  const exportarExcel = () => {
    if (!dados.length) {
      alert("Não há dados para exportar.");
      return;
    }

    const linhas = dados.map((item) => ({
      ID: item.id || "-",
      NumeroSolipede: item.numero_solipede || "-",
      Tipo: item.tipo || "-",
      DataCriacao: item.data_criacao ? new Date(item.data_criacao).toLocaleString("pt-BR") : "-",
      Usuario: item.usuario_nome || item.usuario || "-",
      CicloAtendimento: resolverStatus(item),
    }));

    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lancamentos");
    XLSX.writeFile(wb, "lancamentos_prontuario.xlsx");
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Lançamentos</Card.Title>
          <Button variant="outline-success" size="sm" onClick={exportarExcel}>
            Exportar Excel
          </Button>
        </div>

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
                  <td>{resolverStatus(item)}</td>
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
