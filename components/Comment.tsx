import {
  ArrowUpIcon,
  KebabHorizontalIcon,
} from '@primer/octicons-react';
import {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import {
  handleCommentClick,
  processCommentBody,
} from '../lib/adapter';

import {
  IComment,
  IReply,
} from '../lib/types/adapter';

import {
  Reaction,
  updateCommentReaction,
} from '../lib/reactions';

import {
  toggleUpvote,
} from '../services/github/toggleUpvote';

import CommentBox from './CommentBox';
import ReactButtons from './ReactButtons';
import Reply from './Reply';

import {
  AuthContext,
} from '../lib/context';

import {
  useDateFormatter,
  useGiscusTranslation,
  useRelativeTimeFormatter,
} from '../lib/i18n';

interface ICommentProps {
  children?: ReactNode;
  comment: IComment;
  replyBox?: ReactElement<typeof CommentBox>;
  onCommentUpdate?: (
    newComment: IComment,
    promise: Promise<unknown>,
  ) => void;
  onReplyUpdate?: (
    newReply: IReply,
    promise: Promise<unknown>,
  ) => void;
}

export default function Comment({
  children,
  comment,
  replyBox,
  onCommentUpdate,
  onReplyUpdate,
}: ICommentProps) {
  const { t, dir } = useGiscusTranslation();

  const formatDate = useDateFormatter();
  const formatDateDistance =
    useRelativeTimeFormatter();

  const [backPage, setBackPage] =
    useState(0);

  const replies = comment.replies.slice(
    -5 - backPage * 50,
  );

  const remainingReplies =
    comment.replyCount - replies.length;

  const hasNextPage =
    replies.length < comment.replies.length;

  const hasUnfetchedReplies =
    !hasNextPage &&
    remainingReplies > 0;

  const { token } =
    useContext(AuthContext);

  const updateReactions =
    useCallback(
      (
        reaction: Reaction,
        promise: Promise<unknown>,
      ) =>
        onCommentUpdate?.(
          updateCommentReaction(
            comment,
            reaction,
          ),
          promise,
        ),
      [
        comment,
        onCommentUpdate,
      ],
    );

  const incrementBackPage =
    useCallback(() => {
      setBackPage(
        previous => previous + 1,
      );
    }, []);

  const upvote =
    useCallback(() => {
      const upvoteCount =
        comment.viewerHasUpvoted
          ? comment.upvoteCount - 1
          : comment.upvoteCount + 1;

      const promise =
        toggleUpvote(
          {
            upvoteInput: {
              subjectId: comment.id,
            },
          },
          token,
          comment.viewerHasUpvoted,
        );

      onCommentUpdate?.(
        {
          ...comment,
          upvoteCount,
          viewerHasUpvoted:
            !comment.viewerHasUpvoted,
        },
        promise,
      );
    }, [
      comment,
      onCommentUpdate,
      token,
    ]);

  const hidden =
    Boolean(comment.deletedAt) ||
    comment.isMinimized;

  return (
    <article
      className={[
        'gsc-comment',
        'group',
        'relative',
        'w-full',
        'min-w-0',
        'py-2',
      ].join(' ')}
    >
      <div
        className={[
          'relative',
          'w-full',
          'min-w-0',
          'overflow-hidden',
          'rounded-2xl',
          'border',
          'bg-[var(--color-canvas-default)]',
          'transition-all',
          'duration-200',

          comment.viewerDidAuthor
            ? 'border-[var(--color-accent-muted)] shadow-[0_0_0_1px_var(--color-accent-muted),0_10px_35px_rgba(88,166,255,0.06)]'
            : 'border-[var(--color-border-default)] hover:border-[var(--color-border-muted)]',
        ].join(' ')}
      >
        {!comment.isMinimized ? (
          <header
            className={[
              'flex',
              'items-center',
              'justify-between',
              'gap-3',
              'px-4',
              'py-3',
              'sm:px-5',
              'sm:py-3.5',
              'border-b',
              'border-[var(--color-border-muted)]',
              'bg-[var(--color-canvas-subtle)]',
            ].join(' ')}
          >
            <div
              className={[
                'flex',
                'min-w-0',
                'items-center',
                'gap-2.5',
              ].join(' ')}
            >
              <a
                rel="nofollow noopener noreferrer"
                target="_blank"
                href={comment.author.url}
                className={[
                  'group/author',
                  'flex',
                  'min-w-0',
                  'items-center',
                  'gap-2.5',
                  'rounded-xl',
                  'outline-none',
                  'focus-visible:ring-2',
                  'focus-visible:ring-[var(--color-accent-emphasis)]',
                ].join(' ')}
              >
                <img
                  className={[
                    'h-9',
                    'w-9',
                    'shrink-0',
                    'rounded-full',
                    'border',
                    'border-[var(--color-border-muted)]',
                    'bg-[var(--color-canvas-inset)]',
                    'object-cover',
                    'transition-transform',
                    'duration-200',
                    'group-hover/author:scale-[1.04]',
                  ].join(' ')}
                  src={comment.author.avatarUrl}
                  width="36"
                  height="36"
                  alt={`@${comment.author.login}`}
                  loading="lazy"
                />

                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={[
                        'min-w-0',
                        'overflow-hidden',
                        'text-ellipsis',
                        'whitespace-nowrap',
                        'text-sm',
                        'font-semibold',
                        'text-[var(--color-fg-default)]',
                        'transition-colors',
                        'group-hover/author:text-[var(--color-accent-fg)]',
                      ].join(' ')}
                    >
                      {comment.author.login}
                    </span>

                    {comment.authorAssociation !==
                    'NONE' ? (
                      <span
                        className={[
                          'hidden',
                          'rounded-full',
                          'border',
                          'border-[var(--color-accent-muted)]',
                          'bg-[var(--color-accent-subtle)]',
                          'px-2',
                          'py-0.5',
                          'text-[9px]',
                          'font-semibold',
                          'uppercase',
                          'tracking-[0.08em]',
                          'text-[var(--color-accent-fg)]',
                          'sm:inline-flex',
                        ].join(' ')}
                      >
                        {t(
                          comment.authorAssociation,
                        )}
                      </span>
                    ) : null}
                  </div>

                  <a
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                    href={comment.url}
                    className={[
                      'mt-0.5',
                      'block',
                      'text-[11px]',
                      'text-[var(--color-fg-muted)]',
                      'transition-colors',
                      'hover:text-[var(--color-fg-default)]',
                    ].join(' ')}
                  >
                    <time
                      title={formatDate(
                        comment.createdAt,
                      )}
                      dateTime={
                        comment.createdAt
                      }
                    >
                      {formatDateDistance(
                        comment.createdAt,
                      )}
                    </time>
                  </a>
                </div>
              </a>

              {comment.lastEditedAt ? (
                <button
                  type="button"
                  className={[
                    'shrink-0',
                    'rounded-full',
                    'border',
                    'border-[var(--color-border-muted)]',
                    'px-2',
                    'py-0.5',
                    'text-[10px]',
                    'font-medium',
                    'text-[var(--color-fg-muted)]',
                    'transition-colors',
                    'hover:border-[var(--color-border-default)]',
                    'hover:text-[var(--color-fg-default)]',
                  ].join(' ')}
                  title={t(
                    'lastEditedAt',
                    {
                      date: formatDate(
                        comment.lastEditedAt,
                      ),
                    },
                  )}
                >
                  {t('edited')}
                </button>
              ) : null}
            </div>
          </header>
        ) : null}

        {/*
          The <div> element might contain an interactive
          button generated by GitHub's markdown renderer.
        */}

        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div
          dir={
            children
              ? dir
              : 'auto'
          }
          className={[
            'markdown',
            'gsc-comment-content',
            'px-4',
            'py-4',
            'sm:px-5',
            'sm:py-5',

            comment.isMinimized
              ? 'minimized border-b border-[var(--color-border-muted)] bg-[var(--color-canvas-inset)]'
              : '',
          ].join(' ')}
          onClick={handleCommentClick}
          dangerouslySetInnerHTML={
            hidden
              ? undefined
              : {
                  __html:
                    processCommentBody(
                      comment.bodyHTML,
                    ),
                }
          }
        >
          {hidden ? (
            <div
              className={[
                'rounded-xl',
                'border',
                'border-[var(--color-border-muted)]',
                'bg-[var(--color-canvas-subtle)]',
                'px-3.5',
                'py-3',
                'text-sm',
              ].join(' ')}
            >
              <em className="not-italic text-[var(--color-fg-muted)]">
                {comment.deletedAt
                  ? t(
                      'thisCommentWasDeleted',
                    )
                  : t(
                      'thisCommentWasMinimized',
                    )}
              </em>
            </div>
          ) : null}
        </div>

        {children}

        {!comment.isMinimized &&
        onCommentUpdate ? (
          <footer
            className={[
              'flex',
              'min-h-12',
              'items-center',
              'justify-between',
              'gap-3',
              'border-t',
              'border-[var(--color-border-muted)]',
              'bg-[var(--color-canvas-subtle)]',
              'px-3',
              'py-2',
              'sm:px-4',
            ].join(' ')}
          >
            <div
              className={[
                'flex',
                'min-w-0',
                'items-center',
                'gap-1.5',
              ].join(' ')}
            >
              <button
                type="button"
                className={[
                  'gsc-upvote-button',
                  'gsc-social-reaction-summary-item',
                  'inline-flex',
                  'h-8',
                  'items-center',
                  'gap-1.5',
                  'rounded-lg',
                  'border',
                  'px-2.5',
                  'text-xs',
                  'font-medium',
                  'transition-all',
                  'duration-150',

                  comment.viewerHasUpvoted
                    ? 'has-reacted border-[var(--color-accent-muted)] bg-[var(--color-accent-subtle)] text-[var(--color-accent-fg)]'
                    : 'border-[var(--color-border-muted)] bg-[var(--color-canvas-default)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-canvas-overlay)] hover:text-[var(--color-fg-default)]',
                ].join(' ')}
                onClick={upvote}
                disabled={
                  true ||
                  !token ||
                  !comment.viewerCanUpvote
                }
                aria-label={
                  token
                    ? t('upvote')
                    : t(
                        'youMustBeSignedInToUpvote',
                      )
                }
                title={
                  token
                    ? t('upvotes', {
                        count:
                          comment.upvoteCount,
                      })
                    : t(
                        'youMustBeSignedInToUpvote',
                      )
                }
              >
                <ArrowUpIcon
                  className={[
                    'h-3.5',
                    'w-3.5',
                    'shrink-0',
                  ].join(' ')}
                />

                <span
                  className="gsc-social-reaction-summary-item-count"
                  title={t('upvotes', {
                    count:
                      comment.upvoteCount,
                  })}
                >
                  {comment.upvoteCount}
                </span>
              </button>

              {!hidden ? (
                <ReactButtons
                  reactionGroups={
                    comment.reactions
                  }
                  subjectId={comment.id}
                  onReact={
                    updateReactions
                  }
                  popoverPosition="top"
                />
              ) : null}
            </div>

            <div className="shrink-0">
              <span
                className={[
                  'inline-flex',
                  'items-center',
                  'rounded-full',
                  'border',
                  'border-[var(--color-border-muted)]',
                  'bg-[var(--color-canvas-default)]',
                  'px-2.5',
                  'py-1',
                  'text-[10px]',
                  'font-medium',
                  'text-[var(--color-fg-muted)]',
                ].join(' ')}
              >
                {t('replies', {
                  count:
                    comment.replyCount,
                  plus: '',
                })}
              </span>
            </div>
          </footer>
        ) : null}

        {comment.replies.length >
        0 ? (
          <section
            className={[
              'gsc-replies',
              'border-t',
              'border-[var(--color-border-muted)]',
              'bg-[var(--color-canvas-inset)]',
            ].join(' ')}
          >
            {hasNextPage ||
            hasUnfetchedReplies ? (
              <div
                className={[
                  'flex',
                  'items-center',
                  'gap-2.5',
                  'border-b',
                  'border-[var(--color-border-muted)]',
                  'px-4',
                  'py-2.5',
                  'sm:px-5',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex',
                    'h-7',
                    'w-7',
                    'shrink-0',
                    'items-center',
                    'justify-center',
                    'rounded-lg',
                    'bg-[var(--color-canvas-subtle)]',
                    'text-[var(--color-fg-muted)]',
                  ].join(' ')}
                >
                  <KebabHorizontalIcon className="h-3.5 w-3.5 rotate-90" />
                </div>

                {hasNextPage ? (
                  <button
                    type="button"
                    className={[
                      'rounded-lg',
                      'px-2',
                      'py-1',
                      'text-xs',
                      'font-medium',
                      'text-[var(--color-accent-fg)]',
                      'transition-colors',
                      'hover:bg-[var(--color-accent-subtle)]',
                    ].join(' ')}
                    onClick={
                      incrementBackPage
                    }
                  >
                    {t(
                      'showPreviousReplies',
                      {
                        count:
                          remainingReplies,
                      },
                    )}
                  </button>
                ) : null}

                {hasUnfetchedReplies ? (
                  <a
                    href={comment.url}
                    className={[
                      'rounded-lg',
                      'px-2',
                      'py-1',
                      'text-xs',
                      'font-medium',
                      'text-[var(--color-accent-fg)]',
                      'transition-colors',
                      'hover:bg-[var(--color-accent-subtle)]',
                    ].join(' ')}
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                  >
                    {t(
                      'seePreviousRepliesOnGitHub',
                      {
                        count:
                          remainingReplies,
                      },
                    )}
                  </a>
                ) : null}
              </div>
            ) : null}

            {onReplyUpdate
              ? replies.map(
                  reply => (
                    <Reply
                      key={reply.id}
                      reply={reply}
                      onReplyUpdate={
                        onReplyUpdate
                      }
                    />
                  ),
                )
              : null}
          </section>
        ) : null}

        {!comment.isMinimized &&
        replyBox
          ? (
            <div className="border-t border-[var(--color-border-muted)] bg-[var(--color-canvas-subtle)] p-3 sm:p-4">
              {replyBox}
            </div>
          )
          : null}
      </div>
    </article>
  );
}
