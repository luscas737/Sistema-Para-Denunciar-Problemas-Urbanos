import { CategoriaDenuncia, StatusDenuncia } from '../denuncia.enums';
export declare class Denuncia {
    id: string;
    titulo: string;
    descricao: string;
    categoria: CategoriaDenuncia;
    latitude: number;
    longitude: number;
    foto: string | null;
    status: StatusDenuncia;
    criadoEm: Date;
    atualizadoEm: Date;
}
