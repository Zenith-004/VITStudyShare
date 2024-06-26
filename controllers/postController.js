const Post = require('../models/Post')

exports.viewCreateScreen = (req, res) => {
  res.render('create-post')
}

exports.create = async (req, res) => {
  let post = new Post(req.body, req.session.user._id)
  try {
    let newId = await post.create()
    req.flash("success", "New post successfully created.")
    req.session.save(() => res.redirect(`/post/${newId}`))
  } catch (errors) {
    errors.forEach(error => req.flash("errors", error))
    req.session.save(() => res.redirect("/create-post"))
  }
}

exports.apiCreate = async (req, res) => {
  let post = new Post(req.body, req.apiUser._id)
  try {
    await post.create()
    res.json("Congrats.")
  } catch (errors) {
    res.json(errors)
  }
}

exports.viewSingle = async (req, res) => {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    res.render('single-post-screen', { post: post, title: post.title })
  } catch {
    res.render('404')
  }
}

exports.viewEditScreen = async (req, res) => {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post })
    } else {
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(() => res.redirect("/"))
    }
  } catch {
    res.render("404")
  }
}

exports.edit = async (req, res) => {
  let post = new Post(req.body, req.visitorId, req.params.id)
  try {
    let status = await post.update()
    if (status === "success") {
      req.flash("success", "Post successfully updated.")
      req.session.save(() => res.redirect(`/post/${req.params.id}/edit`))
    } else {
      post.errors.forEach(error => req.flash("errors", error))
      req.session.save(() => res.redirect(`/post/${req.params.id}/edit`))
    }
  } catch {
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.delete = async (req, res) => {
  try {
    await Post.delete(req.params.id, req.visitorId)
    req.flash("success", "Post successfully deleted.")
    req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
  } catch {
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.apiDelete = async (req, res) => {
  try {
    await Post.delete(req.params.id, req.apiUser._id)
    res.json("Success")
  } catch {
    res.json("You do not have permission to perform that action.")
  }
}

exports.search = async (req, res) => {
  try {
    let posts = await Post.search(req.body.searchTerm)
    res.json(posts)
  } catch {
    res.json([])
  }
}
