const { PrismaClient } = require("./generated/prisma")
const prisma = new PrismaClient()

// TOGGLE LIKE
const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id
    const { videoId } = req.body

    const existingLike = await prisma.like.findUnique({
      where: {
        id_user_id_video: {
          id_user: userId,
          id_video: videoId
        }
      }
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id_user_id_video: {
            id_user: userId,
            id_video: videoId
          }
        }
      })

      return res.json({ message: "Like retiré" })
    }

    await prisma.like.create({
      data: {
        id_user: userId,
        id_video: videoId
      }
    })

    res.json({ message: "Vidéo likée" })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// COMPTER LES LIKES
const countLikes = async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId)

    const count = await prisma.like.count({
      where: { id_video: videoId }
    })

    res.json({ likes: count })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  toggleLike,
  countLikes
}