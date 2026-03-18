const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt")
const { PrismaClient } = require("../generated/prisma");
// const { verify } = require('jsonwebtoken');

const prisma = new PrismaClient()

router.get('/', (req, res) => {
  res.render('auth/index', {
    layout: "layouts/auth",
    title: "Authentification"
  });
});
router.get('/signup', (req, res) => {
  res.render('auth/signup', {
    layout: "layouts/auth",
    title: "Authentification"
  });
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { pseudo, nom, email, mdp, cMdp, terme } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // ✅ Si utilisateur existe déjà
    if (user) {
      req.flash("error", "Utilisateur existant !");
      return res.redirect('/');
    }

    // ✅ Vérification mot de passe
    if (mdp !== cMdp) {
      req.flash("error", "Mot de passe non identique !");
      return res.redirect('/');
    }

    // ✅ Vérification terme
    if (!terme) {
      req.flash("error", "Veuillez accepter les termes et conditions !");
      return res.redirect('/');
    }

    // ✅ Hash mot de passe
    const verif = await bcrypt.hash(mdp, 10);

    // ✅ Création utilisateur
    await prisma.user.create({
      data: { pseudo, nom, email, mdp: verif }
    });

    req.flash('success', 'Compte créé avec succès !');
    res.redirect('/');

  } catch (error) {
    console.error(error);
    req.flash("error", "Erreur serveur");
    res.redirect('/');
  }
});
// Login
router.post('/login', async (req, res) => {
  try {
    const { email, mdp } = req.body

    if (!email || !mdp) {
      req.flash("error", "Tous les champs sont obligatoires")
      return res.redirect('/');
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      req.flash("error", "Utilisateur introuvable")
      return res.redirect('/');
    }

    const validPassword = await bcrypt.compare(mdp, user.mdp)

    if (!validPassword) {
      req.flash("error", "Mot de passe incorrect")
      return res.redirect('/');
    }

    req.session.user = {
      id: user.id,
      photo: user.photo,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role,
      createdAt:user.createdAt
    }




    if (user.role == 'admin') {
      return res.redirect("/admin");
    } else if (user.role == 'user') {
      return res.redirect('/client');
    }

  } catch (error) {
    console.error(error)
    req.flash("error", "Erreur serveur")
    res.redirect('/');
  }
})

module.exports = router;