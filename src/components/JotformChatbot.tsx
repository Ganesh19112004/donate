import { useEffect } from "react";

const JotformChatbot = () => {
  useEffect(() => {
    // Prevent duplicate loading
    if (document.getElementById("jotform-agent")) return;

    const script = document.createElement("script");
    script.id = "jotform-agent";
    script.src =
      "https://cdn.jotfor.ms/agent/embedjs/019c0f4b1c4a7d0a802b4e12cab2391737d7/embed.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Optional cleanup (usually you can keep it)
      // document.body.removeChild(script);
    };
  }, []);

  return null; // no UI, Jotform injects its own widget
};

export default JotformChatbot;
