import { useEffect, useState } from "react";
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

const ProntuarioAieMormo = () => {
    const { numero } = useParams();

    const hoje = new Date().toISOString().split("T")[0];

    const [aieMormo, setAieMormo] = useState({
        data_exame: hoje,
        validade: "60",
        resultado: "",
        descricao: "",
        status_conclusao: "concluido",
        usuario_aplicacao: "",
    });
    const [usuarios, setUsuarios] = useState([]);
    const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        let ativo = true;

        api.listarVeterinarios()
            .then((data) => {
                if (!ativo) return;
                const lista = Array.isArray(data) ? data : [];
                setUsuarios(lista);
                if (lista.length > 0) {
                    setAieMormo((prev) => ({
                        ...prev,
                        usuario_aplicacao: prev.usuario_aplicacao || String(lista[0].id),
                    }));
                }
            })
            .catch(() => {
                if (!ativo) return;
                setUsuarios([]);
            })
            .finally(() => {
                if (ativo) setCarregandoUsuarios(false);
            });

        return () => {
            ativo = false;
        };
    }, []);

    const handleAieMormoSubmit = async (e) => {
        e.preventDefault();

        if (!numero) {
            alert("Número do solípede não encontrado na rota.");
            return;
        }

        if (!aieMormo.usuario_aplicacao) {
            alert("Selecione o responsável pela aplicação.");
            return;
        }

        setSalvando(true);
        const payload = {
            numero_solipede: Number(numero),
            data_exame: aieMormo.data_exame || hoje,
            validade: aieMormo.validade || null,
            resultado: aieMormo.resultado || null,
            descricao: aieMormo.descricao?.trim() || null,
            status_conclusao: aieMormo.status_conclusao,
            usuario_aplicacao: Number(aieMormo.usuario_aplicacao),
        };

        console.log("=================================");
        console.log("💉 HANDLE AIE & MORMO SUBMIT");
        console.log("Dados recebidos:");
        console.log(payload);
        console.log("=================================");

        try {
            const resultado = await api.criarProntuarioAieMormo(payload);
            if (resultado?.success || resultado?.id) {
                alert("AIE & Mormo salvo com sucesso! ✅");
                setAieMormo({
                    data_exame: hoje,
                    validade: "",
                    resultado: "",
                    descricao: "",
                    status_conclusao: "em_andamento",
                    usuario_aplicacao: usuarios[0]?.id ? String(usuarios[0].id) : "",
                });
                window.location.reload();
            } else {
                alert(
                    buildUserErrorMessage(
                        "Falha ao salvar AIE & Mormo",
                        resultado,
                        "A API rejeitou o lançamento de AIE & Mormo"
                    )
                );
            }
        } catch (error) {
            console.error("Erro ao enviar AIE & Mormo:", error);
            alert(
                buildUserErrorMessage(
                    "Erro ao enviar AIE & Mormo",
                    error,
                    "Falha na comunicação durante o envio do exame"
                )
            );
        } finally {
            setSalvando(false);
        }
    };

    const handleReset = () => {
        setAieMormo({
            data_exame: hoje,
            validade: "",
            resultado: "",
            descricao: "",
            status_conclusao: "em_andamento",
            usuario_aplicacao: usuarios[0]?.id ? String(usuarios[0].id) : "",
        });
    };

    return (
        <div>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleAieMormoSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                AIE & Mormo
                            </Form.Label>
                        </Form.Group>

                        <div
                            className="mt-3 mb-3 p-3 rounded"
                            style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dee2e6",
                            }}
                        >
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                            Data do Exame *
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={aieMormo.data_exame}
                                            onChange={(e) =>
                                                setAieMormo({
                                                    ...aieMormo,
                                                    data_exame: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                            max={hoje}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                            Validade (Dias)
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            size="sm"
                                            placeholder="Número de dias de validade (ex: 60)"
                                            value={aieMormo.validade}
                                            onChange={(e) =>
                                                setAieMormo({
                                                    ...aieMormo,
                                                    validade: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                            min="0"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Responsável pela aplicação
                                    </Form.Label>
                                    <Form.Select
                                        value={aieMormo.usuario_aplicacao}
                                        onChange={(e) =>
                                            setAieMormo({
                                                ...aieMormo,
                                                usuario_aplicacao: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={salvando || carregandoUsuarios}
                                    >
                                        <option value="">
                                            {carregandoUsuarios ? "Carregando usuários..." : "Selecione o responsável"}
                                        </option>
                                        {usuarios.map((usuario) => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nome}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex gap-2">
                            <Button
                                type="submit"
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
                                onClick={handleReset}
                                disabled={salvando}
                            >
                                Limpar
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProntuarioAieMormo;
