import Head from "next/head";
import Button from "@mui/material/Button";
import { prisma } from "../src/db";

interface UserInfo {
    domain: string;
}

interface Server {
    name: string;
    guildId: string;
    clientId: string;
    description?: string;
    picture?: string;
}

export default function Verify({ info, servers, err }: { info: UserInfo, servers: Server[], err: string }) {
    const hostname = (info.domain.match(/(?:[^.]+\.)?([^.\s]+)\.[^.]+$/) || [])[1] || info.domain;
    const domain = (info.domain.match(/(?:[^.]+\.)?([^.]+\.[^.]+)$/) || [])[1] || info.domain;

    return (
        <>
            <Head>
                <meta name="description" content={`Join ${hostname}`} />
                <meta property="og:description" content={`Join ${hostname}`} />
                <meta property="og:title" content={hostname ?? "Profile"} />
                <meta property="og:url" content={`https://${info.domain ?? "restorecord.com"}`} />
                {/* <meta property="og:image" content={info.avatar} /> */}
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="" />
                <meta name="msapplication-navbutton-color" content="" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <title>{`Join ${hostname}`}</title>
            </Head>

            <div style={{ 
                backgroundColor: "#0a0a0a",
                color: "#fafafa",
                width: "100vw",
                height: "100vh",
            }}>
                {/* div with flex max-w-4xl, bg sligtly darker than 0a0a0a */}
                <header style={{
                    maxWidth: "56rem",
                    margin: "auto",
                    padding: "1rem",
                    backgroundColor: "#0f0f0f",
                    borderBottomLeftRadius: "1rem",
                    borderBottomRightRadius: "1rem",
                    border: "1px solid #262626",
                }}>
                    {/* 2 grid, justify-between, "Name", "x servers" */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <h1 style={{
                            fontWeight: "800",
                            textAlign: "left",
                            marginTop: 0,
                            marginBottom: 0,
                        }}>
                            {domain}
                        </h1>

                        {info.domain && (
                            <p style={{
                                textAlign: "right",
                                marginTop: 0,
                                marginBottom: 0,
                            }}>
                                {servers.length} {servers.length === 1 ? "server" : "servers"}
                            </p>
                        )}
                    </div>
                </header>

                <main style={{
                    maxWidth: "56rem",
                    margin: "auto",
                    padding: "1rem",
                }}>
                    {/* if error, show error */}
                    {err && (
                        <div style={{
                            backgroundColor: "#d32f2f",
                            color: "#fafafa",
                            borderRadius: "0.5rem",
                            padding: "1rem",
                        }}>
                            <p style={{
                                fontWeight: "800",
                                textAlign: "left",
                                marginTop: 0,
                                marginBottom: 0,
                            }}>
                                An error has occurred
                            </p>

                            <p style={{
                                textAlign: "left",
                                marginTop: 0,
                                marginBottom: 0,
                            }}>
                                {err}
                            </p>
                        </div>
                    )}

                    {/* if no servers, show no servers */}
                    {!err && servers.length === 0 && (
                        <div style={{
                            backgroundColor: "#d32f2f",
                            color: "#fafafa",
                            borderRadius: "0.5rem",
                            padding: "1rem",
                        }}>
                            <p style={{
                                fontWeight: "800",
                                textAlign: "left",
                                marginTop: 0,
                                marginBottom: 0,
                            }}>
                                No servers found
                            </p>

                            <p style={{
                                textAlign: "left",
                                marginTop: 0,
                                marginBottom: 0,
                            }}>
                                Sorry, we couldn&apos;t find any servers for this domain.
                            </p>
                        </div>
                    )}

                    {/* if servers, show servers */}
                    {!err && servers.length > 0 && servers.map((server) => (
                        <div key={server.guildId} style={{
                            backgroundColor: "#0f0f0f",
                            color: "#fafafa",
                            borderRadius: "0.5rem",
                            padding: "1rem",
                            marginBottom: "1rem",
                            // border: "1px solid #262626",
                        }}>
                            {/* 2 grid, justify-between, "Name", "x servers" */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "auto 1fr",
                                    gridGap: "1rem",
                                    alignItems: "center",
                                }}>
                                    <img src={server.picture} alt={server.name} style={{ width: "3rem", height: "3rem", borderRadius: "100%" }} />

                                    <h2 style={{
                                        fontWeight: "800",
                                        textAlign: "left",
                                        marginTop: 0,
                                        marginBottom: 0,
                                    }}>
                                        {server.name}
                                    </h2>
                                </div>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "auto 1fr",
                                    gridGap: "1rem",
                                    alignItems: "center",
                                    justifySelf: "end",
                                }}>
                                    <Button href={`https://discord.com/api/oauth2/authorize?client_id=${server.clientId}&redirect_uri=https://${server.domain}/api/callback&response_type=code&scope=identify+guilds.join&state=${server.guildId}&prompt=none`} rel="noopener noreferrer" sx={{
                                        border: "1px solid #262626",
                                        outline: "none",
                                        backgroundColor: "#171717",
                                        color: "#fafafa",
                                        borderRadius: "0.5rem",
                                        padding: "0.5rem 1rem",
                                        textDecoration: "none",
                                        textAlign: "center",
                                        marginTop: 0,
                                        marginBottom: 0,
                                        "&:hover": {
                                            backgroundColor: "#1a1a1a",
                                            border: "1px solid #262626",
                                            color: "#fafafa",
                                        },
                                    }}>
                                        Join
                                    </Button>

                                </div>
                            </div>
                        </div>
                    ))}
                </main>
                                    
            </div>
        </>
    )
}


