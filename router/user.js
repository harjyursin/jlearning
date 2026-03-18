const express = require('express');
const router = express.Router(); // ⚠️ Important !
const {PrismaClient} = require('../generated/prisma');
const { isAuthenticated } = require('../controllers/auth.middleware');
const prisma = new PrismaClient();


// Exemple de route publique
router.get('/', isAuthenticated, async(req, res) => {
   const userId = req.session.user?.id;
    if (!userId) return res.redirect('/');

    // Récupérer toutes les vidéos
    const cours = await prisma.cours.findMany({ orderBy: { id: 'asc' } });

    // Récupérer le progrès de l'utilisateur pour toutes les vidéos
    const historiques = await prisma.historique.findMany({
        where: { userId },
        include: { cours: true } // inclut les infos de chaque cours
    });

    // Créer un tableau avec toutes les vidéos et leur progression
    const progressData = cours.map(c => {
        const hist = historiques.find(h => h.coursId === c.id);
        return {
            id: c.id,
            titre: c.titre,
            progress: hist ? hist.progress : 0,
            duration: c.duration || 0
        };
    });

    res.render('client/index', { title: "Tableau de bord", progressData,historiques });
    
});
// Progress
router.post('/client/cours/progress', async (req, res) => {
    const userId = req.session.user.id;
    if (!userId) return res.status(401).send("Non connecté");

    const { coursId, progress } = req.body;

    await prisma.historique.upsert({
        where: { userId_coursId: { userId, coursId } },
        update: { progress },
        create: { userId, coursId, progress }
    });

    res.json({ ok: true });
});
// Afficher la dernière vidéo par défaut
router.get('/cours', async (req, res) => {
    const userId = req.session.user?.id; // protection si session vide
    if (!userId) return res.redirect('/');

    const cours = await prisma.cours.findMany({ orderBy: { id: 'asc' } });

    // Pas de vidéos
    if (cours.length === 0) return res.render('client/cours', {
        title: "Cours",
        cours: [],
        dc: null,
        nextVideoId: null,
        startTime: 0
    });

    // Dernière vidéo comme vidéo principale
    const dc = cours[cours.length - 1];
    const currentIndex = cours.findIndex(c => c.id === dc.id);
    const nextVideo = cours[currentIndex + 1] || null;

    // Progrès utilisateur
    const historique = await prisma.historique.findUnique({
        where: { userId_coursId: { userId, coursId: dc.id } }
    });

    const startTime = historique ? (historique.progress / 100) * (dc.duration || 0) : 0;

    res.render('client/cours', {
        title: "Cours",
        cours,
        dc,
        nextVideoId: nextVideo ? nextVideo.id : null,
        startTime,
        historique
    });
});

// Route dynamique pour une vidéo spécifique
router.get('/cours/:id', async (req, res) => {
    const userId = req.session.user?.id; 
    if (!userId) return res.redirect('/');

    const id = parseInt(req.params.id);

    const cours = await prisma.cours.findMany({ orderBy: { id: 'asc' } });
    const dc = await prisma.cours.findUnique({ where: { id } });

    if (!dc) return res.redirect('/cours'); // sécurité si id invalide

    const currentIndex = cours.findIndex(c => c.id === dc.id);
    const nextVideo = cours[currentIndex + 1] || null;

    // Progrès utilisateur
    const historique = await prisma.historique.findUnique({
        where: { userId_coursId: { userId, coursId: id } }
    });

    const startTime = historique ? (historique.progress / 100) * (dc.duration || 0) : 0;

    res.render('client/cours', {
        title: "Cours",
        cours,
        dc,
        nextVideoId: nextVideo ? nextVideo.id : null,
        startTime,
        historique
    });
});

// messages
router.get("/message", isAuthenticated,  async (req, res) => {

  const adminId = req.session.user.id;

  // Liste des users
  const users = await prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "desc" }
  });

  res.render("client/message", {
    title: "Messages",
    users,
    messages: [],
    selectedUser: null,
    session: req.session
  });
});
router.get("/message/:id", isAuthenticated, async (req, res) => {

  const userId = req.session.user.id;
  const adminId = parseInt(req.params.id);

  const users = await prisma.user.findMany({
    where: { role: "admin" }
  });

  // Récupérer conversation
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { id_e: userId, id_r: adminId },
        { id_e: adminId, id_r: userId }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  // Marquer messages reçus comme lus
  await prisma.message.updateMany({
    where: {
      id_e: userId,
      id_r: adminId,
      vu: "non"
    },
    data: { vu: "oui" }
  });

  res.render("client/message", {
    title: "Messages",
    users,
    messages,
    selectedUser: userId,
    session: req.session
  });
});

router.post("/message/:id", isAuthenticated, async (req, res) => {

  const userId = req.session.user.id;
  const adminId = parseInt(req.params.id);
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.redirect(`/client/message/${userId}`);
  }

  await prisma.message.create({
    data: {
      id_e: userId,
      id_r: adminId,
      message: message.trim()
    }
  });

  res.redirect(`/client/message/${userId}`);
});



router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect('/');
    }

    res.clearCookie('connect.sid'); // default session cookie name
    res.redirect('/');
  });
});

module.exports = router; // ⚠️ Important !