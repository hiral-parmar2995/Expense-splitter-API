const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const express = require('express');

const app = express();


//Middleware
app.use(express.json());


//routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/groups', require('./routes/group.routes'));
app.use('/api/v1/expenses',require('./routes/expense.routes'));
app.use('/api/v1/settlements',require('./routes/settlement.routes'));
app.use('/api/v1/notifications',require('./routes/notification.routes'));

//test route
app.get('/' , (req,res) =>{
    res.json({message:'Bill Splitter API is running!'});
});


const setupGraphQl = async ()=>{
    const server = new ApolloServer({typeDefs,resolvers});
    await server.start();
     server.applyMiddleware({ app, path: '/graphql' });
    console.log('GraphQl ready at http://localhost:5000/graphql');

};
module.exports = {app , setupGraphQl};