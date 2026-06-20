import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

type MessageRole = "bot" | "user";
interface Message {
  id: number;
  role: MessageRole;
  text: string;
  links?: { label: string; href: string }[];
  suggestions?: string[];
}

/* ─── Knowledge base ─────────────────────────────────────── */
interface KB {
  patterns: string[];
  answer: string;
  links?: { label: string; href: string }[];
  suggestions?: string[];
}

const KB: KB[] = [
  {
    patterns: ["compar", "side by side", "versus", " vs ", "difference between", "which is better"],
    answer:
      "Great question! Here's how to compare two salons:\n\n1️⃣ Browse salons on the Explore page\n2️⃣ Click **Compare** on any salon card (up to 2)\n3️⃣ A bar appears at the bottom — click **Compare Now**\n4️⃣ See a side-by-side table of ratings, prices, hours, services & location\n\nThis makes it easy to pick the perfect salon for you! 💡",
    links: [{ label: "Browse salons to compare", href: "/salons" }],
    suggestions: ["How do I book?", "What areas are covered?", "How to read reviews?"],
  },
  {
    patterns: ["book", "appointment", "schedule", "reserv", "slot"],
    answer:
      "Booking is super simple:\n\n1️⃣ Find a salon you like (search or browse)\n2️⃣ Open its detail page\n3️⃣ Click **Book Now**\n4️⃣ Choose your service, date & time\n5️⃣ Confirm — done! ✅\n\nYou'll need a free account to book. Your appointments show up under **My Bookings**.",
    links: [
      { label: "Explore salons", href: "/salons" },
      { label: "My Bookings", href: "/bookings" },
    ],
    suggestions: ["How to cancel?", "Do I need an account?", "Compare salons"],
  },
  {
    patterns: ["cancel", "reschedul", "change booking", "modify"],
    answer:
      "To cancel or manage a booking:\n\n1️⃣ Go to **My Bookings**\n2️⃣ Find your appointment\n3️⃣ Click **Cancel** (available before the appointment time)\n\nWe recommend cancelling at least a few hours in advance out of courtesy to the salon. 🙏",
    links: [{ label: "View My Bookings", href: "/bookings" }],
    suggestions: ["How to rebook?", "How do I book?", "Contact salon"],
  },
  {
    patterns: ["review", "rating", "star", "feedback", "testimonial"],
    answer:
      "Reviews help the whole community! Here's how they work:\n\n⭐ Every salon shows an average star rating (1–5)\n📝 Verified customers who visited can leave reviews\n✅ Reviews are checked to keep them genuine\n\nTo leave a review, visit the salon's detail page after your appointment. Honest feedback helps others choose wisely!",
    links: [{ label: "Browse rated salons", href: "/salons" }],
    suggestions: ["How to book?", "Compare salons", "Best rated salons"],
  },
  {
    patterns: ["price", "cost", "₹", "cheap", "expensive", "budget", "afford", "starting"],
    answer:
      "Prices vary by salon and service. Each salon card shows a **Starting Price** so you know what to expect:\n\n💰 **₹** → Budget (From ₹199)\n💰💰 **₹₹** → Mid-range (From ₹499)\n💰💰💰 **₹₹₹** → Premium (From ₹999)\n💰💰💰💰 **₹₹₹₹** → Luxury (From ₹1,999)\n\nUse the **Explore** page filters to find salons in your budget!",
    links: [{ label: "Filter by price", href: "/salons" }],
    suggestions: ["Compare prices", "Budget salons", "How to book?"],
  },
  {
    patterns: ["area", "location", "banjara", "jubilee", "madhapur", "gachibowli", "hitech", "near", "neighbourhood", "neighborhood"],
    answer:
      "GlamSpot covers the top neighbourhoods in Hyderabad:\n\n📍 Banjara Hills\n📍 Jubilee Hills\n📍 Madhapur\n📍 Gachibowli\n📍 Hitech City\n📍 Kondapur\n📍 Ameerpet\n📍 Kukatpally\n\nUse the **Area** filter on the Explore page to find salons in your locality!",
    links: [{ label: "Search by area", href: "/salons" }],
    suggestions: ["Filter by category", "How to book?", "Compare salons"],
  },
  {
    patterns: ["service", "hair", "nail", "spa", "massage", "facial", "bridal", "makeup", "skincare", "wax", "thread"],
    answer:
      "GlamSpot salons offer a wide range of beauty services:\n\n✂️ **Hair Styling** — cuts, colour, blowouts\n💅 **Nail Art** — manicure, pedicure, nail extensions\n🧖 **Spa & Massage** — relaxation, body treatments\n💄 **Bridal Makeup** — full bridal packages\n✨ **Facial & Skincare** — glow treatments, cleanup\n🪡 **Waxing & Threading** — quick grooming\n\nBrowse by category to find specialists!",
    links: [{ label: "Browse by service", href: "/categories" }],
    suggestions: ["Book a service", "Find bridal salons", "Spa salons"],
  },
  {
    patterns: ["account", "register", "sign up", "login", "log in", "profile", "create"],
    answer:
      "Creating a free account takes 30 seconds:\n\n1️⃣ Click **Sign Up** in the top-right\n2️⃣ Enter your name, email & password\n3️⃣ Done — you're in! 🎉\n\nWith an account you can:\n✅ Book appointments\n✅ Track your bookings\n✅ Leave reviews\n✅ Save favourite salons",
    links: [
      { label: "Create account", href: "/register" },
      { label: "Login", href: "/login" },
    ],
    suggestions: ["How to book?", "What can I do?", "Is it free?"],
  },
  {
    patterns: ["free", "charge", "fee", "pay", "payment", "cost to join"],
    answer:
      "**GlamSpot is completely free for customers!** 🎉\n\nThere's no charge to:\n✅ Create an account\n✅ Browse & compare salons\n✅ Read reviews\n✅ Book appointments\n\nYou only pay the salon directly for the services you receive.",
    suggestions: ["How to book?", "Sign up free", "Compare salons"],
  },
  {
    patterns: ["search", "find", "filter", "sort", "discover"],
    answer:
      "Finding the right salon is easy with our filters:\n\n🔍 **Keyword search** — salon name, service, or area\n📍 **Area filter** — pick your neighbourhood\n🏷️ **Category filter** — hair, nails, spa & more\n⭐ **Rating filter** — see only top-rated salons\n\nTip: Combine filters for the most precise results!",
    links: [{ label: "Search now", href: "/salons" }],
    suggestions: ["Filter by area", "Filter by service", "Compare results"],
  },
  {
    patterns: ["how does", "how do", "how can", "explain", "what is", "what are", "help", "guide", "start", "begin", "new"],
    answer:
      "Welcome to GlamSpot! Here's everything you can do:\n\n🔍 **Discover** — Browse & filter salons by area, service, rating\n⚖️ **Compare** — View two salons side by side\n📅 **Book** — Reserve appointments instantly\n⭐ **Reviews** — Read & leave honest feedback\n👤 **Account** — Track your bookings & profile\n\nWhat would you like to know more about?",
    links: [{ label: "Explore salons", href: "/salons" }],
    suggestions: ["How to compare?", "How to book?", "What services?"],
  },
  {
    patterns: ["bridal", "wedding", "bride"],
    answer:
      "Getting ready for your big day? 💍 GlamSpot has you covered!\n\nBridal packages typically include:\n💄 Full makeup & hair styling\n💅 Bridal manicure & pedicure\n🧖 Pre-wedding facial & skincare\n\nTip: Book bridal appointments **2–4 weeks in advance** as slots fill up fast. Filter by the **Bridal Makeup** category to find specialists!",
    links: [{ label: "Bridal salons", href: "/salons?category=Bridal" }],
    suggestions: ["Compare bridal salons", "How far in advance to book?", "Prices"],
  },
  {
    patterns: ["open", "hours", "timing", "time", "available", "weekend", "sunday"],
    answer:
      "Each salon card shows opening hours (e.g. 10:00 – 21:00) and an **Open/Closed** badge in real time.\n\nMost Hyderabad salons are open:\n🕙 10:00 AM – 9:00 PM on weekdays\n🕙 9:00 AM – 8:00 PM on weekends\n\nCheck the salon's detail page for exact timings and to book a specific slot!",
    suggestions: ["Book a slot", "Find open salons", "Weekend appointments"],
  },
];

