import { useEffect, useState } from "react";
import {
    Col,
    Row,
    Card,
    Form,
    Spinner,
    Button,
} from "react-bootstrap";

import { api } from "../../../../services/api";


const ProntuarioRestricao = () => {
    const [loading, setLoading] = useState(true);

    // Estados para restrição (quando tipoObservacao === "Restrição")
    const [restricao, setRestricao] = useState({
        descricao: "",
        observacao: "",
        data_inicio: "",
        data_validade: "",
    });


    const CarregarRestricao = async () => {
        try {
            const response = await api.get("/restricao");
            console.log("Restrição carregada:", response.data);
            // Aqui você pode atualizar o estado com os dados da restrição, se necessário
        } catch (error) {
            console.error("Erro ao carregar a restrição:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        CarregarRestricao();
    }, []);


    const data = new Date();
    const dataFormatada = data.toLocaleDateString("pt-BR"); // Formato data Brazileira (DD/MM/YYYY)



    const [descricao, setDescricao] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [salvando, setSalvando] = useState(false);


    const handleRestricaoSubmit = (e) => {
        e.preventDefault();

    }

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" />
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleRestricaoSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Restrição 
                            </Form.Label>
                        </Form.Group>
                        <div className="mt-3 mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                            <Row>
                                <Col sm={12} md={12} xl={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Tipo de Restrição *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            maxLength={500}
                                            size="sm"
                                            placeholder="Descrição da restrição"
                                            value={restricao.descricao}
                                            onChange={(e) => setRestricao({ ...restricao, descricao: e.target.value })}
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                    <small className="text-muted">
                                        caracteres: {restricao.descricao.length}/500 caracteres
                                    </small>
                                </Col>
                                
                            </Row>

                        </div>
                    </Form>
                </Card.Body>

                <Card.Body>
                    <Row>
                        <Col md={6} xl={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Data de inicio da restrição (Opcional)</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={restricao.data_inicio}
                                    onChange={(e) => setRestricao({ ...restricao, data_inicio: e.target.value })}
                                />
                                <Form.Text className="text-muted">
                                    Se não informada, o sistema marcará com a data atual.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6} xl={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Data termino da Restrição (Opcional)</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={restricao.data_validade}
                                    onChange={(e) => setRestricao({ ...restricao, data_validade: e.target.value })}
                                />
                                <Form.Text className="text-muted">
                                    Data da finalização da dieta.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>

                <Card.Footer className="bg-light border-0">
                    <Form.Label className="fw-bold">Observações / Recomendações</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        aria-label="With textarea"
                        placeholder="Observações adicionais sobre a restrição..."
                        value={restricao.observacao}
                        maxLength={500}
                        onChange={(e) => setRestricao({ ...restricao, observacao: e.target.value })}
                        style={{ resize: "vertical" }} // ou remova completamente
                        disabled={salvando}
                    />
                    <small className="text-muted">
                        {restricao.observacao.length}/500 caracteres
                    </small>
                </Card.Footer>

                <div className="d-flex gap-2">
                    <Button
                        variant="success"
                        onClick={handleRestricaoSubmit}
                        disabled={salvando}
                    >
                        {salvando ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="me-2"
                                    animation="border"
                                />
                                Salvando...
                            </>
                        ) : (
                            <>💾 Salvar Registro</>
                        )}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            // Resetar campos de restrição
                            setRestricao({
                                descricao: "",
                                observacao: "",
                                data_inicio: "",
                                data_validade: "",
                            });
                        }}
                        disabled={salvando}
                    >
                        Limpar
                    </Button>
                </div>
            </Card>

        </div>
    )
}



export default ProntuarioRestricao