import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import functions from "../../src/functions";
import { useToken } from "../../src/token";

export default function DashBotSettings({ user, id }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [botSecret, setBotSecret] = useState("");
    const [botToken, setBotToken] = useState("");
    const [botName, setBotName] = useState("");

    const bot = user.bots.find((bot: any) => bot.clientId === id);

    useEffect(() => {
        if (bot) {
            setBotSecret(bot.botSecret);
            setBotToken(bot.botToken);
            setBotName(bot.name);
        }
    }, [bot]);

    if (!user.username) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        fetch(`/api/v1/settings/bot`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                newBotSecret: botSecret,
                newBotToken: botToken,
                newBotName: botName,

                botSecret: bot.botSecret,
                botToken: bot.botToken,
                botName: bot.name,
            })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    functions.ToastAlert(res.message, "error");
                }
                else {
                    functions.ToastAlert(res.message, "success");
                    router.push("/dashboard/custombots");
                    // setTimeout(() => router.push(`/dashboard/settings/${guildId}`), 1000);
                }
            })
            .catch(err => {
                functions.ToastAlert(err, "error");
            });

    }

    function handleChange(e: any) {
        switch (e.target.name) {
        case "botSecret":
            setBotSecret(e.target.value);
            break;
        case "botToken":
            setBotToken(e.target.value);
            break;
        case "botName":
            setBotName(e.target.value);
            break;
        default:
            break;
        }
    }



    return (
        <>
            <Toaster />
            <div className="sm:mr-28 sm:ml-32 sm:mt-12 ml-6 mr-8 mt-8 w-full">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white sm:text-4xl text-2xl font-bold leading-tight">
                        Change Bot Settings
                    </h1>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    {(Array.isArray(user.bots) && user.bots.find((bot: any) => bot.clientId === id)) ? (
                        <>
                            <h2 className="text-white text-3xl font-medium leading-tight mb-4">
                                {bot.name}
                            </h2>
                            
                            <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                <form method="POST" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="botName" className="block mb-2 text-sm font-medium text-gray-300">Bot Name</label>
                                        <div className="relative mb-6">
                                            <input onChange={handleChange} placeholder={bot.name} name="botName" type="text" id="botName" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
                                        </div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div>
                                            <label htmlFor="botSecret" className="block mb-2 text-sm font-medium text-gray-300">Client Secret</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} placeholder={`${bot.botSecret.substring(0, 15)}...`} name="botSecret" type="text" id="botSecret" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="botToken" className="block mb-2 text-sm font-medium text-gray-300">Bot Token</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} placeholder={`${bot.botToken.substring(0, 35)}...`} name="botToken" type="text" id="botToken" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="mt-4 transition-all relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Save
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                                You dont own this server.
                            </h2>
                        </>
                    )}
                            
                                          
                </div>
            </div>
        </>
    )
}
