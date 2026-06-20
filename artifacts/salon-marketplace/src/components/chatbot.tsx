import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ChevronRight, Sparkles, ImagePlus, AlertCircle } from "lucide-react";
import { Link } from "wouter";

type MessageRole = "bot" | "user";
interface Message {
  id: number;
  role: MessageRole;
  text: string;
  imageUrl?: string;
  links?: { label: string; href: string }[];
  suggestions?: string[];
  isError?: boolean;
}

/* ─── Image color analysis ───────────────────────────────── */
interface ColorProfile {
  r: number; g: number; b: number;
  isWarm: boolean; isCool: boolean; isSkinTone: boolean;
  isBright: boolean; isDark: boolean; isNeutral: boolean;
}

function analyzeColors(file: File): Promise<ColorProfile | null> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, 64, 64);
        const { data } = ctx.getImageData(0, 0, 64, 64);
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 10) continue; // skip transparent
          r += data[i]; g += data[i + 1]; b += data[i + 2];
          count++;
        }
        URL.revokeObjectURL(url);
        if (!count) { resolve(null); return; }
        r /= count; g /= count; b /= count;
        const brightness = (r + g + b) / 3;
        const max = Math.max(r, g, b);
        const saturation = max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
        resolve({
          r, g, b,
          isWarm: r > g + 20 && r > b + 20,
          isCool: b > r + 15 || (g > r + 10 && b > r),
          isSkinTone: r > 150 && g > 100 && g < 200 && b < 160 && r > b + 20,
          isBright: brightness > 170 && saturation > 0.25,
          isDark: brightness < 80,
          isNeutral: saturation < 0.12 && brightness > 80 && brightness < 180,
        });
      } catch {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

interface PhotoSuggestion {
  title: string;
  text: string;
  links: { label: string; href: string }[];
  suggestions: string[];
}

function getPhotoSuggestion(profile: ColorProfile): PhotoSuggestion {
  if (profile.isSkinTone) {
    return {
      title: "✨ Looks like a face/skin photo!",
      text: "Based on your photo, these services would work great for you:\n\n💄 **Bridal Makeup** — full face prep & glamour looks\n🧖 **Facial & Skincare** — glow treatments, cleanup & hydration\n✂️ **Hair Styling** — frame your face with a fresh cut or colour\n\nWould you like to find salons offering these near you?",
      links: [
        { label: "Facials & Skincare", href: "/salons?category=Facial" },
        { label: "Bridal Makeup", href: "/salons?category=Bridal" },
      ],
      suggestions: ["Find skin care salons", "Best makeup salons", "How to book?"],
    };
  }
  if (profile.isWarm && !profile.isDark) {
    return {
      title: "🔥 Warm & vibrant tones detected!",
      text: "Your photo has warm, rich colours — great inspiration for:\n\n🎨 **Hair Colouring** — reds, coppers, golden balayage\n💅 **Nail Art** — warm amber, coral & terracotta shades\n💄 **Makeup** — warm-toned glam looks\n\nLet us find the best colour specialists for you!",
      links: [
        { label: "Hair Styling Salons", href: "/salons?category=Hair" },
        { label: "Nail Art Salons", href: "/salons?category=Nail Art" },
      ],
      suggestions: ["Hair colour salons", "Nail art ideas", "Compare salons"],
    };
  }
  if (profile.isBright) {
    return {
      title: "💅 Bold & bright — love the energy!",
      text: "This colourful, bright photo is giving nail art & bold beauty vibes:\n\n💅 **Nail Art** — holographic, neon, French tips & 3D designs\n💄 **Makeup Looks** — bold lips, colourful eyeshadow\n✨ **Spa Glow** — pre-event skincare for that lit-from-within look\n\nReady to book your glam session?",
      links: [
        { label: "Nail Art Salons", href: "/salons?category=Nail Art" },
        { label: "Spa & Massage", href: "/salons?category=Spa" },
      ],
      suggestions: ["Nail art designs", "Best nail salons", "How to book?"],
    };
  }
  if (profile.isDark) {
    return {
      title: "🖤 Moody & elegant tones!",
      text: "Dark, moody aesthetics pair beautifully with these services:\n\n🧖 **Spa & Massage** — deep relaxation & body treatments\n💇 **Hair Treatments** — deep conditioning, scalp therapy\n✨ **Keratin & Smoothing** — sleek, glossy finishes\n\nExplore top-rated spa & hair salons in Hyderabad!",
      links: [
        { label: "Spa Salons", href: "/salons?category=Spa" },
        { label: "Hair Salons", href: "/salons?category=Hair" },
      ],
      suggestions: ["Best spa salons", "Hair treatment salons", "Compare salons"],
    };
  }
  if (profile.isCool) {
    return {
      title: "❄️ Cool tones detected!",
      text: "Cool blue & green tones in your photo suggest:\n\n💅 **Nail Art** — icy blues, mint greens, pastel shades\n💆 **Spa & Relaxation** — calm, serene treatments\n🧴 **Skincare** — hydration & anti-aging facials\n\nFind salons that specialise in cool-toned beauty!",
      links: [
        { label: "Nail Art Salons", href: "/salons?category=Nail Art" },
        { label: "Spa & Skincare", href: "/salons?category=Spa" },
      ],
      suggestions: ["Pastel nail art", "Best spa salons", "Skincare salons"],
    };
  }
  if (profile.isNeutral) {
    return {
      title: "🤍 Clean & classic neutrals!",
      text: "Neutral tones are timeless — here's what suits this palette:\n\n💇 **Hair Styling** — natural, classic cuts & blow-outs\n🧖 **Facial Cleanup** — fresh, minimal & glowing skin\n💅 **Nude Nails** — elegant nudes, French manicure\n\nBrowse salons for a clean, polished look!",
      links: [
        { label: "Hair Styling", href: "/salons?category=Hair" },
        { label: "Facial Salons", href: "/salons?category=Facial" },
      ],
      suggestions: ["Natural hair salons", "Facial & cleanup", "Nude nail salons"],
    };
  }
  // Fallback for any image
  return {
    title: "📸 Photo received!",
    text: "Here are our most popular beauty services to explore:\n\n✂️ **Hair Styling** — cuts, colour, treatments\n💅 **Nail Art** — designs, extensions, pedicure\n🧖 **Spa & Massage** — full body relaxation\n💄 **Makeup** — everyday & bridal looks\n\nExplore top-rated salons in Hyderabad!",
    links: [{ label: "Browse all salons", href: "/salons" }],
    suggestions: ["How to book?", "Compare salons", "What services exist?"],
  };
}

/* ─── Knowledge base ─────────────────────────────────────── */
interface KBItem {
  patterns: string[];
  answer: string;
  links?: { label: string; href: string }[];
  suggestions?: string[];
}

const KB: KBItem[] = [
  {
    patterns: ["compar", "side by side", "versus", " vs ", "difference between", "which is better"],
    answer:
      "Here's how to compare two salons:\n\n1️⃣ Browse salons on the Explore page\n2️⃣ Click **Compare** on any salon card (up to 2)\n3️⃣ A bar appears at the bottom — click **Compare Now**\n4️⃣ See a side-by-side table of ratings, prices, hours, services & location\n\nThis makes it easy to pick the perfect salon! 💡",
    links: [{ label: "Browse salons to compare", href: "/salons" }],
    suggestions: ["How do I book?", "What areas are covered?", "How to read reviews?"],
  },
  {
    patterns: ["book", "appointment", "schedule", "reserv", "slot"],
    answer:
      "Booking is super simple:\n\n1️⃣ Find a salon you like\n2️⃣ Open its detail page\n3️⃣ Click **Book Now**\n4️⃣ Choose your service, date & time\n5️⃣ Confirm — done! ✅\n\nYou'll need a free account to book. Your appointments show up under **My Bookings**.",
    links: [
      { label: "Explore salons", href: "/salons" },
      { label: "My Bookings", href: "/bookings" },
    ],
    suggestions: ["How to cancel?", "Do I need an account?", "Compare salons"],
  },
  {
    patterns: ["cancel", "reschedul", "change booking", "modify"],
    answer:
      "To cancel or manage a booking:\n\n1️⃣ Go to **My Bookings**\n2️⃣ Find your appointment\n3️⃣ Click **Cancel**\n\nWe recommend cancelling a few hours in advance. 🙏",
    links: [{ label: "View My Bookings", href: "/bookings" }],
    suggestions: ["How to rebook?", "How do I book?"],
  },
  {
    patterns: ["review", "rating", "star", "feedback", "testimonial"],
    answer:
      "Reviews help the whole community!\n\n⭐ Every salon shows an average star rating\n📝 Verified customers can leave reviews\n✅ Reviews are checked to keep them genuine\n\nVisit the salon's detail page after your appointment to leave a review!",
    links: [{ label: "Browse rated salons", href: "/salons" }],
    suggestions: ["How to book?", "Compare salons", "Best rated salons"],
  },
  {
    patterns: ["price", "cost", "₹", "cheap", "expensive", "budget", "afford", "starting"],
    answer:
      "Prices vary by salon. Each card shows a **Starting Price**:\n\n💰 **₹** → Budget (From ₹199)\n💰💰 **₹₹** → Mid-range (From ₹499)\n💰💰💰 **₹₹₹** → Premium (From ₹999)\n💰💰💰💰 **₹₹₹₹** → Luxury (From ₹1,999)\n\nUse filters on the Explore page to find salons in your budget!",
    links: [{ label: "Filter by price", href: "/salons" }],
    suggestions: ["Compare prices", "Budget salons", "How to book?"],
  },
  {
    patterns: ["area", "location", "banjara", "jubilee", "madhapur", "gachibowli", "hitech", "near", "neighbourhood"],
    answer:
      "GlamSpot covers top neighbourhoods in Hyderabad:\n\n📍 Banjara Hills\n📍 Jubilee Hills\n📍 Madhapur\n📍 Gachibowli\n📍 Hitech City\n📍 Kondapur\n📍 Ameerpet\n📍 Kukatpally\n\nUse the **Area** filter to find salons near you!",
    links: [{ label: "Search by area", href: "/salons" }],
    suggestions: ["Filter by category", "How to book?", "Compare salons"],
  },
  {
    patterns: ["service", "hair", "nail", "spa", "massage", "facial", "bridal", "makeup", "skincare", "wax"],
    answer:
      "GlamSpot salons offer a wide range of services:\n\n✂️ **Hair Styling** — cuts, colour, blowouts\n💅 **Nail Art** — manicure, pedicure, extensions\n🧖 **Spa & Massage** — relaxation, body treatments\n💄 **Bridal Makeup** — full bridal packages\n✨ **Facial & Skincare** — glow treatments, cleanup",
    links: [{ label: "Browse by service", href: "/categories" }],
    suggestions: ["Book a service", "Find bridal salons", "Spa salons"],
  },
  {
    patterns: ["account", "register", "sign up", "login", "log in", "profile", "create"],
    answer:
      "Creating a free account takes 30 seconds:\n\n1️⃣ Click **Sign Up** in the top-right\n2️⃣ Enter your name, email & password\n3️⃣ Done! 🎉\n\nWith an account you can book, track appointments & leave reviews.",
    links: [
      { label: "Create account", href: "/register" },
      { label: "Login", href: "/login" },
    ],
    suggestions: ["How to book?", "Is it free?"],
  },
  {
    patterns: ["free", "charge", "fee", "pay", "cost to join"],
    answer:
      "**GlamSpot is completely free for customers!** 🎉\n\nNo charge to browse, compare, or book. You only pay the salon directly for the services you receive.",
    suggestions: ["How to book?", "Sign up free", "Compare salons"],
  },
  {
    patterns: ["photo", "upload", "picture", "image", "selfie", "look"],
    answer:
      "You can upload a photo right here in the chat! 📸\n\nJust click the **📷 image icon** next to the input box, choose a photo (selfie, hairstyle, nail art, outfit — anything beauty-related), and I'll suggest the most relevant GlamSpot services for you!\n\n✅ Works best with: selfies, hair photos, nail art, beauty inspiration pics\n❌ Will flag: non-image files or unrelated photos",
    suggestions: ["How to compare salons?", "How to book?", "What services?"],
  },
  {
    patterns: ["bridal", "wedding", "bride"],
    answer:
      "Getting ready for your big day? 💍\n\nBridal packages typically include:\n💄 Full makeup & hair styling\n💅 Bridal manicure & pedicure\n🧖 Pre-wedding facial & skincare\n\nTip: Book **2–4 weeks in advance** — bridal slots fill up fast!",
    links: [{ label: "Bridal salons", href: "/salons?category=Bridal" }],
    suggestions: ["Compare bridal salons", "Prices", "How to book?"],
  },
  {
    patterns: ["open", "hours", "timing", "time", "available", "weekend"],
    answer:
      "Each salon card shows opening hours and an **Open/Closed** badge in real time.\n\nMost salons open:\n🕙 10:00 AM – 9:00 PM weekdays\n🕙 9:00 AM – 8:00 PM weekends",
    suggestions: ["Book a slot", "Find open salons"],
  },
  {
    patterns: ["how does", "how do", "how can", "explain", "what is", "help", "guide", "start", "new"],
    answer:
      "Welcome to GlamSpot! Here's what you can do:\n\n🔍 **Discover** — Browse & filter salons\n⚖️ **Compare** — View two salons side by side\n📅 **Book** — Reserve appointments instantly\n📸 **Photo Match** — Upload a photo for service suggestions\n⭐ **Reviews** — Read & leave honest feedback\n\nWhat would you like to know more about?",
    links: [{ label: "Explore salons", href: "/salons" }],
    suggestions: ["How to compare?", "How to book?", "Upload a photo"],
  },
];

const WELCOME: Message = {
  id: 0,
  role: "bot",
  text: "Hi! I'm **GlamBot** 👋 — your personal GlamSpot guide.\n\nI can help you find services, compare salons, explain features, or even **analyse a photo** to suggest the perfect beauty treatment for you!\n\nWhat would you like to know?",
  suggestions: ["How to compare salons?", "How do I book?", "Upload a photo for suggestions", "What services are available?"],
};

function findResponse(input: string): Omit<Message, "id" | "role"> {
  const lower = input.toLowerCase();
  for (const kb of KB) {
    if (kb.patterns.some(p => lower.includes(p))) {
      return { text: kb.answer, links: kb.links, suggestions: kb.suggestions };
    }
  }
  return {
    text: "I'm not sure about that one! 🤔 Here are some things I can help with:",
    suggestions: ["How to compare salons?", "How do I book?", "What services are available?", "Prices & budget", "Upload a photo"],
  };
}

/* ─── Markdown-lite renderer ─────────────────────────────── */
function renderText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={li}>
        {parts.map((p, i) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={i}>{p.slice(2, -2)}</strong>
            : <span key={i}>{p}</span>
        )}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

/* ─── Main component ─────────────────────────────────────── */
export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  function addBotMessage(msg: Omit<Message, "id" | "role">) {
    setTyping(false);
    setMessages(m => [...m, { id: Date.now() + 1, role: "bot", ...msg }]);
  }

  function send(text: string) {
    if (!text.trim()) return;
    setMessages(m => [...m, { id: Date.now(), role: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => addBotMessage(findResponse(text)), 600 + Math.random() * 400);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!e.target) return;
    (e.target as HTMLInputElement).value = "";
    if (!file) return;

    /* ── Not an image ── */
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setMessages(m => [...m, {
        id: Date.now(), role: "user",
        text: `📎 Uploaded: ${file.name}`,
      }]);
      setTyping(true);
      setTimeout(() => addBotMessage({
        text: "❌ **That file doesn't look like a photo.**\n\nPlease upload an image file — JPEG, PNG, or WebP work best.\n\nTip: Take a selfie, a photo of a hairstyle you like, nail art inspiration, or a beauty look you want to recreate!",
        isError: true,
        suggestions: ["Upload a photo", "What services exist?", "How to book?"],
      }), 700);
      return;
    }

    /* ── Too large (>10 MB) ── */
    if (file.size > 10 * 1024 * 1024) {
      setMessages(m => [...m, { id: Date.now(), role: "user", text: "📎 Uploaded a very large image" }]);
      setTyping(true);
      setTimeout(() => addBotMessage({
        text: "❌ **Photo is too large** (max 10 MB).\n\nPlease compress the image or take a new photo and try again.",
        isError: true,
        suggestions: ["Upload a photo", "How to book?"],
      }), 700);
      return;
    }

    /* ── Valid image — show preview ── */
    const previewUrl = URL.createObjectURL(file);
    setMessages(m => [...m, { id: Date.now(), role: "user", text: "📸 Analysing your photo…", imageUrl: previewUrl }]);
    setTyping(true);

    const profile = await analyzeColors(file);

    if (!profile) {
      setTimeout(() => addBotMessage({
        text: "⚠️ I had trouble reading that photo. Could you try uploading a different one?\n\nBest formats: JPEG or PNG.",
        isError: true,
        suggestions: ["Upload a photo", "How to book?"],
      }), 800);
      return;
    }

    /* ── Very low contrast / blank image ── */
    const { r, g, b } = profile;
    const brightness = (r + g + b) / 3;
    if (brightness > 245 || brightness < 5) {
      setTimeout(() => addBotMessage({
        text: "⚠️ **This photo appears to be blank or nearly invisible.**\n\nPlease upload a clear, well-lit photo of a hairstyle, selfie, nail art, or beauty inspiration!",
        isError: true,
        suggestions: ["Upload a clearer photo", "How to book?"],
      }), 800);
      return;
    }

    /* ── Get beauty suggestions ── */
    const suggestion = getPhotoSuggestion(profile);
    setTimeout(() => addBotMessage({
      text: `${suggestion.title}\n\n${suggestion.text}`,
      links: suggestion.links,
      suggestions: suggestion.suggestions,
    }), 1000 + Math.random() * 500);
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
      {!open && hasUnread && (
        <span className="fixed bottom-[4.5rem] right-6 z-50 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
      )}

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[355px] sm:w-[385px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`}
        style={{ maxHeight: "min(580px, calc(100dvh - 120px))" }}
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
                {/* Image preview */}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Uploaded"
                    className="w-40 h-32 object-cover rounded-xl border border-border shadow-sm"
                  />
                )}

                {/* Bubble */}
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${msg.role === "bot"
                    ? msg.isError
                      ? "bg-red-50 text-foreground border border-red-200 rounded-tl-sm"
                      : "bg-[#F3F4F6] text-foreground rounded-tl-sm"
                    : "bg-foreground text-white rounded-tr-sm"
                  }`}>
                  {msg.isError && <AlertCircle className="w-4 h-4 text-red-500 inline mr-1.5 -mt-0.5" />}
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
                        onClick={() => {
                          if (s === "Upload a photo" || s === "Upload a clearer photo") {
                            fileInputRef.current?.click();
                          } else {
                            send(s);
                          }
                        }}
                        className="text-xs font-medium text-muted-foreground bg-white border border-border px-2.5 py-1 rounded-full hover:border-foreground/30 hover:text-foreground hover:bg-[#F3F4F6] transition-all"
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

        {/* Photo upload hint strip */}
        <div className="px-4 py-2 bg-[#C9A227]/8 border-t border-[#C9A227]/20 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 text-xs text-[#8a6d14] font-medium hover:text-[#C9A227] transition-colors group"
          >
            <ImagePlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            Upload a photo for personalised beauty suggestions
          </button>
        </div>

        {/* Input */}
        <div className="border-t border-border px-3 py-3 shrink-0">
          <form
            onSubmit={e => { e.preventDefault(); send(input); }}
            className="flex gap-2 items-center"
          >
            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload a photo"
              className="w-10 h-10 rounded-xl border border-border bg-[#F3F4F6] text-muted-foreground flex items-center justify-center hover:border-[#C9A227]/50 hover:text-[#C9A227] hover:bg-[#C9A227]/8 transition-all shrink-0"
            >
              <ImagePlus className="w-4 h-4" />
            </button>

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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif,application/pdf,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileUpload}
      />
    </>
  );
}
