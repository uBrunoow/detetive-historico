import { ButtonLink } from "@/components/ui/Button";
import { strings } from "@/lib/strings/pt-BR";

export default function NotFound() {
  return (
    <main id="conteudo" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-4 py-16">
      <p className="doc-stamp rotate-[-6deg] px-3 py-1 text-lg font-bold uppercase tracking-[0.08em]">404</p>
      <h1 className="mt-6 font-pixel text-2xl font-bold">{strings.app.notFound}</h1>
      <ButtonLink href="/" className="mt-8">
        {strings.app.notFoundAction}
      </ButtonLink>
    </main>
  );
}
