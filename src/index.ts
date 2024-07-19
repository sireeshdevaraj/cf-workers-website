import { ReqBody } from "./type";

export default {
	async fetch(request, env, ctx): Promise<Response> {
        if (request.method === "POST"){
            const incomingDomain = request.headers.get("Host")
            if (incomingDomain !== env.allow_cors_domains){
                return new Response(JSON.stringify({
                    status : 403,
                    message: "Failed"
                }))
            }
            let response = new Response(JSON.stringify({
                status : 200,
                message: "Success"
            }));
            response.headers.set("Access-Control-Allow-Origin",env.allow_cors_domains);
            const reqBody : ReqBody = await request.json() 
            const discordBody = {
                // we will still handle the case to not allow users to send empty messages. this is just for a little bit of safety.
                // slice this to 2000 characters only
                content : reqBody?.message.slice(0,2000) || "Someone viewed your profile" // meaning someone did not fill out the survey.But I still need the analytics ;)
            }

            await fetch(env.discord_webhook_url,{
                method : "POST",
                body : JSON.stringify(discordBody),
                headers :{
                    "Content-Type":"application/json"
                },
            })
            return response
    }
    return new Response(JSON.stringify({
        status : 400,
        message : `${request.method}: Method does not exist`
    }))
	},
} satisfies ExportedHandler<Env>;
