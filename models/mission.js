console.log("Hello from mission.js")
const mongoose = require("mongoose")

/*Make missions, where player has to obtain a certain amount of objects by travelling to 
different cities, and buy for instance  a certain amount of weapons. The bigger vehicle,
the more weapons you can carry with you. By doing this you will earn an amount that makes you
earn based on the mission you choose. Example:

1. Perform 10 crime missions and you will be rewarded 1000xp.
2. Buy a car, and you will be rewarded 500xp
3. Buy a weapon and you will be rewarded 300xp
4. Buy some armour, and you will be rewarded 200xp.
5. Have atleast 30 defencePoints, and you will get 300xp and 2000$.

Logikk
Ha en dict av funksjoner, som blir lagd tilpasset hvert mission.

*/

var missionSchema = new mongoose.Schema({
    name: {type: String, required: true},
    _city: {type: String, required: true},
    rewardxp: {type: Number, required: true},
    rewardPayout: {type: Number, required: true},
    level: {type: Number, required: true},
    requirements: [
        {
            objectKey: {type: String, required: true}, // example inventory.cars or equipped.cars, if using eq as operator, this is not used
            operator: {type: String, required: true}, // has, eq, gt, lt
            checkFieldname: {type: String, required: true}, // what fieldname inside objectKey to check example name
            val: {type: String, required: true}, // what value to compare with example 'Tesla Model S'
        }
    ]

    /**
     * for (requirement in mission.requirements){
     * 
     *  switch (requirement.operator) {
     *      case 'contains':
     *          return missionCheckContains(user, mission);
     *          break;
     *      case 'length':
     *          return missionCheckLength(user, mission);
     *  }
     * }
     * 
     * function missionCheckContains(user, mission) {
     *  for (car in user.[mission.fieldname]){
     *      if (car.[mission.checkFieldname] == mission.val){
     *          return true
     *      }
     * }
     * }
     */


    /**
     * 1.if click == missions.name:
     *   2.  do this....
     *     3 count = 0,
     *      if ....  count +=1.
     *      if count == missioon.length
     *       
     * 
     * 
     * 
     */
 
    /* category name
    // Each time crime is performed: check if user.missions containts a mission with crime tag
    // If it has crime tag, add to crimeLog with crimeproperty (name, difficulty xp, reward etc)
    // 
    // Or maybe we could make a copy of the user object when crime started, and then compare
    // it to current user. Then check against the missionrequirements hmmm
    / or add the logic as a function the mission, then run this code when checking
    */ 
});

missionSchema.pre("save",function(next) {
    this.edited = new Date();
    return next();
});
module.exports = mongoose.model("Mission", missionSchema);