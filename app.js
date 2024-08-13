const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
//guardar los datos del chat en db.json
const MongoAdapter = require('@bot-whatsapp/database/mongo')
//const MockAdapter = require('@bot-whatsapp/database/json')
//const MockAdapter = require('@bot-whatsapp/database/mock')
const { delay } = require('@whiskeysockets/baileys')
// const { delay } = require('@whiskeysockets/baileys')
const path = require("path")
const fs = require("fs")
const chat = require('./gemini');

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf8")

const pathConsultas = path.join(__dirname, "mensajes", "prompt.txt")
const promptConsultas = fs.readFileSync(pathConsultas, "utf8")

const flowMenuRest = addKeyword(EVENTS.ACTION)
    .addAnswer('este es el menu:',{
        media:"https://swissotelsantacruz.com.bo/wp-content/uploads/2021/02/Menu-Elsa-Restaurante-2021.pdf"
    })

const flowReservas = addKeyword(EVENTS.ACTION)
    .addAnswer('para reservar atencion: www.reservas.com')


const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer('esta son las consultas')
    .addAnswer('cual es tu consulta?', {capture:true}, async(ctx, ctxFn)=>{
        // Importa dinámicamente el módulo GeminiAI
        const { default: GeminiAI } = await import('gemini-ai')
        // Configuración del cliente Gemini AI API Key
        const geminiClient = new GeminiAI(process.env.GEMINI_API_KEY)
        // Llamada a la API de Gemini AI con el prompt y el texto
      //  const response = await geminiClient.ask("como estas?");
        const prompt = promptConsultas
        const response1 = await geminiClient.ask(prompt)
        console.log(response1)
        const consulta = ctx.body
        const response = await geminiClient.ask(consulta)
        //ctx.body = entrada del usuario
        console.log(ctx.body)
        console.log(response)

        //ctxFn = enviar por mensaje la respuesta generada 
        await ctxFn.flowDynamic(response)
    })


const flowWelcome = addKeyword(EVENTS.WELCOME) 
    .addAnswer('Este es el flujo Welcome',{
        //whait to answer (n)seconds 7u7
        delay:100,
        //send media pics url :P
       media: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShz8drx56zX6zBi1AviE26-JJfoVBwvfheYsVQZlJiE_gx4B--J-0kxDl5rHQjY9PbgcA&usqp=CAU"
    },
    async(ctx, ctxFn)=>{
        if(ctx.body.includes("buu")){
        //console.log(ctx.body)//show the message on console
        await ctxFn.flowDynamic("escribiste buu")
    }else{
        await ctxFn.flowDynamic("escribiste: "+ ctx.body)
    }
    })

const flowBot = addKeyword("Bot")
.addAnswer('hola Joel cual es tu consulta? 🫡', {capture:true}, async(ctx, ctxFn)=>{
    // Importa dinámicamente el módulo GeminiAI
    const { default: GeminiAI } = await import('gemini-ai')
    // Configuración del cliente Gemini AI API Key
    const geminiClient = new GeminiAI(process.env.GEMINI_API_KEY)
    // Llamada a la API de Gemini AI con el prompt y el texto
  //  const response = await geminiClient.ask("como estas?");
    const response = await geminiClient.ask(ctx.body)
    console.log(ctx.body)
    console.log(response)
    await ctxFn.flowDynamic(response)
})

//const menu = "Este es el menu de opciones, elegi opciones 1,2,3,4,5 o 0"
const menuFlow = addKeyword("Menu")

.addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["1", "2", "3", "4", "5", "0"].includes(ctx.body)) {
            return fallBack(
                "Respuesta no válida, por favor selecciona una de las opciones."
            );
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowMenuRest);
            case "2":
                return gotoFlow(flowReservas);
            case "3":
                return gotoFlow(flowConsultas);
            case "0":
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menú escribiendo '*Menu*'"
                );
        }
    }
);

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName: "firstdb"

})
    const adapterFlow = createFlow([flowWelcome, menuFlow, flowMenuRest, flowReservas, flowConsultas, flowBot])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
