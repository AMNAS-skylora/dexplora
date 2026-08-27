import { Send } from "lucide-react";

interface FloatingWhatsAppProps {
  number: string;
}

export function FloatingWhatsApp({ number }: FloatingWhatsAppProps) {
  const cleanNumber = number.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hi%20Dexplora%20Tour%20Planners,%20I%20am%20interested%20in%20a%20group%20trip!`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-[max(14px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-30 bg-[#16A36A] hover:bg-[#128856] text-white p-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <Send className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
        Chat with Dexplora
      </span>
    </a>
  );
}
