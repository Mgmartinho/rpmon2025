import { useEffect, useState } from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { BsPencilSquare, BsTrash, BsClockHistory } from "react-icons/bs";
import { api } from "../../../services/api";

const DashboardList = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 BUSCA DADOS DO MYSQL VIA API
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const data = await api.listarSolipedesPublico();
        console.log("DADOS DA API:", data); // 👈 DEBUG
        if (data && data.error) {
          console.warn("Erro ao buscar dados:", data.error);
          setDados([]);
        } else if (Array.isArray(data)) {
          setDados(data);
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

  if (loading) {
    return <p>Carregando dados...</p>;
  }

  return (
    <>
      <h3 className="mb-3">Solípedes</h3>

      <Table striped hover responsive className="shadow-sm align-middle">
        <thead className="table-primary text-center">
          <tr>
            <th>Número</th>
            <th>Nome</th>
            <th>Esquadrão</th>
            <th>Status</th>
            <th>Histórico</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            dados.map((item) => {
              const statusBaixado =
                item.status?.toLowerCase() === "baixado";

              return (
                <tr key={item.numero}>
                  <td className="text-center fw-bold">{item.numero}</td>
                  <td>{item.nome}</td>
                  <td className="text-center">{item.alocacao}</td>

                  <td className="text-center">
                    <Badge bg={statusBaixado ? "danger" : "success"}>
                      {item.status}
                    </Badge>
                  </td>

                  <td className="text-center">
                    <Button variant="info" size="sm" disabled>
                      <BsClockHistory className="me-1" />
                      Histórico
                    </Button>
                  </td>

                  <td className="text-center">
                    <Button variant="warning" size="sm" className="me-2">
                      <BsPencilSquare />
                    </Button>

                    <Button variant="danger" size="sm">
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </>
  );
};

export default DashboardList;
