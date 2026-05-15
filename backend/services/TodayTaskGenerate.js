const {
   GoogleGenerativeAI
} = require("@google/generative-ai");

const genAI =
new GoogleGenerativeAI(
   process.env.GEMINI_API_KEY
);

const model =
genAI.getGenerativeModel({
   model: "gemini-2.5-flash"
});

const generateTasksWithAI =
async(profile)=>{

   const prompt = `
Generate realistic fitness tasks.

User Goal: ${profile.goal}

Wake Up Time:
${profile.wakeUpTime}

Workout Level:
${profile.activityLevel}

Habits To Build:
${profile.habitsToBuild.join(', ')}

Return ONLY valid JSON.

Format:
{
 "tasks":[
   {
     "title":"",
     "category":"",
     "scheduledTime":"",
     "xpReward":20
   }
 ]
}
`;

   const result =
await model.generateContent(prompt);

const response =
result.response.text();

const cleaned = response
   .replace(/```json/g, '')
   .replace(/```/g, '')
   .trim();

return JSON.parse(cleaned);

}

module.exports = generateTasksWithAI;