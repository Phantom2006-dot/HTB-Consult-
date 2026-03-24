import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className="gap-1.5 text-muted-foreground hover:text-foreground text-xs px-2 h-8"
    >
      <ArrowLeft size={14} />
      Back
    </Button>
  );
};

export default BackButton;
