import { accounts, backups, customBots, servers } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { compare, hash } from "bcrypt";
import * as speakeasy from "speakeasy";
import axios from "axios";
import { prisma } from "../../../../src/db";
import Email from "../../../../src/email";
import { getBrowser, getIPAddress, getPlatform, getXTrack } from "../../../../src/getIPAddress";
import { generateQRUrl } from "../../../../src/functions";
import withAuthentication from "../../../../src/withAuthentication";


async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    switch (req.method) {
    case "GET":
        try {
            const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
            const backups = await prisma.backups.findMany({ where: { guildId: { in: servers.map(s => s.guildId) } } });
            const customBots = await prisma.customBots.findMany({ where: { ownerId: user.id } });

            if (!user) return res.status(400).json({ success: false, message: "No account found." });

            const allBackups = backups.map(async(backup: backups) => {
                const channelCount = await prisma.channels.count({ where: { backupId: backup.backupId } });
                const roleCount = await prisma.roles.count({ where: { backupId: backup.backupId } });
                const guildMemberCount = await prisma.guildMembers.count({ where: { backupId: backup.backupId } });

                return {
                    id: backup.id,
                    name: backup.serverName,
                    backupId: backup.backupId,
                    guildId: backup.guildId.toString(),
                    channels: channelCount,
                    roles: roleCount,
                    guildMembers: guildMemberCount,
                    createdAt: backup.createdAt
                }
            })

            const response = {
                success: true,
                id: user.id,
                username: user.username,
                role: user.role,
                icon: user.pfp,
                ...(user.admin === true && { admin: true }),
                createdAt: user.createdAt,
                expiry: user.expiry,
                tfa: user.twoFactor,
                servers: servers.map((server: servers) => ({
                    id: server.id,
                    name: server.name,
                    guildId: server.guildId.toString(),
                    roleId: server.roleId.toString(),
                    picture: server.picture,
                    description: server.description,
                    webhook: server.webhook,
                    ipLogging: server.ipLogging,
                    bgImage: server.bgImage,
                    themeColor: server.themeColor,
                    vpncheck: server.vpncheck,
                    createdAt: server.createdAt,
                    customBotId: server.customBotId,
                    pullTimeout: server.pullTimeout,
                    pulling: server.pulling,
                })),
                backups: await Promise.all(allBackups),
                bots: customBots.map((bot: customBots) => ({
                    id: bot.id,
                    name: bot.name,
                    clientId: bot.clientId.toString(),
                    botToken: bot.botToken,
                    publicKey: bot.publicKey,
                    botSecret: bot.botSecret,
                    customDomain: bot.customDomain ? bot.customDomain : null,
                })),
            };

            return res.status(200).json(response);
        }
        catch (err: any) {
            console.error(err);
            return res.status(400).json({ success: false, message: "Something went wrong" });
        }
        break;
    case "POST":
        try {
            const { password, newPassword, newPassword2, confirmCode } = req.body;

            if (!password || !newPassword || !newPassword2) return res.status(400).json({ success: false, message: "Missing fields." });

            if (newPassword !== newPassword2) return res.status(400).json({ success: false, message: "Passwords do not match." });

            if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
            if (newPassword.length > 32) return res.status(400).json({ success: false, message: "Password must be less than 32 characters." });

            if (!await compare(password, user.password)) return res.status(400).json({ success: false, message: "Incorrect password." });

            if (password === newPassword) return res.status(400).json({ success: false, message: "New password cannot be the same as the old password." });

            const lEmail = await prisma.emails.findFirst({
                where: {
                    accountId: user.id,
                    title: "Password Change",
                    createdAt: {
                        gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
                    },
                    used: true,
                }
            });

            if (lEmail) return res.status(400).json({ success: false, message: "You can change your password every 24 hours, contact support if you need it to be changed right now." });

            const newHash = await hash(newPassword, 10);

            if (!confirmCode) {
                const code = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

                await prisma.emails.create({
                    data: {
                        accountId: user.id,
                        title: "Password Change",
                        code: code,
                        expires: new Date(Date.now() + 30 * 60 * 1000)
                    }
                });

                await Email.send({
                    to: user.email,
                    from: {
                        email: "no-reply@restorecord.com",
                        name: "RestoreCord"
                    },
                    subject: "Password Change Confirmation",
                    html:
                        `
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <title>RestoreCord</title>
                            </head>
                            <body>
                            	<h1 style="text-align: center; margin-top: 1.5rem; line-height: 2rem; font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; color: rgb(79, 70, 229);">
                            		RestoreCord
                            	</h1>
                            	<div style="padding: 1rem; max-width: 30rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                    <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                        Password Change Confirmation
                            		</h2>
                            		<div>
                                           <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                            				Hello ${user.username},
                                            To confirm that you want to change your password, please enter the following code into the RestoreCord website (The code will expire in 30 minutes):
                                            <br />
                                            <b>${code}</b>
                                            <br />
                                            <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                            				<b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                            				If this was not you, you can safely ignore this email.
                                            If you have any questions, please contact us at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                                            <br />
                                            Sincerely,
                                            RestoreCord
                            			</p>
                            		</div>
                                    <div style="text-align: center; margin-top: 1rem;">
                                        <em style="color: rb(190, 198, 213)">
                                            Copyright © 2023 RestoreCord. All rights reserved.
                                        </em>
                                    </div>
                            	</div>
                            </body>
                        </html>
                        `,
                }).then(() => {
                    console.log(`[EMAIL] [${new Date().toLocaleString()}] Confirmation code sent to ${user.email}.`);
                    return res.status(200).json({ success: true, message: "Confirmation code sent." });
                }).catch((err: any) => {
                    console.error(err);
                })
            } else {

                const email = await prisma.emails.findFirst({
                    where: {
                        accountId: user.id,
                        code: confirmCode,
                    },
                });

                if (!email || email.expires < new Date()) return res.status(400).json({ success: false, message: "Invalid confirmation code." });

                if (email.used) return res.status(400).json({ success: false, message: "Confirmation code already used." });

                await prisma.emails.update({
                    where: {
                        id: email.id
                    },
                    data: {
                        expires: new Date(Date.now() - 1),
                        used: true
                    }
                });
                    
                await axios.get(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`).then(async (res) => {
                    await Email.send({
                        to: user.email,
                        from: {
                            email: "no-reply@restorecord.com",
                            name: "RestoreCord"
                        },
                        subject: "RestoreCord Password Changed",
                        html:
                            `
                                <!DOCTYPE html>
                                <html>
                                	<head>
                                		<title>RestoreCord</title>
                                	</head>
                                	<body>
                                		<h1 style="text-align: center; margin-top: 1.5rem; line-height: 2rem; font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; color: rgb(79, 70, 229);">
                                			RestoreCord
                                		</h1>
                                		<div style="padding: 1rem; max-width: 30rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                            <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                				Your password has been changed
                                			</h2>
                                			<div>
                                                <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                					Hello ${user.username},
                                					You password has been changed on ${new Date().toLocaleString()} (local time).
                                                    <br />
                                					<b style="font-weight: 600">Location:</b> Near ${res.data.city}, ${res.data.region}, ${res.data.country}
                                                    <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                                					<b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                                					If this was not you, contact us immediately at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a> or <a style="color: rgb(56,189, 248);" href="https://t.me/restorecord">RestoreCord Telegram</a>.
                                                    If you have any questions, please contact us at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                                                    <br />
                                                    Sincerely,
                                                    RestoreCord
                                				</p>
                                			</div>
                                            <div style="text-align: center; margin-top: 1rem;">
                                                <em style="color: rb(190, 198, 213)">
                                                    Copyright © 2023 RestoreCord. All rights reserved.
                                                </em>
                                            </div>
                                		</div>
                                	</body>
                                </html>
                            `,
                    }).then(() => {
                        console.log(`[EMAIL] [${new Date().toLocaleString()}] Password changed for ${user.username} (${user.email})`);
                    }).catch((err: any) => {
                        console.error(err);
                    })
                });

                await prisma.accounts.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        password: newHash
                    }
                });

                await prisma.sessions.deleteMany({
                    where: {
                        accountId: user.id
                    }
                });

                return res.status(200).json({ success: true, message: "Password changed, you will be logged out." });
            }
        }
        catch (err: any) {
            console.error(err);
            return res.status(400).json({ success: false, message: "Something went wrong" });
        }
        break;
    case "PATCH":
        try {
            const xTrack = getXTrack(req);
            if (!xTrack) return res.status(400).json({ success: false, message: "Invalid Request" });
            if (!user) return res.status(400).json({ success: false, message: "Account not found." });

            const { username, password, code } = req.body;

            if (typeof password !== "string") return res.status(400).json({ success: false, message: "Missing password." });
            if (!await compare(password, user.password)) return res.status(400).json({ success: false, message: "Password does not match" });

            if (username && password && !code) {
                // change username
                if (username.length < 3 || username.length > 20) return res.status(400).json({ success: false, message: "Username must be between 3 and 20 characters." });
                if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ success: false, message: "Username can only contain letters, numbers, and underscores." });

                const userExists = await prisma.accounts.findFirst({
                    where: {
                        username: username
                    }
                });

                if (userExists) return res.status(400).json({ success: false, message: "Username is already taken." });

                await prisma.accounts.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        username: username
                    }
                });

                return res.status(200).json({ success: true, message: "Username changed.", username: username });
            } else if (!code && !username && password) {
                if (user.googleAuthCode) {
                    const qrcodeUrl = generateQRUrl(user.googleAuthCode, user.username);
                    return res.status(200).json({ success: true, message: "2FA Requested", secret: user.googleAuthCode, url: qrcodeUrl });
                } else {
                    const secret = speakeasy.generateSecret({
                        issuer: "RestoreCord",
                        name: user.username,
                        length: 64,
                    });
                    
                    const qrcodeUrl = generateQRUrl(secret.base32, user.username);

                    await prisma.accounts.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            googleAuthCode: secret.base32
                        }
                    });

                    return res.status(200).json({ success: true, message: "2FA Requested", secret: secret.base32, url: qrcodeUrl });
                }
            } else if (code && !username && password && user.googleAuthCode && !user.twoFactor) {
                const verified = speakeasy.totp.verify({
                    secret: user.googleAuthCode,
                    encoding: "base32",
                    token: code,
                });

                if (!verified) return res.status(400).json({ success: false, message: "Invalid 2FA code." });

                await axios.get(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`).then(async (res) => {
                    await Email.send({
                        to: user.email,
                        from: {
                            email: "no-reply@restorecord.com",
                            name: "RestoreCord"
                        },
                        subject: "RestoreCord Two-Factor Authentication Enabled",
                        html:
                            `
                                <!DOCTYPE html>
                                <html>
                                	<head>
                                		<title>RestoreCord</title>
                                	</head>
                                	<body>
                                		<h1 style="text-align: center; margin-top: 1.5rem; line-height: 2rem; font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; color: rgb(79, 70, 229);">
                                			RestoreCord
                                		</h1>
                                		<div style="padding: 1rem; max-width: 30rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                            <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                				Two-Factor Authentication enabled
                                			</h2>
                                			<div>
                                                <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                					Hello ${user.username},
                                                    Two-Factor Authentication has been enabled on your account on ${new Date().toLocaleString()} (local time).
                                                    <br />
                                					<b style="font-weight: 600">Location:</b> Near ${res.data.city}, ${res.data.region}, ${res.data.country}
                                                    <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                                					<b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                                					If this was not you, contact us immediately at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a> or <a style="color: rgb(56,189, 248);" href="https://t.me/restorecord">RestoreCord Telegram</a>.
                                                    If you have any questions, please contact us at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                                                    <br />
                                                    Sincerely,
                                                    RestoreCord
                                				</p>
                                			</div>
                                            <div style="text-align: center; margin-top: 1rem;">
                                                <em style="color: rb(190, 198, 213)">
                                                    Copyright © 2023 RestoreCord. All rights reserved.
                                                </em>
                                            </div>
                                		</div>
                                	</body>
                                </html>
                            `,
                    }).then(() => {
                        console.log(`[EMAIL] [${new Date().toLocaleString()}] Sent 2FA enabled email to ${user.email}`);
                    }).catch((err: any) => {
                        console.error(err);
                    })
                });

                await prisma.accounts.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        twoFactor: Number(1) as number
                    }
                });
                    
                await prisma.logs.create({
                    data: {
                        type: 5,
                        username: `${user.username} (${user.id})`,
                        ipAddr: getIPAddress(req),
                        device: JSON.stringify(xTrack)
                    }
                });
                    
                await prisma.sessions.deleteMany({
                    where: {
                        accountId: user.id
                    }
                });

                return res.status(200).json({ success: true, message: "2FA Successfully Enabled" });
            } else if (code && !username && password && user.googleAuthCode && user.twoFactor) {
                const verified = speakeasy.totp.verify({
                    secret: user.googleAuthCode,
                    encoding: "base32",
                    token: code,
                });

                if (!verified) return res.status(400).json({ success: false, message: "Invalid 2FA code." });

                await axios.get(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`).then(async (res) => {
                    await Email.send({
                        to: user.email,
                        from: {
                            email: "no-reply@restorecord.com",
                            name: "RestoreCord"
                        },
                        subject: "RestoreCord Two-Factor Authentication Disabled",
                        html:
                            `
                            <!DOCTYPE html>
                            <html>
                                <head>
                                    <title>RestoreCord</title>
                                </head>
                                <body>
                                    <h1 style="text-align: center; margin-top: 1.5rem; line-height: 2rem; font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; color: rgb(79, 70, 229);">
                                        RestoreCord
                                    </h1>
                                    <div style="padding: 1rem; max-width: 30rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                        <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                            Two-Factor Authentication enabled
                                        </h2>
                                        <div>
                                            <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                                Hello ${user.username},
                                                Two-Factor Authentication has been enabled on your account on ${new Date().toLocaleString()} (local time).
                                                <br />
                                                <b style="font-weight: 600">Location:</b> Near ${res.data.city}, ${res.data.region}, ${res.data.country}
                                                <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                                                <b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                                                If this was not you, contact us immediately at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a> or <a style="color: rgb(56,189, 248);" href="https://t.me/restorecord">RestoreCord Telegram</a>.
                                                If you have any questions, please contact us at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                                                <br />
                                                Sincerely,
                                                RestoreCord
                                            </p>
                                        </div>
                                        <div style="text-align: center; margin-top: 1rem;">
                                            <em style="color: rb(190, 198, 213)">
                                                Copyright © 2023 RestoreCord. All rights reserved.
                                            </em>
                                        </div>
                                    </div>
                                </body>
                            </html>
                            `,
                    }).then(() => {
                        console.log(`[EMAIL] [${new Date().toLocaleString()}] Sent 2FA disabled email to ${user.email}`);
                    }).catch((err: any) => {
                        console.error(err);
                    })
                });

                await prisma.accounts.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        twoFactor: Number(0) as number
                    }
                });

                await prisma.logs.create({
                    data: {
                        type: 6,
                        username: `${user.username} (${user.id})`,
                        ipAddr: getIPAddress(req),
                        device: JSON.stringify(xTrack)
                    }
                });

                return res.status(200).json({ success: true, message: "2FA Successfully Disabled" });
            }
        }
        catch (err: any) {
            console.error(err);
            return res.status(400).json({ success: false, message: "Something went wrong" });
        }
        break;
    default:
        res.setHeader("Allow", "GET");
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
    }
}


export default withAuthentication(handler);