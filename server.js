require('dotenv').config();

const {app , setupGraphQl} = require('./app');
const connectMongo = require('./config/db.mongo');
const { connectMYSQL } = require('./config/db.mysql');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try{
    await connectMongo();
    await connectMYSQL();
    await setupGraphQl();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    }
    catch(error)
    {
        console.error('server Failed ', error.message)
        process.exit(1);
    }
};

startServer();