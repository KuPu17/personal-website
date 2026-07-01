type Props = {
  title: string;
  imageUrl?: string | null;
};

export default function ListCardMedia({ title, imageUrl }: Props) {
  if (!imageUrl) return null;

  return (
    <div className="list-card__media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="list-card__image" loading="lazy" />
      <span className="sr-only">{title}</span>
    </div>
  );
}
