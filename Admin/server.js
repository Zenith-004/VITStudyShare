const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4000;


const uploadsPath = path.join('C:', 'Apache24', 'htdocs', 'uploads');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the new uploads directory
app.use(express.static(uploadsPath));

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = req.params.folderName;
        const folderPath = path.join(uploadsPath, folderName);

        if (!fs.existsSync(folderPath)) {
            return cb(new Error('Folder does not exist'));
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log(`Invalid file type: ${file.mimetype}`);
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Routes
app.get('/', (req, res) => {
    try {
        const folders = fs.readdirSync(uploadsPath).filter(file => fs.lstatSync(path.join(uploadsPath, file)).isDirectory());
        res.render('index', { folders });
    } catch (err) {
        console.error("Error reading directories:", err);
        res.status(500).send("Error reading directories");
    }
});

app.get('/folder/:folderName', (req, res) => {
    try {
        const folderName = req.params.folderName;
        const folderPath = path.join(uploadsPath, folderName);
        if (!fs.existsSync(folderPath)) {
            return res.status(404).send("Folder not found");
        }
        const files = fs.readdirSync(folderPath);
        res.render('folder', { folderName, files });
    } catch (err) {
        console.error("Error reading folder:", err);
        res.status(500).send("Error reading folder");
    }
});

app.post('/upload/:folderName', upload.single('file'), (req, res) => {
    res.redirect(`/folder/${req.params.folderName}`);
});

app.post('/create-folder', (req, res) => {
    const newFolderName = req.body.newFolderName;
    const newFolderPath = path.join(uploadsPath, newFolderName);
    try {
        if (!fs.existsSync(newFolderPath)) {
            fs.mkdirSync(newFolderPath);
            console.log(`Folder "${newFolderName}" created.`);
        } else {
            console.log(`Folder "${newFolderName}" already exists.`);
        }
    } catch (err) {
        console.error("Error creating folder:", err);
    }
    res.redirect('/');
});

app.post('/delete-folder/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(uploadsPath, folderName);
    try {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true });
            console.log(`Folder "${folderName}" deleted.`);
        } else {
            console.log(`Folder "${folderName}" does not exist.`);
        }
    } catch (err) {
        console.error("Error deleting folder:", err);
    }
    res.redirect('/');
});

// Add a route to delete files
app.post('/delete-file/:folderName/:fileName', (req, res) => {
    const folderName = req.params.folderName;
    const fileName = req.params.fileName;
    const filePath = path.join(uploadsPath, folderName, fileName);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File "${fileName}" deleted.`);
        } else {
            console.log(`File "${fileName}" does not exist.`);
        }
    } catch (err) {
        console.error("Error deleting file:", err);
    }

    res.redirect(`/folder/${folderName}`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
