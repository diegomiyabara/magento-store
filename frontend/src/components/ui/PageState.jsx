export function LoadingState({ title = 'Carregando...' }) {
  return (
    <section className="state-card">
      <div className="spinner" aria-hidden="true" />
      <p>{title}</p>
    </section>
  );
}

export function ErrorState({ title = 'Não foi possível carregar este conteúdo.', detail }) {
  return (
    <section className="state-card state-card-error">
      <h2>{title}</h2>
      {detail ? <p>{detail}</p> : null}
    </section>
  );
}

export function EmptyState({ title, detail }) {
  return (
    <section className="state-card">
      <h2>{title}</h2>
      {detail ? <p>{detail}</p> : null}
    </section>
  );
}

export function InlineLoadingState({ title = 'Carregando...' }) {
  return (
    <section className="inline-state-card">
      <div className="spinner spinner-small" aria-hidden="true" />
      <p>{title}</p>
    </section>
  );
}

export function InlineErrorState({ title, detail }) {
  return (
    <section className="inline-state-card inline-state-card-error">
      <h3>{title}</h3>
      {detail ? <p>{detail}</p> : null}
    </section>
  );
}
