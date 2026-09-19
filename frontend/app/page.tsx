import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-8">
        <h1 className="text-2xl font-bold mb-2">Encontrou um problema na sua rua?</h1>
        <p className="text-slate-600 max-w-2xl">
          Registre buracos na via, postes queimados, lixo acumulado e outros problemas urbanos para que outros
          moradores tenham ciência e possam acompanhar a resolução.
        </p>
      </section>
      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/denuncias/nova"
          className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition"
        >
          <span className="block text-lg font-semibold mb-1">Nova denuncia</span>
          <span className="text-sm text-blue-100">Registrar um problema urbano</span>
        </Link>
        <Link
          href="/mapa"
          className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-400 transition"
        >
          <span className="block text-lg font-semibold mb-1">Ver mapa</span>
          <span className="text-sm text-slate-500">Visualizar problemas registrados</span>
        </Link>
      </section>
    </div>
  );
}
