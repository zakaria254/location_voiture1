// Login
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email et mot de passe obligatoires"
        });
    }

    // Simulation login
    res.json({
        success: true,
        message: "Connexion réussie",
        user: {
            id: 1,
            email: email
        }
    });
};

// Register
exports.register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires"
        });
    }

    // Simulation création utilisateur
    res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        user: {
            id: 2,
            name,
            email
        }
    });
};
