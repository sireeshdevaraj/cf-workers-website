import { ReqBody } from "./type";

export default {
	async fetch(request, env, ctx): Promise<Response> {
        // This process of allowing unauthenticated users is flawed itself.
        // For now, I am not adding any additional security.
        // LATER: add rate limiting and Ip-blocker.
        if (request.method === "POST" && request.headers.get("Referer") === "https://kuuhaku.space/"){
            const incomingDomain = request.headers.get("Origin")
            if (incomingDomain !== env.allow_cors_domains){
                return new Response(JSON.stringify({
                    status : 403,
                    message: "Failed"
                }),{
                    headers:{
                        "Access-Control-Allow-Origin" : env.allow_cors_domains
                    }
                })
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
    }),{
        headers:{
            "Access-Control-Allow-Origin" : env.allow_cors_domains
        }
    })
	},
} satisfies ExportedHandler<Env>;
