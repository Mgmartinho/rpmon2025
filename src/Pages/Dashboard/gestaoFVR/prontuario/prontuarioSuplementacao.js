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


const ProntuarioSuplementacao = () => {
    const [loading, setLoading] = useState(true);

    // Estados para suplementação (quando tipoObservacao === "Suplementação")
    const [suplementacao, setSuplementacao] = useState({
        produto: "",
        dose: "",
        frequencia: "",
        data_inicio: "",
        data_validade: "",
    });


    const CarregarSuplementacao = async () => {
        try {
            const response = await api.get("/suplementacao");
            console.log("Suplementação carregada:", response.data);
            // Aqui você pode atualizar o estado com os dados da suplementação, se necessário
        } catch (error) {
            console.error("Erro ao carregar a suplementação:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        CarregarSuplementacao();
    }, []);


    const data = new Date();
    const dataFormatada = data.toLocaleDateString("pt-BR"); // Formato data Brazileira (DD/MM/YYYY)



    const [descricao, setDescricao] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [salvando, setSalvando] = useState(false);


    const handleSuplementacaoSubmit = (e) => {
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
                    <Form onSubmit={handleSuplementacaoSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Suplementação - {dataFormatada}
                            </Form.Label>
                        </Form.Group>
                        <div className="mt-3 mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                            <Row>
                                <Col md={4} xl={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Produto *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            placeholder="Nome do produto/suplemento"
                                            value={suplementacao.produto}
                                            onChange={(e) => setSuplementacao({ ...suplementacao, produto: e.target.value })}
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4} xl={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Dose *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            placeholder="Dose do suplemento"
                                            value={suplementacao.dose}
                                            onChange={(e) => setSuplementacao({ ...suplementacao, dose: e.target.value })}
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                                <Row>
                                    <Col md={4} xl={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Frequência *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                size="sm"
                                                placeholder="Frequência do suplemento"
                                                value={suplementacao.frequencia}
                                                onChange={(e) => setSuplementacao({ ...suplementacao, frequencia: e.target.value })}
                                                disabled={salvando}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Row>


                        </div>
                    </Form>
                </Card.Body>
                <Card.Body>
                    <Row>
                        <Col md={6} xl={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Inicio da Dieta (Opcional)</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Se não informada, o sistema marcará com a data atual.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6} xl={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Data Final da Dieta (Opcional)</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Data da finalização da dieta.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
                <Card.Footer className="bg-light border-0">
                    <Form.Label className="fw-bold">Observações da suplementação(Opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        aria-label="With textarea"
                        placeholder="Observações adicionais sobre a suplementação..."
                        value={descricao}
                        maxLength={500}
                        onChange={(e) => setDescricao(e.target.value)}
                        style={{ resize: "vertical" }} // ou remova completamente
                        disabled={salvando}
                    />
                    <small className="text-muted">
                        {descricao.length}/500 caracteres
                    </small>
                </Card.Footer>

                <div className="d-flex gap-2">
                    <Button
                        variant="success"
                        onClick={handleSuplementacaoSubmit}
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
                            // Resetar campos de suplementação
                            setSuplementacao({
                                produto: "",
                                dose: "",
                                frequencia: "",
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



export default ProntuarioSuplementacao