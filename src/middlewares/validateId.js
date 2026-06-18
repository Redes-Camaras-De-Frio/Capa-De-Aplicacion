function validateId(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'ID inválido. Debe ser un número entero positivo.' });
  }
  req.params.id = id;
  next();
}

function validateQueryInt(paramName) {
  return (req, res, next) => {
    const val = req.query[paramName];
    if (val !== undefined) {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed < 1) {
        return res.status(400).json({ error: `Parámetro '${paramName}' inválido. Debe ser un número entero positivo.` });
      }
      req.query[paramName] = parsed;
    }
    next();
  };
}

module.exports = { validateId, validateQueryInt };
