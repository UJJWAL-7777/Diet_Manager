    import { useEffect } from "react";
    import { useLocation } from "react-router";
    import { useAuth } from "../context/AuthContext";

    export default function useChatbase() {
    const location = useLocation();
    const { user } = useAuth();  // now safe

    useEffect(() => {
        const path = location.pathname;

        const alwaysHide = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password"
        ];

        const shouldHide =
        alwaysHide.some(route => path.startsWith(route)) ||
        (!user && path === "/");

        if (shouldHide) {
        const existing = document.getElementById("chatbase-script");
        if (existing) existing.remove();
        return;
        }

        if (!document.getElementById("chatbase-script")) {
        const script = document.createElement("script");
        script.id = "chatbase-script";
        script.src = "https://www.chatbase.co/embed.min.js";
        script.setAttribute("chatbotId", "8QnySAXtvUT4piDEbXnKE");
        script.setAttribute("domain", "www.chatbase.co");
        document.body.appendChild(script);
        }
    }, [location, user]);
    }
