type LinkCardProps = {
  url?: string;
  title?: string;
  description?: string;
  site?: string;
  image?: string;
};

export function LinkCard({ url, title, description, site, image }: LinkCardProps) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-card block overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">Link</p>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{title || url}</h4>
          {description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{description}</p>
          )}
          {site && <p className="mt-2 text-xs text-slate-500">{site}</p>}
        </div>
        {image && (
          <div className="h-24 w-full overflow-hidden rounded-xl border border-border/40 sm:h-24 sm:w-32">
            <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        )}
      </div>
    </a>
  );
}
