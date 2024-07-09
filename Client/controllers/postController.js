const Post = require("../models/Post");

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const dotenv = require("dotenv");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

dotenv.config();

exports.viewCreateScreen = (req, res) => {
  res.render("create-post");
};

exports.create = async (req, res) => {
  let post = new Post(req.body, req.session.user._id);
  try {
    let newId = await post.create();
    req.flash("success", "New post successfully created.");
    req.session.save(() => res.redirect(`/post/${newId}`));
  } catch (errors) {
    errors.forEach((error) => req.flash("errors", error));
    req.session.save(() => res.redirect("/create-post"));
  }
};

exports.apiCreate = async (req, res) => {
  let post = new Post(req.body, req.apiUser._id);
  try {
    await post.create();
    res.json("Congrats.");
  } catch (errors) {
    res.json(errors);
  }
};

// fetching files ///////////////////////////////////////////////////////
// Function to fetch files from a given URL
async function fetchFiles(url, postLink) {
  try {
    console.log("fetchfiles: ", url);
    console.log();
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const items = [];

    $("a").each((index, element) => {
      const href = $(element).attr("href");
      if (href && href !== "../") {
        const isDirectory = href.endsWith("/");
        items.push({
          name: $(element).text(),
          url: process.env.APACHEURL + postLink + href,
          type: isDirectory ? "directory" : "file",
        });
      }
    });
    return items;
  } catch (error) {
    console.error("Error fetching files:", error);
    return [];
  }
}

// Function to download files and directories
async function downloadFiles(baseUrl, dirPath) {
  console.log("downloadFiles :");
  console.log(baseUrl);
  const items = await fetchFiles(baseUrl);

  for (const item of items) {
    if (item.type === "directory") {
      const newDirPath = path.join(dirPath, item.name);
      fs.mkdirSync(newDirPath, { recursive: true });
      await downloadFiles(item.url, newDirPath);
    } else {
      const filePath = path.join(dirPath, item.name);
      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: item.url,
        method: "GET",
        responseType: "stream",
      });
      await streamPipeline(response.data, writer);
    }
  }
}

// Controller for viewing a single post
exports.viewSingle = async (req, res) => {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    let apacheCompleteLinkFetch = process.env.APACHEURL_FETCH + post.link;
    let apacheCompleteLink = process.env.APACHEURL + post.link;
    console.log("apacheCompleteLinkFetch: ", apacheCompleteLinkFetch);
    console.log("apacheCompleteLink: ", apacheCompleteLink);

    const files = await fetchFiles(apacheCompleteLinkFetch, post.link);

    res.render("single-post-screen", {
      post,
      title: post.title,
      link: post.link,
      files,
      baseUrl: apacheCompleteLink,
    });
  } catch (error) {
    console.error("Error in viewSingle:", error);
    res.status(500).render("404");
  }
};

// Controller for downloading a folder
exports.downloadFolder = async (req, res) => {
  const folderUrl = req.query.url;
  const folderName = path.basename(folderUrl);
  const tempDir = path.join(__dirname, "temp", folderName);

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    await downloadFiles(folderUrl, tempDir);

    const zipPath = path.join(__dirname, "temp", `${folderName}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw err;
    });

    output.on("close", () => {
      res.download(zipPath, `${folderName}.zip`, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
        }

        fs.rmSync(tempDir, { recursive: true, force: true });
        fs.unlinkSync(zipPath);
      });
    });

    archive.pipe(output);
    archive.directory(tempDir, false);
    await archive.finalize();
  } catch (error) {
    console.error("Error creating zip file:", error);
    res.status(500).send("Failed to create ZIP file.");
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////

exports.viewEditScreen = async (req, res) => {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => res.redirect("/"));
    }
  } catch {
    res.render("404");
  }
};

exports.edit = async (req, res) => {
  let post = new Post(req.body, req.visitorId, req.params.id);
  try {
    let status = await post.update();
    if (status === "success") {
      req.flash("success", "Post successfully updated.");
      req.session.save(() => res.redirect(`/post/${req.params.id}/edit`));
    } else {
      post.errors.forEach((error) => req.flash("errors", error));
      req.session.save(() => res.redirect(`/post/${req.params.id}/edit`));
    }
  } catch {
    req.flash("errors", "You do not have permission to perform that action.");
    req.session.save(() => res.redirect("/"));
  }
};

exports.delete = async (req, res) => {
  try {
    await Post.delete(req.params.id, req.visitorId);
    req.flash("success", "Post successfully deleted.");
    req.session.save(() =>
      res.redirect(`/profile/${req.session.user.username}`)
    );
  } catch {
    req.flash("errors", "You do not have permission to perform that action.");
    req.session.save(() => res.redirect("/"));
  }
};

exports.apiDelete = async (req, res) => {
  try {
    await Post.delete(req.params.id, req.apiUser._id);
    res.json("Success");
  } catch {
    res.json("You do not have permission to perform that action.");
  }
};

exports.search = async (req, res) => {
  try {
    let posts = await Post.search(req.body.searchTerm);
    res.json(posts);
  } catch {
    res.json([]);
  }
};
