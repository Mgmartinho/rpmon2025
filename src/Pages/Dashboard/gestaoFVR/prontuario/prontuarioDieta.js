import { useState } from "react";
import {
    Col,
    Row,
    Card,
    Form,
    Button,
    Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";

import { api } from "../../../../services/api";
import { buildUserErrorMessage } from "../../../../utils/errorHandling";


const ProntuarioDieta = () => {
    const { numero } = useParams();

    const [dietaSelecionada, setDietaSelecionada] = useState({
        jejum: false,
        meiaRacao: false,
        fenoSoFeno: false,
        fenoSoFenoMolhado: false,
        fenoMolhadoMaisRacao: false
    });

    const [descricao, setDescricao] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [salvando, setSalvando] = useState(false);


    const handleDietaSubmit = async (e) => {
        e.preventDefault();

        setSalvando(true);
        window.location.reload();
        if (!numero) {
            alert("Número do solípede não encontrado na rota.");
            setSalvando(false);
            return;
        }

        const opcoesSelecionadas = [];
        if (dietaSelecionada.jejum) opcoesSelecionadas.push("Jejum");
        if (dietaSelecionada.meiaRacao) opcoesSelecionadas.push("1/2 ração");
        if (dietaSelecionada.fenoSoFeno) opcoesSelecionadas.push("Feno (só feno)");
        if (dietaSelecionada.fenoSoFenoMolhado) opcoesSelecionadas.push("Feno molhado");
        if (dietaSelecionada.fenoMolhadoMaisRacao) opcoesSelecionadas.push("Feno molhado + meia ração");

        const payload = {
            numero_solipede: Number(numero),
            tipo_dieta: opcoesSelecionadas.join("; ") || null,
            descricao: descricao?.trim() || null,
            data_criacao: dataInicio || null,
            data_fim: dataFim || null,
            status_conclusao: "em_andamento",
        };

        try {
            const resultado = await api.criarProntuarioDieta(payload);
            if (resultado?.success || resultado?.id) {
                alert("Dieta salva com sucesso! ✅");
                setDietaSelecionada({
                    jejum: false,
                    meiaRacao: false,
                    fenoSoFeno: false,
                    fenoSoFenoMolhado: false,
                    fenoMolhadoMaisRacao: false,
                });
                setDescricao("");
                setDataInicio("");
                setDataFim("");
            } else {
                alert(
                    buildUserErrorMessage(
                        "Falha ao salvar dieta",
                        resultado,
                        "A API rejeitou o lançamento de dieta"
                    )
                );
            }
        } catch (error) {
            console.error("Erro ao enviar dieta:", error);
            alert(
                buildUserErrorMessage(
                    "Erro ao enviar dieta",
                    error,
                    "Falha na comunicação durante o envio da dieta"
                )
            );
        } finally {
            setSalvando(false);
        }

    }

    return (
        <div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form id="form-prontuario-dieta" onSubmit={handleDietaSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Dieta
                            </Form.Label>
                        </Form.Group>
                        <div className="mt-3 mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                            <Form.Label className="fw-bold mb-3">🥕 Selecione a(s) opção(ões) de dieta:</Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Jejum"
                                className="mb-2"
                                checked={dietaSelecionada.jejum}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, jejum: e.target.checked })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="1/2 ração"
                                className="mb-2"
                                checked={dietaSelecionada.meiaRacao}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, meiaRacao: e.target.checked })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Feno (só feno)"
                                className="mb-2"
                                checked={dietaSelecionada.fenoSoFeno}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, fenoSoFeno: e.target.checked })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Feno molhado"
                                className="mb-2"
                                checked={dietaSelecionada.fenoSoFenoMolhado}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, fenoSoFenoMolhado: e.target.checked })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Feno molhado + Meia ração paga de ração"
                                className="mb-2"
                                checked={dietaSelecionada.fenoMolhadoMaisRacao}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, fenoMolhadoMaisRacao: e.target.checked })}
                            />
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
                    <Form.Label className="fw-bold">Descrição da Dieta (Opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        aria-label="With textarea"
                        placeholder="Observações adicionais sobre a dieta..."
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
                        type="submit"
                        form="form-prontuario-dieta"
                        variant="success"
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
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            // Resetar checkboxes de dieta
                            setDietaSelecionada({
                                jejum: false,
                                meiaRacao: false,
                                fenoSoFeno: false,
                                fenoSoFenoMolhado: false,
                                fenoMolhadoMaisRacao: false
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



export default ProntuarioDieta