export default function CmsContent({ title, content }) {
  return (
    <section className="cms-block">
      {title ? <h1>{title}</h1> : null}
      <div
        className="cms-html"
        dangerouslySetInnerHTML={{ __html: content || '<p>Nenhum conteúdo disponível.</p>' }}
      />
    </section>
  );
}
