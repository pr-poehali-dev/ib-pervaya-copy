import Icon from "@/components/ui/icon";

interface UserAvatarProps {
  gradient: string;
  /** Инициалы (2 буквы) — если не переданы, рисуется иконка */
  initials?: string;
  /** Имя иконки из lucide-react (если нет инициалов) */
  icon?: string;
  size?: "sm" | "md";
}

export default function UserAvatar({ gradient, initials, icon = "User", size = "md" }: UserAvatarProps) {
  const dim = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const textSize = size === "sm" ? "text-[9px]" : "text-[10px]";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <div className={`${dim} bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
      {initials
        ? <span className={`text-white font-bold ${textSize}`}>{initials}</span>
        : <Icon name={icon} size={iconSize} className="text-white" />
      }
    </div>
  );
}
