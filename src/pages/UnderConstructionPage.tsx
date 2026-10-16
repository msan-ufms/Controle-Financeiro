import { ArrowLeft, ArrowUpRight, House } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import constructionImage from "../assets/pagina-em-construcao.jpg";

export default function UnderConstructionPage({}) {
  const navigate = useNavigate();

  return (
    <main>
      <section>
        <div>
          <img
            src={constructionImage}
            alt="Ilustração de uma página em construção"
            className="h-full w-full object-contain p-4"
          />
        </div>

        {/* Ações */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
          >
            <House size={18} />
            Ir para o dashboard
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
