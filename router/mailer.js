const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/send-email', async (req, res) => {

    const userEmail = req.body.email;

    // Configuration transporteur (exemple Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tonemail@gmail.com',
            pass: 'mot_de_passe_application' // pas ton vrai mot de passe
        }
    });

    const mailOptions = {
        from: 'tonemail@gmail.com',
        to: userEmail,
        subject: 'Bienvenue !',
        text: 'Merci pour votre inscription 🚀'
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send('Email envoyé avec succès');
    } catch (error) {
        console.log(error);
        res.send('Erreur lors de l’envoi');
    }
});

module.exports = router;