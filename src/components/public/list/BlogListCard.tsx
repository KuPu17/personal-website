'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import ListCardMedia from '@/components/public/list/ListCardMedia';
import ListCardDate from '@/components/public/list/ListCardDate';
import ControllerEditButton from '@/components/public/list/ControllerEditButton';
import { useListController } from '@/components/public/list/ListControllerProvider';
import type { ListCardData } from '@/lib/list-content';

type Props = ListCardData & {
  themeColor: string;
  expanded: boolean;
  onToggle: () => void;
};

const markdownLink: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </a>
  ),
};

export default function BlogListCard({
  id,
  title,
  description,
  imageUrl,
  contentMd,
  slug,
  href,
  isPrivate,
  publishedAt,
  displayMonth,
  displayYear,
  themeColor,
  expanded,
  onToggle,
}: Props) {
  const { startEdit } = useListController();
  const hasMedia = Boolean(imageUrl);
  const hasDescription = Boolean(description?.trim());
  const hasContent = Boolean(contentMd?.trim());

  const editPayload: ListCardData = {
    id,
    title,
    description,
    imageUrl,
    contentMd,
    slug,
    href,
    isPrivate,
    publishedAt,
    displayMonth,
    displayYear,
  };

  return (
    <div className="list-card-wrap">
      <ControllerEditButton
        itemId={id}
        onEdit={() => startEdit(editPayload)}
      />
      <article
        className={`list-card list-card--blog${expanded ? ' list-card--expanded' : ''}`}
        style={{ '--list-card-bg': themeColor } as React.CSSProperties}
      >
        <button
          type="button"
          className="list-card__toggle"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          {!expanded ? (
            <>
              <ListCardMedia title={title} imageUrl={imageUrl} />
              <div
                className={`list-card__body${hasMedia ? '' : ' list-card__body--flush-top'}`}
              >
                <ListCardDate pageType="blog" publishedAt={publishedAt} />
                <h2 className="list-card__heading">{title}</h2>
                {hasDescription && (
                  <p className="list-card__description">{description}</p>
                )}
              </div>
            </>
          ) : (
            <div className="list-card__expanded">
              <ListCardDate
                pageType="blog"
                publishedAt={publishedAt}
              />
              <h2 className="list-card__heading list-card__heading--center">
                {title}
              </h2>
              {hasContent && (
                <div
                  className="list-card__content"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={markdownLink}
                  >
                    {contentMd ?? ''}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </button>
      </article>
    </div>
  );
}
