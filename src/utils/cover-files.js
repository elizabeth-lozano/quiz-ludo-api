const fs = require('fs/promises');
const path = require('path');

const COVER_DIR = path.join(__dirname, '..', '..', 'uploads', 'covers');

// Delete a picture. It never throws: a missing file is not an error.
function removeCover(fileName) {
  return fs.unlink(path.join(COVER_DIR, fileName)).catch(() => {});
}

module.exports = { removeCover };