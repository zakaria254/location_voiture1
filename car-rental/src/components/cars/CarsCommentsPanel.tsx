import { Link } from "react-router-dom";
import { SendHorizontal, Star, Trash2, X } from "lucide-react";
import { formatDate } from "../../pages/admin/utils";
import type { Car, CommentFilter, CommentItem, CommentPagination, CommentSort } from "./types";

type CarsCommentsPanelProps = {
  isOpen: boolean;
  selectedCar: Car | null;
  userLoggedIn: boolean;
  panelRating: number;
  ratingSavingInPanel: boolean;
  newComment: string;
  creatingComment: boolean;
  deletingCommentId: string | null;
  panelComments: CommentItem[];
  panelLoading: boolean;
  panelPagination: CommentPagination;
  commentFilter: CommentFilter;
  commentSort: CommentSort;
  commentSearch: string;
  onClose: () => void;
  onPanelRatingChange: (value: number) => void;
  onUpdateRating: () => void;
  onNewCommentChange: (value: string) => void;
  onCreateComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onCommentFilterChange: (value: CommentFilter) => void;
  onCommentSortChange: (value: CommentSort) => void;
  onCommentSearchChange: (value: string) => void;
  onLoadMore: () => void;
};

export default function CarsCommentsPanel({
  isOpen,
  selectedCar,
  userLoggedIn,
  panelRating,
  ratingSavingInPanel,
  newComment,
  creatingComment,
  deletingCommentId,
  panelComments,
  panelLoading,
  panelPagination,
  commentFilter,
  commentSort,
  commentSearch,
  onClose,
  onPanelRatingChange,
  onUpdateRating,
  onNewCommentChange,
  onCreateComment,
  onDeleteComment,
  onCommentFilterChange,
  onCommentSortChange,
  onCommentSearchChange,
  onLoadMore,
}: CarsCommentsPanelProps) {
  if (!isOpen || !selectedCar) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto mt-14 max-h-[82vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm text-zinc-400">Comments & rating</p>
            <h3 className="text-lg font-semibold">
              {selectedCar.marque} {selectedCar.modele}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/20 p-2 text-zinc-200 hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b border-white/10 p-5 md:border-b-0 md:border-r">
            <p className="mb-2 text-sm font-medium text-zinc-300">Your rating</p>
            <div className="mb-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button key={starValue} type="button" onClick={() => onPanelRatingChange(starValue)} className={`text-2xl transition ${starValue <= panelRating ? "text-yellow-400" : "text-zinc-500"}`}>
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
            <button type="button" onClick={onUpdateRating} disabled={ratingSavingInPanel} className="mb-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-zinc-950 hover:opacity-90 disabled:opacity-60">
              {ratingSavingInPanel ? "Updating..." : "Update rating"}
            </button>

            <p className="mb-2 text-sm font-medium text-zinc-300">Write a new comment</p>
            <textarea
              value={newComment}
              onChange={(event) => onNewCommentChange(event.target.value)}
              maxLength={500}
              rows={5}
              disabled={!userLoggedIn || creatingComment}
              placeholder={userLoggedIn ? "Write your comment..." : "Login to comment"}
              className="w-full rounded-xl border border-white/15 bg-zinc-950/70 p-3 text-sm outline-none focus:border-primary disabled:opacity-60"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={onCreateComment} disabled={creatingComment || !newComment.trim()} className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-zinc-950 hover:opacity-90 disabled:opacity-60">
                <SendHorizontal className="h-4 w-4" />
                {creatingComment ? "Posting..." : "Post comment"}
              </button>
              {!userLoggedIn && (
                <Link to="/login" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-zinc-800">
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="h-[56vh] overflow-y-auto p-4">
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
              <select value={commentFilter} onChange={(e) => onCommentFilterChange(e.target.value as CommentFilter)} className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs">
                <option value="all">All comments</option>
                <option value="mine">My comments</option>
              </select>
              <select value={commentSort} onChange={(e) => onCommentSortChange(e.target.value as CommentSort)} className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <input value={commentSearch} onChange={(e) => onCommentSearchChange(e.target.value)} placeholder="Search text..." className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs outline-none" />
            </div>

            <p className="mb-3 text-xs text-zinc-400">{panelPagination.total} comment(s)</p>

            {panelLoading && panelComments.length === 0 ? (
              <p className="text-sm text-zinc-400">Loading comments...</p>
            ) : panelComments.length === 0 ? (
              <p className="text-sm text-zinc-400">No comments found.</p>
            ) : (
              <div className="space-y-2">
                {panelComments.map((comment) => (
                  <article key={comment._id} className="rounded-lg border border-white/10 bg-zinc-950/50 p-2.5">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-zinc-100">{comment.user?.name || "User"}</p>
                      <p className="text-xs text-zinc-500">{formatDate(comment.updatedAt || comment.createdAt)}</p>
                    </div>
                    <p className="max-h-24 overflow-y-auto break-words pr-1 text-xs leading-5 text-zinc-300 [overflow-wrap:anywhere]">{comment.comment}</p>
                    {comment.isMine && (
                      <button type="button" onClick={() => onDeleteComment(comment._id)} disabled={deletingCommentId === comment._id} className="mt-2 inline-flex items-center gap-1 rounded-md border border-red-400/40 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10 disabled:opacity-60">
                        <Trash2 className="h-3 w-3" />
                        {deletingCommentId === comment._id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}

            {panelPagination.hasNext && (
              <button type="button" onClick={onLoadMore} disabled={panelLoading} className="mt-4 w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-60">
                {panelLoading ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
