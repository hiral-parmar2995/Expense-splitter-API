
const calculateShares = (amount,members,splitType,customShares = [] )=>{

    let shares = [];

    if(splitType === 'equal')
    {
        //split equal
        const shareAmount = parseFloat((amount / members.length).toFixed(2));

        //rounding 

        let total =0;
        shares = members.map((member ,index) =>{

            // remaining to last person

            if(index===member.length -1){
                return{
                    userId:member.user_id || member.id,
                    shareAmount:parseFloat((amount -total).toFixed(2))
                };
            }

            total += shareAmount;
            return{
                userId:member.user_id || member.id,
                shareAmount
            };
        });

    }
    else if (splitType=== 'percentage')
    {

        const totalPercentage = customShares.reduce((sum ,s)=>sum + s.percentage,0);

        if(Math.abs(totalPercentage -100)>0.01){
            throw new Error('Percentages must add up to 100');
        }

        shares = customShares.map(s =>({
            userId:s.userId,
            shareAmount:parseFloat((amount * s.percentage /100).toFixed(2))
        }));
    }
    else if (splitType === 'custom')
    {
        const totalShares = customShares.reduce((sum,s)=>sum+s.shareAmount,0);

        if(Math.abs(totalShares -amount)>0.01)
        {
            throw new Error('Custom shares must up to total amount');
        }

        shares =customShares.map(s =>({
            userId:s.userId,
            shareAmount:parseFloat(s.shareAmount.toFixed(2))
        }));
    }

    return shares;
};

module.exports={calculateShares};