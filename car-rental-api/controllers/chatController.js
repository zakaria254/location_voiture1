const Booking = require('../models/Booking');
const Car = require('../models/Car');

const ACTIVE_BOOKING_STATUSES = ['en_attente', 'confirmee', 'en_cours'];

const hasAny = (text, words) => words.some((word) => text.includes(word));

const extractYear = (text) => {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
};

const formatCarLine = (car) =>
  `${car.marque} ${car.modele} - ${car.prixParJour}$/day${car.annee ? ` - ${car.annee}` : ''}`;

const listCarsInText = (cars) => cars.map((car, index) => `${index + 1}. ${formatCarLine(car)}`).join('\n');

const ask = async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required.'
      });
    }

    const lower = message.toLowerCase();
    const role = req.user?.role || 'visitor';

    const colorKeywords = ['couleur', 'color', 'colore', 'lawn'];
    if (hasAny(lower, colorKeywords)) {
      return res.status(200).json({
        success: true,
        data: {
          role,
          intent: 'cars_by_color',
          answer:
            "I can't filter by color yet because color is not stored in the current car model. I can still filter by price, year, availability, and reservations."
        }
      });
    }

    const expensiveKeywords = ['ghali', 'ghalya', 'cher', 'expensive', 'plus cher', 'lghali'];
    if (hasAny(lower, expensiveKeywords)) {
      const cars = await Car.find({ disponible: true })
        .sort({ prixParJour: -1, createdAt: -1 })
        .limit(5)
        .lean();

      const answer = cars.length
        ? `Top expensive available cars:\n${listCarsInText(cars)}`
        : 'No available cars found right now.';

      return res.status(200).json({
        success: true,
        data: { role, intent: 'expensive_cars', answer, cars }
      });
    }

    const myKeywords = ['my', 'dyali', 'mes', 'ana'];
    const bookingKeywords = ['reservation', 'booking', 'bookings', 'reserve'];
    const isMyBookingQuestion = hasAny(lower, myKeywords) && hasAny(lower, bookingKeywords);

    if (isMyBookingQuestion) {
      if (!req.user) {
        return res.status(200).json({
          success: true,
          data: {
            role: 'visitor',
            intent: 'my_bookings_requires_login',
            answer: 'Login first to see your bookings.'
          }
        });
      }

      const bookings = await Booking.find({ userId: req.user._id })
        .populate('carId', 'marque modele prixParJour')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

      const answer = bookings.length
        ? `Your latest bookings (${bookings.length}):\n${bookings
            .map(
              (booking, index) =>
                `${index + 1}. ${booking.carId?.marque || 'Unknown'} ${booking.carId?.modele || ''} - ${booking.statut}`
            )
            .join('\n')}`
        : "You don't have bookings yet.";

      return res.status(200).json({
        success: true,
        data: { role, intent: 'my_bookings', answer, bookings }
      });
    }

    const adminKeywords = ['admin', 'all bookings', 'total bookings', 'tous', 'kolchi'];
    const asksForAdminStats = hasAny(lower, adminKeywords) && hasAny(lower, bookingKeywords);
    if (asksForAdminStats) {
      if (role !== 'admin') {
        return res.status(200).json({
          success: true,
          data: {
            role,
            intent: 'admin_bookings_denied',
            answer: 'This info is admin-only.'
          }
        });
      }

      const [total, pending, confirmed, inProgress, activeReservedCars] = await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ statut: 'en_attente' }),
        Booking.countDocuments({ statut: 'confirmee' }),
        Booking.countDocuments({ statut: 'en_cours' }),
        Booking.distinct('carId', { statut: { $in: ACTIVE_BOOKING_STATUSES } })
      ]);

      const answer = `Admin bookings stats:
- Total bookings: ${total}
- Pending: ${pending}
- Confirmed: ${confirmed}
- In progress: ${inProgress}
- Cars currently reserved: ${activeReservedCars.length}`;

      return res.status(200).json({
        success: true,
        data: {
          role,
          intent: 'admin_bookings_stats',
          answer,
          meta: { total, pending, confirmed, inProgress, activeReservedCars: activeReservedCars.length }
        }
      });
    }

    const reservedKeywords = ['reserve', 'reserv', 'booked'];
    if (hasAny(lower, reservedKeywords) && !hasAny(lower, ['my', 'dyali', 'mes', 'admin'])) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const reservedCarIds = await Booking.distinct('carId', {
        statut: { $in: ACTIVE_BOOKING_STATUSES },
        dateFin: { $gte: today }
      });

      const cars = await Car.find({ _id: { $in: reservedCarIds } })
        .sort({ prixParJour: -1 })
        .limit(10)
        .lean();

      const answer = cars.length
        ? `Reserved cars right now (${cars.length}):\n${listCarsInText(cars)}`
        : 'There are no active reserved cars right now.';

      return res.status(200).json({
        success: true,
        data: {
          role,
          intent: 'reserved_cars',
          answer,
          cars,
          meta: { reservedCount: cars.length }
        }
      });
    }

    const newKeywords = ['new', 'jdad', 'nouveau', 'latest', 'kharjo'];
    if (hasAny(lower, newKeywords) || extractYear(lower)) {
      const year = extractYear(lower);
      const query = year ? { annee: year } : {};
      const cars = await Car.find(query)
        .sort(year ? { prixParJour: -1 } : { createdAt: -1 })
        .limit(6)
        .lean();

      const answer = cars.length
        ? year
          ? `Cars from ${year}:\n${listCarsInText(cars)}`
          : `Latest added cars:\n${listCarsInText(cars)}`
        : year
          ? `No cars found for ${year}.`
          : 'No recent cars found.';

      return res.status(200).json({
        success: true,
        data: {
          role,
          intent: year ? 'cars_by_year' : 'latest_cars',
          answer,
          cars,
          meta: year ? { year } : undefined
        }
      });
    }

    const fallbackByRole = {
      visitor: 'Try: "cars lghaliyin", "cars reserved", "cars 2026".',
      user: 'Try: "my bookings", "cars lghaliyin", "cars reserved", "cars 2026".',
      admin:
        'Try: "admin all bookings stats", "cars lghaliyin", "cars reserved", "cars 2026".'
    };

    return res.status(200).json({
      success: true,
      data: {
        role,
        intent: 'fallback',
        answer: `I can help with fleet and bookings queries. ${fallbackByRole[role] || fallbackByRole.visitor}`
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { ask };
