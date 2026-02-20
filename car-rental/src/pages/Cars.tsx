import CarsCommentsPanel from "../components/cars/CarsCommentsPanel";
import CarsFilters from "../components/cars/CarsFilters";
import CarsGridCard from "../components/cars/CarsGridCard";
import useCarsPage from "../components/cars/useCarsPage";

export default function Cars() {
  const {
    user,
    cars,
    filteredCars,
    reservedCarIds,
    loading,
    error,
    search,
    descriptionSearch,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    availabilityFilter,
    reservationFilter,
    ratingSavingCarId,
    hoveredRating,
    panelCarId,
    selectedCar,
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
    setSearch,
    setDescriptionSearch,
    setMinPrice,
    setMaxPrice,
    setMinYear,
    setMaxYear,
    setAvailabilityFilter,
    setReservationFilter,
    setHoveredRating,
    setPanelRating,
    setNewComment,
    setCommentFilter,
    setCommentSort,
    setCommentSearch,
    openComments,
    closePanel,
    handleRate,
    updateRatingFromPanel,
    createComment,
    removeComment,
    loadComments,
  } = useCarsPage();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 pb-16 pt-32">
      <section className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Fleet</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Choose Your Ride</h1>
        </header>

        {loading && <p className="text-zinc-300">Loading cars...</p>}
        {!loading && error && <p className="text-red-400">{error}</p>}
        {!loading && !error && cars.length === 0 && (
          <p className="text-zinc-400">No cars found. Add cars from admin API first.</p>
        )}

        {!loading && cars.length > 0 && (
          <>
            <CarsFilters
              search={search}
              descriptionSearch={descriptionSearch}
              minPrice={minPrice}
              maxPrice={maxPrice}
              minYear={minYear}
              maxYear={maxYear}
              availabilityFilter={availabilityFilter}
              reservationFilter={reservationFilter}
              onSearchChange={setSearch}
              onDescriptionSearchChange={setDescriptionSearch}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              onMinYearChange={setMinYear}
              onMaxYearChange={setMaxYear}
              onAvailabilityFilterChange={setAvailabilityFilter}
              onReservationFilterChange={setReservationFilter}
            />

            {filteredCars.length === 0 ? (
              <p className="text-zinc-400">No cars match your current filters.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCars.map((car) => {
                  const previewRating =
                    hoveredRating?.carId === car._id
                      ? hoveredRating.value
                      : Number(car.userRating ?? 0);

                  return (
                    <CarsGridCard
                      key={car._id}
                      car={car}
                      isReserved={reservedCarIds.includes(car._id)}
                      isLoggedIn={Boolean(user)}
                      ratingSaving={ratingSavingCarId === car._id}
                      previewRating={previewRating}
                      onRate={(value) => handleRate(car._id, value)}
                      onHoverRating={(value) => setHoveredRating({ carId: car._id, value })}
                      onLeaveRating={() => setHoveredRating(null)}
                      onOpenComments={() => openComments(car)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <CarsCommentsPanel
        isOpen={Boolean(panelCarId && selectedCar)}
        selectedCar={selectedCar}
        userLoggedIn={Boolean(user)}
        panelRating={panelRating}
        ratingSavingInPanel={ratingSavingInPanel}
        newComment={newComment}
        creatingComment={creatingComment}
        deletingCommentId={deletingCommentId}
        panelComments={panelComments}
        panelLoading={panelLoading}
        panelPagination={panelPagination}
        commentFilter={commentFilter}
        commentSort={commentSort}
        commentSearch={commentSearch}
        onClose={closePanel}
        onPanelRatingChange={setPanelRating}
        onUpdateRating={updateRatingFromPanel}
        onNewCommentChange={setNewComment}
        onCreateComment={createComment}
        onDeleteComment={removeComment}
        onCommentFilterChange={setCommentFilter}
        onCommentSortChange={setCommentSort}
        onCommentSearchChange={setCommentSearch}
        onLoadMore={() => {
          if (!panelCarId) return;
          loadComments(panelCarId, panelPagination.page + 1, true);
        }}
      />
    </main>
  );
}
