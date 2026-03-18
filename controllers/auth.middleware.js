const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/")
  }
  next()
}

const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send("Accès interdit")
  }
  next()
}

module.exports = { isAuthenticated, isAdmin }