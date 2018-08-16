const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, path.join(__dirname, '../../temp/'));
    },
    filename: function (req, file, next) {
        let extension = file.originalname.split(".").pop();

        next(null, Date.now() + '.' + extension);
    }
});

const upload = multer({ storage });

module.exports = upload;