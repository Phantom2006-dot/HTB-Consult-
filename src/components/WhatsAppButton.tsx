import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "2348058180874";
const WHATSAPP_MESSAGE = "Hi, I'd like to get some support from HTB Consults.";

const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group px-4 py-3"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-6 h-6 shrink-0 fill-white"
      >
        <path d="M16.004 2C8.28 2 2 8.278 2 16a13.93 13.93 0 0 0 1.932 7.077L2 30l7.232-1.897A13.94 13.94 0 0 0 16.004 30C23.722 30 30 23.722 30 16S23.722 2 16.004 2Zm0 25.538a11.582 11.582 0 0 1-5.916-1.62l-.424-.252-4.294 1.126 1.148-4.184-.277-.44A11.54 11.54 0 0 1 4.46 16c0-6.37 5.176-11.538 11.544-11.538S27.54 9.63 27.54 16 22.368 27.538 16.004 27.538Zm6.33-8.647c-.346-.174-2.05-1.012-2.368-1.127-.317-.115-.548-.174-.778.174-.23.347-.895 1.127-1.098 1.358-.202.23-.403.26-.75.086-.346-.174-1.46-.538-2.782-1.717-1.028-.917-1.722-2.05-1.924-2.396-.202-.347-.022-.534.152-.707.156-.155.346-.405.52-.607.172-.202.23-.347.346-.578.115-.23.057-.433-.029-.607-.087-.174-.778-1.878-1.067-2.572-.28-.674-.566-.583-.778-.593l-.663-.012a1.27 1.27 0 0 0-.923.433c-.317.347-1.213 1.185-1.213 2.889s1.242 3.352 1.415 3.583c.173.23 2.444 3.73 5.923 5.23.828.357 1.474.571 1.977.73.83.264 1.585.227 2.182.138.666-.1 2.05-.838 2.34-1.648.288-.81.288-1.505.202-1.648-.086-.144-.317-.23-.663-.405Z" />
      </svg>
      <span className="text-sm font-semibold whitespace-nowrap max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
        Chat Support
      </span>
    </a>
  );
};

export default WhatsAppButton;
