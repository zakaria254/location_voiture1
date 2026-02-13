exports.getCars = (req, res) => {
    res.json({ message: "Liste des voitures" });
};

exports.getCarById = (req, res) => {
    res.json({ message: `Voiture ID ${req.params.id}` });
};

exports.createCar = (req, res) => {
    res.json({ message: "Nouvelle voiture ajoutée" });
};
