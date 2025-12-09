// AdminCargaHoraria.jsx
import { useState } from "react";
import { Table, Button, Form, Modal, Row, Col, Badge } from "react-bootstrap";
import { BsCheck2, BsClockHistory } from "react-icons/bs";
import dadosBase from "./dadosBase";

const AdminCargaHoraria = () => {
  // Inicializa os dados usando o historicoHoras para calcular cargaHoraria
  const [dados, setDados] = useState(
    dadosBase.map((item) => ({
      ...item,
      cargaHoraria:
        item.historicoHoras?.reduce((acc, h) => acc + h.horas, 0) || 0,
      historicoHoras: item.historicoHoras || [],
      historico: item.historico || [],
    }))
  );

  // Modal de adição de horas
  const [showModal, setShowModal] = useState(false);
  const [selecionados, setSelecionados] = useState([]);
  const [cargaAdicionar, setCargaAdicionar] = useState(0);

  // Modal de histórico individual
  const [showHistorico, setShowHistorico] = useState(false);
  const [itemHistorico, setItemHistorico] = useState(null);

  // Alterna seleção de solípedes
  const handleSelecionar = (id) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Aplica carga horária manualmente e atualiza o histórico
  const aplicarCargaHoraria = () => {
    const dataAtual = new Date().toISOString().split("T")[0];
    setDados((prev) =>
      prev.map((item) =>
        selecionados.includes(item.id)
          ? {
              ...item,
              historicoHoras: [
                ...item.historicoHoras,
                { data: dataAtual, horas: Number(cargaAdicionar) },
              ],
              cargaHoraria:
                item.historicoHoras
                  .reduce((acc, h) => acc + h.horas, 0) + Number(cargaAdicionar),
            }
          : item
      )
    );
    setSelecionados([]);
    setCargaAdicionar(0);
    setShowModal(false);
  };

  // Abrir modal de histórico
  const handleVerHistorico = (item) => {
    setItemHistorico(item);
    setShowHistorico(true);
  };

  // Editar registro do histórico
 const handleEditarHistorico = (index, horas, data) => {
  const novoHistorico = [...itemHistorico.historicoHoras];
  novoHistorico[index] = { data, horas: Number(horas) };

  const novaCarga = novoHistorico.reduce((acc, h) => acc + h.horas, 0);

  // Atualiza o estado principal
  setDados((prev) =>
    prev.map((item) =>
      item.id === itemHistorico.id
        ? { ...item, historicoHoras: novoHistorico, cargaHoraria: novaCarga }
        : item
    )
  );

  // Atualiza o estado local do modal
  setItemHistorico((prev) => ({
    ...prev,
    historicoHoras: novoHistorico,
    cargaHoraria: novaCarga,
  }));
};


  // Excluir registro do histórico
  const handleExcluirHistorico = (index) => {
    const novoHistorico = itemHistorico.historicoHoras.filter((_, i) => i !== index);
    const novaCarga = novoHistorico.reduce((acc, h) => acc + h.horas, 0);

    // Atualiza o estado principal
    setDados((prev) =>
      prev.map((item) =>
        item.id === itemHistorico.id
          ? { ...item, historicoHoras: novoHistorico, cargaHoraria: novaCarga }
          : item
      )
    );

    // Atualiza o estado local do modal
    setItemHistorico((prev) => ({
      ...prev,
      historicoHoras: novoHistorico,
      cargaHoraria: novaCarga,
    }));
  };

  return (
    <div className="p-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h3>Administração de Carga Horária</h3>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Adicionar Carga Horária
          </Button>
        </Col>
      </Row>

      <Table striped hover responsive className="shadow-sm">
        <thead className="table-primary text-center">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Esquadrão</th>
            <th>Status</th>
            <th>Histórico</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.id}>
              <td className="text-center">{item.id}</td>
              <td>{item.nome}</td>
              <td className="text-center">{item.esquadrao}</td>
             
              <td className="text-center">{item.cargaHoraria || 0} h</td>
              <td className="text-center">
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleVerHistorico(item)}
                  disabled={!item.historicoHoras.length}
                >
                  <BsClockHistory className="me-1" /> Consultar Lançamentos
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para adicionar horas */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Carga Horária</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Horas a adicionar</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={cargaAdicionar}
              onChange={(e) => setCargaAdicionar(e.target.value)}
            />
          </Form.Group>

          <Table striped hover responsive>
            <thead className="table-secondary text-center">
              <tr>
                <th>Selecionar</th>
                <th>ID</th>
                <th>Nome</th>
                <th>Esquadrão</th>
                <th>Carga Horária Atual</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item) => (
                <tr key={item.id}>
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={selecionados.includes(item.id)}
                      onChange={() => handleSelecionar(item.id)}
                    />
                  </td>
                  <td className="text-center">{item.id}</td>
                  <td>{item.nome}</td>
                  <td className="text-center">{item.esquadrao}</td>
                  <td className="text-center">{item.cargaHoraria || 0} h</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={aplicarCargaHoraria}>
            <BsCheck2 className="me-1" /> Aplicar Horas
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de histórico */}
<Modal show={showHistorico} onHide={() => setShowHistorico(false)} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>Histórico de {itemHistorico?.nome}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <h6>Histórico de Horas</h6>
    <Table striped hover responsive>
      <thead className="table-secondary text-center">
        <tr>
          <th>Data</th>
          <th>Horas</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {itemHistorico?.historicoHoras.map((registro, index) => (
          <tr key={index} className="text-center">
            <td>
              <Form.Control
                type="date"
                value={registro.data}
                onChange={(e) => handleEditarHistorico(index, registro.horas, e.target.value)}
              />
            </td>
            <td>
              <Form.Control
                type="number"
                min="0"
                value={registro.horas}
                onChange={(e) => handleEditarHistorico(index, e.target.value, registro.data)}
              />
            </td>
            <td>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleExcluirHistorico(index)}
              >
                Excluir
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    {/* Adicionar novo registro */}
    <Button
      variant="success"
      onClick={() => {
        const novaEntrada = { data: new Date().toISOString().split("T")[0], horas: 0 };
        const novoHistorico = [...itemHistorico.historicoHoras, novaEntrada];
        setItemHistorico((prev) => ({ ...prev, historicoHoras: novoHistorico }));

        setDados((prev) =>
          prev.map((item) =>
            item.id === itemHistorico.id
              ? { ...item, historicoHoras: novoHistorico }
              : item
          )
        );
      }}
    >
      Adicionar Registro
    </Button>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowHistorico(false)}>
      Fechar
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default AdminCargaHoraria;
