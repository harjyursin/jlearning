const express = require('express');
const router = express.Router(); // ⚠️ Important !
const {isAuthenticated,isAdmin} = require("../controllers/auth.middleware")
const { PrismaClient } = require("../generated/prisma")
const fs = require('fs');
const prisma = new PrismaClient()

// Route admin
router.get("/",isAuthenticated,isAdmin,async(req, res) => {
    const video  = await prisma.cours.count();
    const user  = await prisma.user.count({where:{role:'user'}});
    const equipes = await prisma.user.findMany({where:{role:'admin'}});
    res.render("admin/index",{layout:"layouts/admin",title:"Tableau de bord",equipes,video,user});
  })
router.get("/message", isAuthenticated, isAdmin, async (req, res) => {

  const adminId = req.session.user.id;

  // Liste des users
  const users = await prisma.user.findMany({
    where: { role: "user" },
    orderBy: { createdAt: "desc" }
  });

  res.render("admin/message", {
    layout: "layouts/admin",
    title: "Messages",
    users,
    messages: [],
    selectedUser: null,
    session: req.session
  });
});

router.get("/message/:id", isAuthenticated, isAdmin, async (req, res) => {

  const adminId = req.session.user.id;
  const userId = parseInt(req.params.id);

  const users = await prisma.user.findMany({
    where: { role: "user" }
  });

  // Récupérer conversation
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { id_e: adminId, id_r: userId },
        { id_e: userId, id_r: adminId }
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

  res.render("admin/message", {
    layout: "layouts/admin",
    title: "Messages",
    users,
    messages,
    selectedUser: userId,
    session: req.session
  });
});
router.post("/message/:id", isAuthenticated, isAdmin, async (req, res) => {

  const adminId = req.session.user.id;
  const userId = parseInt(req.params.id);
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.redirect(`/admin/message/${userId}`);
  }

  await prisma.message.create({
    data: {
      id_e: adminId,
      id_r: userId,
      message: message.trim()
    }
  });

  res.redirect(`/admin/message/${userId}`);
});

// Fin message


router.get("/courses",isAuthenticated,isAdmin,async(req, res) => {
    const cours = await prisma.cours.findMany({orderBy:{createdAt:'desc'}});
    res.render("admin/courses/index",{layout:"layouts/admin",title:"Les cours",cours});
})
router.get("/courses/exercice",isAuthenticated,isAdmin,(req, res) => {
    res.render("admin/exercices/index",{layout:"layouts/admin",title:"Exercices"});
})
router.get("/courses/add",isAuthenticated,isAdmin,(req, res) => {
    res.render("admin/courses/ajout",{layout:"layouts/admin",title:"Ajout des cours"});
})
router.get("/profile",isAuthenticated,isAdmin,async(req, res) => {
    const profile = await prisma.user.findUnique({where:{id:req.session.user.id}});
    res.render("admin/profile/index",{layout:"layouts/admin",title:"Profil",profile});
})
router.post("/profile/update",isAuthenticated,isAdmin,async(req, res) => {
    const fichier = req.files.photo;
        await prisma.user.update({data:{photo:fichier.name},where:{id:req.session.user.id}});
        fichier.mv('./public/assets/profile/'+fichier.name);
        res.redirect('/admin/profile');
})
router.post("/add",isAuthenticated,isAdmin,async(req, res) => {
    const fichier = req.files.video;
    const {titre,description}=req.body;
    const ajout = await prisma.cours.create({data:{video:fichier.name,titre,description}});

    if(ajout){
      if(fichier.mimetype=='video/mp4'){

        fichier.mv('./public/assets/videos/'+fichier.name);
      }else{
        fichier.mv('./public/assets/documents/'+fichier.name);
      }
    }

    res.redirect('/admin/courses');
})


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


module.exports = router; 