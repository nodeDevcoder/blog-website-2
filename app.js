if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express'),
    session = require('express-session'),
    app = express();

