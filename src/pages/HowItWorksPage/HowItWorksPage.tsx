import { ArrowRight, Gavel, Plus, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "../../shared/components";
import { SiteFooter, SiteHeader } from "../../shared/layout";
import "./HowItWorksPage.css";

export default function HowItWorksPage() {
  return (
    <div className="app-shell how-page">
      <SiteHeader
        brandHref="/"
        navigationItems={[
          { label: "Vitrine", href: "/" },
          { label: "Como funciona", href: "/como-funciona", isActive: true }
        ]}
        actions={
          <>
            <ThemeToggle />
            <a className="button button-outline button-small" href="/">
              <ArrowRight size={15} /> Ir para a vitrine
            </a>
          </>
        }
      />
      <main>
        <section className="how-hero">
          <div className="section-kicker">SIMPLES, SEGURO E AO VIVO</div>
          <h1 className="type-page-title">Como funciona<br /><span>o leilão?</span></h1>
          <p className="type-body">Encontre uma carta, acompanhe os lances em tempo real e dispute com transparência. Quer vender? Coloque o seu Pokémon na vitrine em poucos passos.</p>
          <a className="button button-dark" href="/#vitrine">Ver leilões abertos <ArrowRight size={17} /></a>
        </section>
        <section className="how-content">
          <div className="how-role-heading">
            <span className="how-role-icon"><Gavel size={19} /></span>
            <div><div className="section-kicker">PARA QUEM QUER COLECIONAR</div><h2 className="type-section-title">Como dar um lance</h2></div>
          </div>
          <div className="how-steps">
            <article className="how-step"><span className="type-step-number">01</span><div><h3 className="type-card-title">Crie a sua conta de licitante</h3><p className="type-body-compact">Registe-se como licitante e adicione saldo simulado à sua carteira. O saldo disponível é o total menos os valores já comprometidos em lances.</p></div></article>
            <article className="how-step"><span className="type-step-number">02</span><div><h3 className="type-card-title">Escolha uma carta na vitrine</h3><p className="type-body-compact">Veja o lance atual, o incremento mínimo e o tempo restante. Acompanhe a sala em tempo real e consulte a auditoria pública do histórico.</p></div></article>
            <article className="how-step"><span className="type-step-number">03</span><div><h3 className="type-card-title">Faça um lance válido</h3><p className="type-body-compact">O primeiro lance precisa atingir o valor inicial. Depois, cada lance deve superar o atual pelo menos no incremento indicado. O líder não pode cobrir o próprio lance.</p></div></article>
            <article className="how-step"><span className="type-step-number">04</span><div><h3 className="type-card-title">Acompanhe até ao encerramento</h3><p className="type-body-compact">Quando alguém supera o seu lance, o valor comprometido volta imediatamente ao seu saldo disponível. Se houver um lance nos últimos dois minutos, o leilão ganha mais dois minutos.</p></div></article>
            <article className="how-step"><span className="type-step-number">05</span><div><h3 className="type-card-title">Arremate e receba o comprovativo</h3><p className="type-body-compact">Se o seu for o lance vencedor, o valor é debitado da sua carteira e o leiloeiro recebe o pagamento. O comprovativo partilhável identifica os participantes por pseudónimo.</p></div></article>
          </div>
          <div className="how-role-heading seller-heading">
            <span className="how-role-icon seller-icon"><Plus size={19} /></span>
            <div><div className="section-kicker">PARA QUEM QUER VENDER</div><h2 className="type-section-title">Como anunciar um item</h2></div>
          </div>
          <div className="how-steps">
            <article className="how-step"><span className="type-step-number">01</span><div><h3 className="type-card-title">Registe-se como leiloeiro</h3><p className="type-body-compact">Crie a sua conta com o perfil de leiloeiro. Esse perfil pode criar e gerir os próprios lotes, mas não pode dar lances.</p></div></article>
            <article className="how-step"><span className="type-step-number">02</span><div><h3 className="type-card-title">Pesquise e selecione o Pokémon</h3><p className="type-body-compact">Em “Criar lote”, digite o nome ou o número e escolha uma das sugestões. A aplicação consulta a PokéAPI nessa etapa e guarda a imagem oficial no servidor.</p></div></article>
            <article className="how-step"><span className="type-step-number">03</span><div><h3 className="type-card-title">Defina as regras do lote</h3><p className="type-body-compact">Informe o lance inicial, o incremento mínimo e a duração. Depois de publicado, o lote fica visível na vitrine e os lances decorrem em tempo real.</p></div></article>
            <article className="how-step"><span className="type-step-number">04</span><div><h3 className="type-card-title">Acompanhe e receba</h3><p className="type-body-compact">Não é possível cancelar um lote que já recebeu lances. Ao encerrar, o pagamento do vencedor é creditado automaticamente na sua carteira; consulte os valores no relatório financeiro.</p></div></article>
          </div>
          <aside className="how-integrity">
            <ShieldCheck size={21} />
            <div><h3 className="type-card-title">Transparência em cada etapa</h3><p className="type-body-compact">O histórico de lances é encadeado por hashes e pode ser verificado publicamente. Nomes, e-mails e outros dados pessoais não são expostos na auditoria ou nos comprovativos.</p></div>
          </aside>
          <div className="how-bottom-cta">
            <span className="type-label">Pronto para começar?</span>
            <a className="button button-primary" href="/#vitrine">Explorar a vitrine <ArrowRight size={16} /></a>
          </div>
        </section>
      </main>
      <SiteFooter
        brandHref="/"
        copyrightMessage="Feito para quem coleciona com paixão. © 2025 PokéLance."
        integrityLabel="Integridade verificável"
      />
    </div>
  );
}