export async function getServerSideProps({ req }: any) {
    if (req) {
        const domain = req.headers.host ?? "restorecord.com";
        let info: UserInfo = { domain: domain };
        let servers: Server[] = [];
        let err = "";

        const customBot = await prisma.customBots.findMany({
            select: {
                id: true,
                clientId: true,
                customDomain: true
            },
            where: {
                customDomain: domain
            } 
        });
        if (customBot.length === 0) return { props: { info: {}, servers: [], err: "" } }
        if (customBot.length > 10) return { props: { info: {}, servers: [], err: "Too many different custom bots found using this domain. Contact Owner" } }

        const userServers = await prisma.servers.findMany({
            select: {
                name: true,
                guildId: true,
                description: true,
                picture: true,
                locked: true,
                ownerId: true,
                customBotId: true,
                owner: {
                    select: {
                        username: true
                    }
                }
            },
            where: { 
                customBotId: { 
                    in: customBot.map((bot) => bot.id) 
                } 
            } 
        });
        // if (userServers.length === 0) return { props: { info: {}, servers: [], err: "No servers found" } }

        // userServers.every((server) => server.ownerId === userServers[0].ownerId) ? info = { username: userServers[0].owner.username } : info = { username: "Multiple Users" };

        servers = userServers.filter((server) => server.locked === false).map((server) => {
            return {
                name: server.name,
                guildId: server.guildId.toString(),
                clientId: customBot.find((bot) => bot.id === server.customBotId)?.clientId.toString() ?? "",
                description: server.description,
                picture: server.picture ?? "https://cdn.restorecord.com/logo512.png",
            }
        });

        return { props: { info, servers, err } }


        // await prisma.servers.findUnique({
        //     where: {
        //         name: type === 0 ? decodeURIComponent(serverName) : undefined,
        //         guildId: type === 1 ? BigInt(serverName) as bigint : undefined
        //     }
        // }).then(async (res: any) => {
        //     if (res) {
        //         const customBot = await prisma.customBots.findUnique({ where: { id: res.customBotId }});
        //         const ownerAccount = await prisma.accounts.findUnique({ where: { id: res.ownerId } });
        //         if (!ownerAccount) return { props: { server: serverInfo, status: "error", err: "Owner account not found. Contact Owner", errStack: "" } }
        //         if (!customBot) return { props: { server: serverInfo, status: "error", err: "Custom bot not found. Contact Owner", errStack: "" } }

        //         serverInfo = {
        //             success: true,
        //             name: res.name,
        //             guildId: res.guildId.toString(),
        //             icon: res.picture ?? "https://cdn.restorecord.com/logo512.png",
        //             bg: res.bgImage ? res.bgImage : "",
        //             description: res.description,
        //             theme: res.theme,
        //             color: `#${res.themeColor}`,
        //             ipLogging: res.ipLogging,
        //             clientId: customBot?.clientId.toString(),
        //             domain: customBot?.customDomain ? `https://${customBot.customDomain}` : host,
        //             locked: res.locked
        //         }
        //     }
        // })

        // return { 
        //     props: {
        //         server: JSON.parse(JSON.stringify(serverInfo)),
        //         status: cookies.includes("verified=true") ? "finished" : "verifying",
        //         err: cookies.includes("RC_err") ? cookies.split("RC_err=")[1].split("RC_errStack")[0].trim() : "", 
        //         // find RC_errStack="..." from the RC_err cookie and then split it to get the value of RC_errStack
        //         errStack: cookies.includes("RC_errStack=\"") ? (cookies.split("RC_errStack=\"")[1].split("\"")[0] ?? "") : (cookies.includes("RC_errStack") ? cookies.split("RC_errStack=")[1].split(";")[0] : ""),
        //         captcha: cookies.includes("captcha=true") ? true : false,
        //     }
        // }
    }
}
