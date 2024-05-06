import express from 'express';
import path from 'path';

const app = express();

// Serve static files from the React app
app.use(express.static(path.resolve(path.dirname(''), 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(path.dirname(''), 'dist', 'index.html'));
});

// eslint-disable-next-line no-undef
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
