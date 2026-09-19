const { GoogleGenAI } = require("@google/genai");

async function test() {
  const ai = new GoogleGenAI({ 
    httpOptions: { 
      headers: { "Authorization": "Bearer AQ.AB8RN6IkhKPVFN2DajLmXv8FqdZHYsEjzlSGWsWE1Kb5obyDKg" } 
    } 
  });
  try {
    const res = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Hello"
    });
    console.log("Success:", res.text);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
