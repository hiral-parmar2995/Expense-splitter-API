const {gql} = require('graphql-tag');

const typeDefs = gql `

# Types - define data shapes

type TopSpender {
userId : Int 
name:String
amount:Float
}

type ExpenseItem{
id: Int
description : String
amount : Float
paidBy : String
splitType : String
date : String
}

type MemberBalance{
userId : Int
name : String
totalPaid : Float
totalOwed : Float
netBalance : Float
}

type SettlementSuggestion{
fromName : String
toName : String
amount : Float
}

type GroupAnalytics{
groupId : Int
groupName : String
totalSpent : Float
totalMembers : Int
expenseBreakdown : [ExpenseItem]
memberBalances : [MemberBalance]
settlements : [SettlementSuggestion]
}

type UserSummary{
userId : Int
name : String
totalGroups:Int
totalPaid : Float
totalOwed:Float
netBalance : Float
}

# Queries - what you can ask for
type Query{
groupAnalytics(groupId:Int!) : GroupAnalytics
userSummary(userId:Int!): UserSummary
}

`;

module.exports=typeDefs;