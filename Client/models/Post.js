const postsCollection = require("../db").db().collection("posts");
const followsCollection = require("../db").db().collection("follows");
const ObjectID = require("mongodb").ObjectId;
const User = require("./User");
const sanitizeHTML = require("sanitize-html");

// Ensure text index creation only once, usually should be handled separately in a setup script or migrations.
//postsCollection.createIndex({title: "text", body: "text"})

/*
If you'd like to see a list of all the indexes you currently have on a collection you can use this code:
async function checkIndexes() {
  const indexes = await postsCollection.indexes()
  console.log(indexes)
}
checkIndexes()
You can delete an index by taking note of its name from the above list, and then you'd pass the name of the index as an argument like this:
postsCollection.dropIndex("namehere")
This way if you ever move to a new database you can just uncomment the line and the index will be created automatically.
*/

let Post = function (data, userid, requestedPostId) {
  console.log(data);
  this.data = data;
  this.errors = [];
  this.userid = userid;
  this.requestedPostId = requestedPostId;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title !== "string") {
    this.data.title = "";
  }
  if (typeof this.data.body !== "string") {
    this.data.body = "";
  }

  // get rid of any bogus properties
  this.data = {
    title: sanitizeHTML(this.data.title.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    body: sanitizeHTML(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    link: this.data.link,
    createdDate: new Date(),
    author: new ObjectID(this.userid),
  };
};

Post.prototype.validate = function () {
  if (this.data.title === "") {
    this.errors.push("You must provide a title.");
  }
  if (this.data.body === "") {
    this.errors.push("You must provide post content.");
  }
};

Post.prototype.create = async function () {
  this.cleanUp();
  this.validate();
  if (!this.errors.length) {
    try {
      const info = await postsCollection.insertOne(this.data);
      return info.insertedId;
    } catch (error) {
      this.errors.push("Please try again later.");
      throw this.errors;
    }
  } else {
    throw this.errors;
  }
};

Post.prototype.update = async function () {
  try {
    const post = await Post.findSingleById(this.requestedPostId, this.userid);
    if (post.isVisitorOwner) {
      const status = await this.actuallyUpdate();
      return status;
    } else {
      throw new Error("User does not own the post.");
    }
  } catch (error) {
    throw error;
  }
};

Post.prototype.actuallyUpdate = async function () {
  this.cleanUp();
  this.validate();
  if (!this.errors.length) {
    await postsCollection.findOneAndUpdate(
      { _id: new ObjectID(this.requestedPostId) },
      {
        $set: {
          title: this.data.title,
          body: this.data.body,
          link: this.data.link,
        },
      }
    );
    return "success";
  } else {
    return "failure";
  }
};

Post.reusablePostQuery = async function (
  uniqueOperations,
  visitorId,
  finalOperations = []
) {
  let aggOperations = uniqueOperations
    .concat([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDocument",
        },
      },
      {
        $project: {
          title: 1,
          link: 1,
          body: 1,
          createdDate: 1,
          authorId: "$author",
          author: { $arrayElemAt: ["$authorDocument", 0] },
        },
      },
    ])
    .concat(finalOperations);

  let posts = await postsCollection.aggregate(aggOperations).toArray();

  // Clean up author property in each post object
  posts = posts.map((post) => {
    post.isVisitorOwner = post.authorId.equals(visitorId);
    post.authorId = undefined;

    // Ensure post.author exists before accessing properties
    if (post.author) {
      post.author = {
        username: post.author.username || "Unknown", // Default to 'Unknown' if username is undefined
        avatar: new User(post.author, true).avatar,
      };
    } else {
      post.author = {
        username: "Unknown",
        avatar: "", // Provide a default avatar or handle as needed
      };
    }

    return post;
  });

  return posts;
};

Post.findSingleById = async function (id, visitorId) {
  if (typeof id !== "string" || !ObjectID.isValid(id)) {
    throw new Error("Invalid ID.");
  }

  let posts = await Post.reusablePostQuery(
    [{ $match: { _id: new ObjectID(id) } }],
    visitorId
  );

  if (posts.length) {
    return posts[0];
  } else {
    throw new Error("Post not found.");
  }
};

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } },
  ]);
};

Post.delete = async function (postIdToDelete, currentUserId) {
  try {
    let post = await Post.findSingleById(postIdToDelete, currentUserId);
    if (post.isVisitorOwner) {
      await postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) });
      return;
    } else {
      throw new Error("User does not own the post.");
    }
  } catch (error) {
    throw error;
  }
};

Post.search = async function (searchTerm) {
  if (typeof searchTerm === "string") {
    let posts = await Post.reusablePostQuery(
      [{ $match: { $text: { $search: searchTerm } } }],
      undefined,
      [{ $sort: { score: { $meta: "textScore" } } }]
    );
    return posts;
  } else {
    throw new Error("Invalid search term.");
  }
};

Post.countPostsByAuthor = async function (id) {
  let postCount = await postsCollection.countDocuments({ author: id });
  return postCount;
};

Post.getFeed = async function (id) {
  // create an array of the user ids that the current user follows
  let followedUsers = await followsCollection
    .find({ authorId: new ObjectID(id) })
    .toArray();
  followedUsers = followedUsers.map((followDoc) => followDoc.followedId);

  // look for posts where the author is in the above array of followed users
  return Post.reusablePostQuery([
    { $match: { author: { $in: followedUsers } } },
    { $sort: { createdDate: -1 } },
  ]);
};

module.exports = Post;
