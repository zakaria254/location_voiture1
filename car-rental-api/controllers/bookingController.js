// Créer réservation
exports.createBooking = (req, res) => {
    const { carId, userId, startDate, endDate } = req.body;

    if (!carId || !userId || !startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires"
        });
    }

    res.status(201).json({
        success: true,
        message: "Réservation créée avec succès",
        booking: {
            id: 1,
            carId,
            userId,
            startDate,
            endDate,
            status: "confirmed"
        }
    });
};

// Lister réservations
exports.getBookings = (req, res) => {
    res.json({
        success: true,
        bookings: [
            {
                id: 1,
                carId: 1,
                userId: 1,
                startDate: "2026-02-15",
                endDate: "2026-02-18",
                status: "confirmed"
            }
        ]
    });
};
