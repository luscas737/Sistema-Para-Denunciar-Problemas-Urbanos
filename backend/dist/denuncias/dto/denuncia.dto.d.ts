import { z } from 'zod';
import { CategoriaDenuncia, StatusDenuncia } from '../denuncia.enums';
export declare const categoriaEnum: z.ZodNativeEnum<typeof CategoriaDenuncia>;
export declare const statusEnum: z.ZodNativeEnum<typeof StatusDenuncia>;
export declare const createDenunciaSchema: z.ZodObject<{
    titulo: z.ZodString;
    descricao: z.ZodString;
    categoria: z.ZodNativeEnum<typeof CategoriaDenuncia>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    foto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    titulo: string;
    descricao: string;
    categoria: CategoriaDenuncia;
    latitude: number;
    longitude: number;
    foto?: string | null | undefined;
}, {
    titulo: string;
    descricao: string;
    categoria: CategoriaDenuncia;
    latitude: number;
    longitude: number;
    foto?: string | null | undefined;
}>;
export declare const updateDenunciaSchema: z.ZodObject<{
    titulo: z.ZodOptional<z.ZodString>;
    descricao: z.ZodOptional<z.ZodString>;
    categoria: z.ZodOptional<z.ZodNativeEnum<typeof CategoriaDenuncia>>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    foto: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof StatusDenuncia>>;
}, "strip", z.ZodTypeAny, {
    titulo?: string | undefined;
    descricao?: string | undefined;
    categoria?: CategoriaDenuncia | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    foto?: string | null | undefined;
    status?: StatusDenuncia | undefined;
}, {
    titulo?: string | undefined;
    descricao?: string | undefined;
    categoria?: CategoriaDenuncia | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    foto?: string | null | undefined;
    status?: StatusDenuncia | undefined;
}>;
declare const CreateDenunciaDto_base: import("nestjs-zod").ZodDto<{
    titulo: string;
    descricao: string;
    categoria: CategoriaDenuncia;
    latitude: number;
    longitude: number;
    foto?: string | null | undefined;
}, z.ZodObjectDef<{
    titulo: z.ZodString;
    descricao: z.ZodString;
    categoria: z.ZodNativeEnum<typeof CategoriaDenuncia>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    foto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny>, {
    titulo: string;
    descricao: string;
    categoria: CategoriaDenuncia;
    latitude: number;
    longitude: number;
    foto?: string | null | undefined;
}>;
export declare class CreateDenunciaDto extends CreateDenunciaDto_base {
}
declare const UpdateDenunciaDto_base: import("nestjs-zod").ZodDto<{
    titulo?: string | undefined;
    descricao?: string | undefined;
    categoria?: CategoriaDenuncia | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    foto?: string | null | undefined;
    status?: StatusDenuncia | undefined;
}, z.ZodObjectDef<{
    titulo: z.ZodOptional<z.ZodString>;
    descricao: z.ZodOptional<z.ZodString>;
    categoria: z.ZodOptional<z.ZodNativeEnum<typeof CategoriaDenuncia>>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    foto: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof StatusDenuncia>>;
}, "strip", z.ZodTypeAny>, {
    titulo?: string | undefined;
    descricao?: string | undefined;
    categoria?: CategoriaDenuncia | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    foto?: string | null | undefined;
    status?: StatusDenuncia | undefined;
}>;
export declare class UpdateDenunciaDto extends UpdateDenunciaDto_base {
}
export {};
