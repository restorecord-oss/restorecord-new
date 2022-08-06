import NavBar from "../components/landing/NavBar"
import { useEffect, useState, useRef } from "react"
import HCaptcha from "@hcaptcha/react-hcaptcha";
import functions from "../src/functions";
import { Toaster } from "react-hot-toast";
import styles from "../public/styles/register.module.css"
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [token, setToken]: any = useState();
    const captchaRef: any = useRef();
    const router = useRouter();



    const onExpire = () => {
        functions.ToastAlert("Captcha expired", "error");
    }

    const onError = (err: any) => {
        functions.ToastAlert(err, "error");
    }

    const onSubmit = (e: any) => {
        e.preventDefault();
        captchaRef.current.execute();
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        switch (name) {
        case "username":
            setUsername(value);
            break;
        case "email":
            setEmail(value);
            break;
        case "password":
            setPassword(value);
            break;
        default:
            break;
        }
    }

    useEffect(() => {
        if (token) {
            fetch(`/api/v1/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    captcha: token
                })
            })
                .then(res => res.json())
                .then(res => {
                    setToken(null);
                    if (res.success) {
                        functions.ToastAlert("Account created", "success");
                        router.push("/login?username=" + encodeURIComponent(username));
                    } 
                    else {
                        functions.ToastAlert(res.message, "error");
                    }
                });
        }
    }, [token, email, username, password, router]);

    return (
        <>
            <Head>
                <title>RestoreCord | Register</title>
                <meta name="description" content="Create an account for RestoreCord, the Best option to Backup and Restore your Discord Servers Settings, Channels, Roles, etc." />
            </Head>

            <NavBar />
            <Toaster />
            <div className={styles.mainWrapper}>
                <div className={styles.registerWrapper}>
                    <div className={styles.header}>
                        <h1>Register an Account</h1>
                    </div>
                    <form className={styles.formWrapper} onSubmit={onSubmit}>
                        <div className={styles.form}>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">Username</label>
                                <div className="relative mb-6">
                                    <input name="username" onChange={handleChange} type="text" id="username" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="User" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                                <div className="relative mb-6">
                                    <input name="email" onChange={handleChange} type="email" id="email" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="johndoe@gmail.com" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <input name="password" onChange={handleChange} type="password" id="password" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••••" />
                                </div>
                            </div>

                            {/* <div className={styles.inputWrapper}>
                                <label htmlFor="username" className="sr-only">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    placeholder="Username"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label htmlFor="email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email-address"
                                    required
                                    placeholder="Email address"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="password"
                                    required
                                    placeholder="Password"
                                    onChange={handleChange}
                                />
                            </div> */}

                            <div>
                                <HCaptcha
                                    sitekey="748ea2c2-9a8d-4791-b951-af4c52dc1f0f"
                                    size="invisible"
                                    onVerify={setToken}
                                    onError={onError}
                                    onExpire={onExpire}
                                    ref={captchaRef}
                                />
                            </div>
                            
                            <div className={styles.formTextWrapper}>
                                <a className={styles.formText}>
                                    Already have an account? <Link href="/login"><span>Login</span></Link>.
                                    <br/>
                                    By clicking Register, you agree to our <Link href="/terms"><span>Terms</span></Link> and <Link href="/privacy"><span>Privacy Policy</span></Link>.
                                </a>
                            </div>
                        </div>

                        <div>
                            <button type="submit" className={styles.formButton}>
                                Register
                            </button>
                        </div>  
                    </form>
                </div>
            </div>
        </>
    )
}
