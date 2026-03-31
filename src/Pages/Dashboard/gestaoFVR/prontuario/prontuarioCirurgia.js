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

const ProntuarioCirurgia = () => {
    const { numero } = useParams();
    const hoje = new Date().toISOString().split("T")[0];

    const [cirurgia, setCirurgia] = useState({
        procedimento: "",
        descricao_procedimento: "",
        data_procedimento: hoje,
        status_conclusao: "concluido",
        cirurgiao_principal_id: "",
        cirurgiao_anestesista_id: "",
        cirurgiao_auxiliar_id: "",
        auxiliar_id: "",
    });

    const [veterinarios, setVeterinarios] = useState([]);
    const [usuariosAuxiliar, setUsuariosAuxiliar] = useState([]);
    const [carregandoVeterinarios, setCarregandoVeterinarios] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const normalizarPerfil = (perfil = "") =>
        String(perfil)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    useEffect(() => {
        let ativo = true;

        Promise.all([api.listarVeterinarios(), api.listarUsuarios()])
            .then(([listaVeterinarios, listaUsuarios]) => {
                if (!ativo) return;

                const vets = Array.isArray(listaVeterinarios) ? listaVeterinarios : [];
                const usuarios = Array.isArray(listaUsuarios) ? listaUsuarios : [];

                setVeterinarios(vets);

                const auxiliares = usuarios.filter((usuario) => {
                    const perfil = normalizarPerfil(usuario?.perfil);
                    return (
                        perfil === "veterinario" ||
                        perfil === "veterinario admin" ||
                        perfil === "enfermeiro veterinario"
                    );
                });
                setUsuariosAuxiliar(auxiliares);
            })
            .catch(() => {
                if (!ativo) return;
                setVeterinarios([]);
                setUsuariosAuxiliar([]);
            })
            .finally(() => {
                if (ativo) setCarregandoVeterinarios(false);
            });

        return () => {
            ativo = false;
        };
    }, []);

    const handleCirurgiaSubmit = async (e) => {
        e.preventDefault();

        if (!numero) {
            alert("Número do solípede não encontrado na rota.");
            return;
        }

        if (!cirurgia.procedimento || !cirurgia.procedimento.trim()) {
            alert("Procedimento é obrigatório.");
            return;
        }

        if (!cirurgia.descricao_procedimento || !cirurgia.descricao_procedimento.trim()) {
            alert("Descrição do procedimento é obrigatória.");
            return;
        }

        setSalvando(true);
        window.location.reload();
        const payload = {
            numero_solipede: Number(numero),
            procedimento: cirurgia.procedimento?.trim() || "",
            descricao_procedimento: cirurgia.descricao_procedimento?.trim() || "",
            data_procedimento: cirurgia.data_procedimento || hoje,
            status_conclusao: cirurgia.status_conclusao || "concluido",
            cirurgiao_principal_id: cirurgia.cirurgiao_principal_id ? Number(cirurgia.cirurgiao_principal_id) : null,
            cirurgiao_anestesista_id: cirurgia.cirurgiao_anestesista_id ? Number(cirurgia.cirurgiao_anestesista_id) : null,
            cirurgiao_auxiliar_id: cirurgia.cirurgiao_auxiliar_id ? Number(cirurgia.cirurgiao_auxiliar_id) : null,
            auxiliar_id: cirurgia.auxiliar_id ? Number(cirurgia.auxiliar_id) : null,
        };

        console.log("=================================");
        console.log("🩺 HANDLE CIRURGIA SUBMIT");
        console.log("Dados recebidos:");
        console.log(payload);
        console.log("=================================");

        try {
            const resultado = await api.criarProntuarioCirurgia(payload);
            if (resultado?.success || resultado?.id) {
                alert("Cirurgia salva com sucesso! ✅");
                setCirurgia({
                    procedimento: "",
                    descricao_procedimento: "",
                    data_procedimento: hoje,
                    status_conclusao: "concluido",
                    cirurgiao_principal_id: "",
                    cirurgiao_anestesista_id: "",
                    cirurgiao_auxiliar_id: "",
                    auxiliar_id: "",
                });
            } else {
                alert(
                    buildUserErrorMessage(
                        "Falha ao salvar cirurgia",
                        resultado,
                        "A API rejeitou o lançamento de cirurgia"
                    )
                );
            }
        } catch (error) {
            console.error("Erro ao enviar cirurgia:", error);
            alert(
                buildUserErrorMessage(
                    "Erro ao enviar cirurgia",
                    error,
                    "Falha na comunicação durante o envio da cirurgia"
                )
            );
        } finally {
            setSalvando(false);
        }
    };

    const handleReset = () => {
        setCirurgia({
            procedimento: "",
            descricao_procedimento: "",
            data_procedimento: hoje,
            status_conclusao: "concluido",
            cirurgiao_principal_id: "",
            cirurgiao_anestesista_id: "",
            cirurgiao_auxiliar_id: "",
            auxiliar_id: "",
        });
    };

    return (
        <div>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleCirurgiaSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Cirurgia</Form.Label>
                        </Form.Group>

                        <div
                            className="mt-3 mb-3 p-3 rounded"
                            style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dee2e6",
                            }}
                        >
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Procedimento *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            size="sm"
                                            placeholder="Nome do procedimento cirúrgico"
                                            value={cirurgia.procedimento}
                                            maxLength={5000}
                                            onChange={(e) =>
                                                setCirurgia({ ...cirurgia, procedimento: e.target.value })
                                            }
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Descrição do procedimento *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            maxLength={10000}
                                            placeholder="Descreva os detalhes da cirurgia..."
                                            value={cirurgia.descricao_procedimento}
                                            onChange={(e) =>
                                                setCirurgia({ ...cirurgia, descricao_procedimento: e.target.value })
                                            }
                                            disabled={salvando}
                                        />
                                        <small className="text-muted">
                                            {cirurgia.descricao_procedimento.length}/10000 caracteres
                                        </small>
                                    </Form.Group>
                                </Col>
                                
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Cirurgião principal</Form.Label>
                                        <Form.Select
                                            value={cirurgia.cirurgiao_principal_id}
                                            onChange={(e) =>
                                                setCirurgia({ ...cirurgia, cirurgiao_principal_id: e.target.value })
                                            }
                                            disabled={salvando || carregandoVeterinarios}
                                        >
                                            <option value="">Selecione o cirurgião principal</option>
                                            {veterinarios.map((usuario) => (
                                                <option key={usuario.id} value={usuario.id}>
                                                    {usuario.nome}{usuario.re ? ` - RE ${usuario.re}` : ""}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Cirurgião anestesista</Form.Label>
                                        <Form.Select
                                            value={cirurgia.cirurgiao_anestesista_id}
                                            onChange={(e) =>
                                                setCirurgia({ ...cirurgia, cirurgiao_anestesista_id: e.target.value })
                                            }
                                            disabled={salvando || carregandoVeterinarios}
                                        >
                                            <option value="">Selecione o cirurgião anestesista</option>
                                            {veterinarios.map((usuario) => (
                                                <option key={usuario.id} value={usuario.id}>
                                                    {usuario.nome}{usuario.re ? ` - RE ${usuario.re}` : ""}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Cirurgião auxiliar</Form.Label>
                                        <Form.Select
                                            value={cirurgia.cirurgiao_auxiliar_id}
                                            onChange={(e) =>
                                                setCirurgia({ ...cirurgia, cirurgiao_auxiliar_id: e.target.value })
                                            }
                                            disabled={salvando || carregandoVeterinarios}
                                        >
                                            <option value="">Selecione o cirurgião auxiliar</option>
                                            {veterinarios.map((usuario) => (
                                                <option key={usuario.id} value={usuario.id}>
                                                    {usuario.nome}{usuario.re ? ` - RE ${usuario.re}` : ""}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            
                                <Col md={6}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className="fw-bold">Auxiliar</Form.Label>
                                        <Form.Select
                                            value={cirurgia.auxiliar_id}
                                            onChange={(e) => setCirurgia({ ...cirurgia, auxiliar_id: e.target.value })}
                                            disabled={salvando || carregandoVeterinarios}
                                        >
                                            <option value="">Selecione o auxiliar</option>
                                            {usuariosAuxiliar.map((usuario) => (
                                                <option key={usuario.id} value={usuario.id}>
                                                    {usuario.nome}{usuario.registro ? ` - RE ${usuario.registro}` : ""}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className="fw-bold">Data do procedimento</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={cirurgia.data_procedimento || ""}
                                            onChange={(e) =>
                                                setCirurgia({ ...cirurgia, data_procedimento: e.target.value })
                                            }
                                            disabled={salvando}
                                        />
                                        <small className="text-muted">
                                            Preenchido com a data de hoje por padrão, podendo ser alterado.
                                        </small>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        <div className="d-flex gap-2">
                            <Button type="submit" variant="success" disabled={salvando}>
                                {salvando ? (
                                    <>
                                        <Spinner size="sm" className="me-2" animation="border" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>💾 Salvar Registro</>
                                )}
                            </Button>

                            <Button type="button" variant="secondary" onClick={handleReset} disabled={salvando}>
                                Limpar
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProntuarioCirurgia;