'use strict';

module.exports = () =>
  (req, res) => {
    res.status(404).json({message: `Route Not found`});
};
