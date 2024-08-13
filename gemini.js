require('dotenv').config();
const chat = async (response) => {
    try {
        // Importa dinámicamente el módulo GeminiAI
        const { default: GeminiAI } = await import('gemini-ai');

        // Configuración del cliente Gemini AI con tu API Key
        const geminiClient = new GeminiAI(process.env.GEMINI_API_KEY);

        // Llamada a la API de Gemini AI con el prompt y el texto
     
        const response = await geminiClient.ask("Hi!");
        console.log(response);

    } catch (err) {
        console.error("Error al conectar con Gemini AI:", err);
        return "ERROR";
    }
};

module.exports = chat;

