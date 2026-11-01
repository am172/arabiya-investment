const express = require('express');
const ApiError = require('../utils/ApiError');

const textParser = express.text({ type: 'text/plain', limit: '4kb' });

const parseJsonBody = (req, res, next) => {
    if (typeof req.body === 'string') {
        try {
            req.body = JSON.parse(req.body);
        } catch (error) {
            return next(new ApiError(400, 'Malformed payload'));
        }
    }
    next();
};

module.exports = [textParser, parseJsonBody];