const WELCOME: Message = {
  id: 0,
  role: "bot",
  text: "Hi! I'm **GlamBot** 👋 — your personal GlamSpot guide.\n\nI can help you with booking appointments, comparing salons, finding services, and much more.\n\nWhat would you like to know?",
  suggestions: ["How to compare salons?", "How do I book?", "What services are available?", "Which areas are covered?"],
};

/* ─── Pattern matching ───────────────────────────────────── */
function findResponse(input: string): Omit<Message, "id" | "role"> {
  const lower = input.toLowerCase();
  for (const kb of KB) {
    if (kb.patterns.some(p => lower.includes(p))) {
      return { text: kb.answer, links: kb.links, suggestions: kb.suggestions };
    }
  }
  return {
    text: "I'm not sure about that one! 🤔 Here are some things I can help with:",
    suggestions: ["How to compare salons?", "How do I book?", "What services are available?", "Prices & budget", "Which areas are covered?"],
  };
}

/* ─── Markdown-lite renderer ─────────────────────────────── */
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

/* ─── Component ──────────────────────────────────────────── */
export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = findResponse(text);
      setTyping(false);
      setMessages(m => [...m, { id: Date.now() + 1, role: "bot", ...reply }]);
    }, 600 + Math.random() * 400);
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300
          ${open ? "bg-foreground rotate-90" : "bg-[#C9A227] hover:bg-[#b8911f]"}`}
        aria-label="Open chat assistant"
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
      </button>

      {/* Unread dot */}
      {!open && (
        <span className="fixed bottom-[4.5rem] right-6 z-50 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
      )}

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[350px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`}
        style={{ maxHeight: "min(560px, calc(100dvh - 120px))" }}
      >
        {/* Header */}
        <div className="bg-foreground px-4 py-3.5 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#C9A227] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none mb-0.5">GlamBot</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <p className="text-white/60 text-xs">Your GlamSpot guide</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5
                ${msg.role === "bot" ? "bg-[#C9A227]" : "bg-foreground"}`}>
                {msg.role === "bot"
                  ? <Sparkles className="w-3.5 h-3.5 text-white" />
                  : <User className="w-3.5 h-3.5 text-white" />
                }
              </div>

              <div className={`flex flex-col gap-2 max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {/* Bubble */}
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                  ${msg.role === "bot"
                    ? "bg-[#F3F4F6] text-foreground rounded-tl-sm"
                    : "bg-foreground text-white rounded-tr-sm"
                  }`}>
                  {renderText(msg.text)}
                </div>

                {/* Links */}
                {msg.links && msg.links.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.links.map(l => (
                      <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8a6d14] bg-[#C9A227]/12 px-2.5 py-1 rounded-full hover:bg-[#C9A227]/25 transition-colors border border-[#C9A227]/20 cursor-pointer">
                          {l.label} <ChevronRight className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Suggestion chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs font-medium text-muted-foreground bg-white border border-border px-2.5 py-1 rounded-full hover:border-foreground/30 hover:text-foreground hover:bg-secondary transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#C9A227] shrink-0 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-[#F3F4F6] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border px-3 py-3 shrink-0">
          <form
            onSubmit={e => { e.preventDefault(); send(input); }}
            className="flex gap-2 items-center"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-border bg-[#F3F4F6] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]/50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-xl bg-foreground text-white flex items-center justify-center hover:bg-foreground/85 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-2">Powered by GlamSpot AI · Always here to help</p>
        </div>
      </div>
    </>
  );
}
