const express = require("express");
const {
	find,
	findById,
	insert,
	update,
	remove,
	findPostComments,
	findCommentById,
	insertComment,
} = require("../data/db");

const router = express.Router();

//ROUTING /API/POSTS

// CREATE NEW POST

router.post("/", async (req, res) => {
	const post = req.body;
	const { title, contents } = req.body;

	try {
		if (!title || !contents) {
			res.status(400).json({
				errorMessage: "Please provide title and contents for the post.",
			});
		} else {
			const { id } = await insert(post);
			const newPost = await findById(id);

			res.status(201).json(newPost[0]);
		}
	} catch (error) {
		res.status(500).json({
			error: "There was an error while saving the post to the database",
		});
	}
});

//CREATE NEW COMMENT

router.post("/:id/comments", async (req, res) => {
	const comment = req.body;
	const { text } = req.body;
	const { id } = req.params;
	try {
		const found = await findById(id);

		if (!text) {
			res.status(400).json({
				errorMessage: "Please provide text for the comment.",
			});
		} else if (found.length > 0) {
			const { id } = await insertComment(comment);
			const newComment = await findCommentById(id);
			res.status(201).json(newComment[0]);
		} else {
			res.status(404).json({
				message: "The post with the specified ID does not exist.",
			});
		}
	} catch (error) {
		res.status(500).json({
			error:
				"There was an error while saving the comment to the database",
		});
	}
});

// GET POSTS

router.get("/", async (req, res) => {
	try {
		const posts = await find();
		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({
			error: "The posts information could not be retrieved.",
		});
	}
});

// GET SPECIFIC POST

router.get("/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const requestedPost = await findById(id);

		if (requestedPost.length > 0) {
			res.status(200).json(requestedPost[0]);
		} else {
			res.status(404).json({
				message: "The post with the specified ID does not exist.",
			});
		}
	} catch (error) {
		res.status(500).json({
			error: "The post information could not be retrieved.",
		});
	}
});

// GET POST'S COMMENTS

router.get("/:id/comments", async (req, res) => {
	const { id } = req.params;

	try {
		const found = await findById(id);

		if (found.length > 0) {
			const comments = await findPostComments(id);
			res.status(200).json(comments);
		} else {
			res.status(404).json({
				message: "The post with the specified ID does not exist.",
			});
		}
	} catch (error) {
		res.status(500).json({
			error: "The comments information could not be retrieved.",
		});
	}
});

// DELETE SPECIFIC POST

router.delete("/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const found = await findById(id);

		if (found.length > 0) {
			await remove(id);
			res.status(200).json(found[0]);
		} else {
			res.status(404).json({
				message: "The post with the specified ID does not exist.",
			});
		}
	} catch (error) {
		res.status(500).json({ error: "The post could not be removed" });
	}
});

// UPDATE POST

router.put("/:id", async (req, res) => {
	const { id } = req.params;
	const changes = req.body;
	const { title, contents } = req.body;

	try {
		const found = await findById(id);
		if (!title || !contents) {
			res.status(400).json({
				errorMessage: "Please provide title and contents for the post.",
			});
		} else if (found.length > 0) {
			await update(id, changes);
			const updatedPost = await findById(id);
			res.status(200).json(updatedPost[0]);
		} else {
			res.status(404).json({
				message: "The post with the specified ID does not exist.",
			});
		}
	} catch (error) {
		res.status(500).json({
			error: "The post information could not be modified.",
		});
	}
});

module.exports = router;
