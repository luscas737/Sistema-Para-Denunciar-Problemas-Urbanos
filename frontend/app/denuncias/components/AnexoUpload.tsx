'use client';

import { useCallback, useRef, useState } from 'react';
import { uploadAnexo, Anexo } from '@/lib/denuncias';

type FotoParaEnviar = {
  arquivo: File;
  preview: string;
  descricao: string;
};

export default function AnexoUpload({
  denunciaId,
  anexosExistentes = [],
  onConcluido,
}: {
  denunciaId: string;
  anexosExistentes?: Anexo[];
  onConcluido?: (anexos: Anexo[]) => void;
}) {
  const [fotos, setFotos] = useState<FotoParaEnviar[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const abrirCamera = useCallback(() => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.85)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '50';

    const fechar = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    };

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.style.width = '320px';
    video.style.height = '240px';
    video.style.background = '#000';
    video.style.borderRadius = '12px';

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    canvas.style.display = 'none';

    const botoes = document.createElement('div');
    botoes.style.marginTop = '16px';
    botoes.style.display = 'flex';
    botoes.style.gap = '12px';

    const btnCapturar = document.createElement('button');
    btnCapturar.type = 'button';
    btnCapturar.textContent = 'Capturar foto';
    btnCapturar.style.padding = '8px 16px';
    btnCapturar.style.background = '#2563eb';
    btnCapturar.style.color = '#fff';
    btnCapturar.style.border = 'none';
    btnCapturar.style.borderRadius = '8px';
    btnCapturar.style.cursor = 'pointer';

    const btnFechar = document.createElement('button');
    btnFechar.type = 'button';
    btnFechar.textContent = 'Cancelar';
    btnFechar.style.padding = '8px 16px';
    btnFechar.style.background = '#64748b';
    btnFechar.style.color = '#fff';
    btnFechar.style.border = 'none';
    btnFechar.style.borderRadius = '8px';
    btnFechar.style.cursor = 'pointer';

    btnFechar.onclick = fechar;
    btnCapturar.onclick = () => {
      canvas.getContext('2d')?.drawImage(video, 0, 0, 320, 240);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const arquivo = new File([blob], `camera-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        const preview = URL.createObjectURL(arquivo);
        setFotos((atual) => [...atual, { arquivo, preview, descricao: '' }]);
        fechar();
      }, 'image/jpeg');
    };

    botoes.appendChild(btnCapturar);
    botoes.appendChild(btnFechar);
    modal.appendChild(video);
    modal.appendChild(botoes);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        streamRef.current = stream;
        video.srcObject = stream;
        video.play();
      })
      .catch(() => {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            streamRef.current = stream;
            video.srcObject = stream;
            video.play();
          })
          .catch(() => {
            alert('Não foi possível acessar a câmera.');
            fechar();
          });
      });
  }, []);

  const selecionarArquivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files ?? []);
    for (const arquivo of arquivos) {
      if (!arquivo.type.startsWith('image/')) continue;
      const preview = URL.createObjectURL(arquivo);
      setFotos((atual) => [...atual, { arquivo, preview, descricao: '' }]);
    }
    e.target.value = '';
  };

  const removerFoto = (index: number) => {
    setFotos((atual) => atual.filter((_, i) => i !== index));
  };

  const enviarTudo = useCallback(async () => {
    if (fotos.length === 0) {
      onConcluido?.(anexosExistentes);
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      const enviados: Anexo[] = [];
      for (const foto of fotos) {
        const anexo = await uploadAnexo(
          denunciaId,
          foto.arquivo,
          'imagem',
          foto.descricao || undefined,
        );
        enviados.push(anexo);
      }
      onConcluido?.([...anexosExistentes, ...enviados]);
    } catch {
      setErro('Não foi possível enviar as fotos. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }, [denunciaId, fotos, anexosExistentes, onConcluido]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Fotos</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={selecionarArquivos}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          type="button"
          onClick={abrirCamera}
          className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-200"
        >
          📷 Câmera
        </button>
      </div>

      {fotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fotos.map((foto, i) => (
            <div key={i} className="relative group">
              <img
                src={foto.preview}
                alt="preview"
                className="w-full h-24 rounded-lg object-cover border border-slate-200"
              />
              <button
                type="button"
                onClick={() => removerFoto(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
              <input
                type="text"
                placeholder="Descrição"
                value={foto.descricao}
                onChange={(e) => {
                  const proximas = [...fotos];
                  proximas[i].descricao = e.target.value;
                  setFotos(proximas);
                }}
                className="absolute bottom-0 left-0 right-0 p-1 text-xs bg-white/90 backdrop-blur border border-slate-200 rounded-b-lg opacity-0 group-hover:opacity-100 transition"
              />
            </div>
          ))}
        </div>
      )}

      {erro && <p className="text-xs text-red-600">{erro}</p>}

      <button
        type="button"
        disabled={enviando}
        onClick={enviarTudo}
        className="w-full py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {enviando ? 'Enviando fotos...' : 'Anexar fotos à denúncia'}
      </button>
    </div>
  );
}