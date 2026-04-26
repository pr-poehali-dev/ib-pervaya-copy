import { useState } from "react";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";

interface LoginPasswordCellProps {
  email: string;
  /** Внешний флаг «скопировано» для логина (управляется снаружи) */
  loginCopied?: boolean;
  onCopyLogin: () => void;
  maxEmailWidth?: string;
}

export default function LoginPasswordCell({
  email,
  loginCopied = false,
  onCopyLogin,
  maxEmailWidth = "max-w-[130px]",
}: LoginPasswordCellProps) {
  const [pwdCopied, setPwdCopied] = useState(false);

  const copyPassword = () => {
    navigator.clipboard.writeText("••••••••");
    setPwdCopied(true);
    setTimeout(() => setPwdCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className={`text-xs text-muted-foreground truncate ${maxEmailWidth}`}>{email}</span>
        <Tip text="Скопировать логин">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            onClick={onCopyLogin}
          >
            {loginCopied
              ? <Icon name="Check" size={13} className="text-emerald-500" />
              : <Icon name="Copy" size={13} />
            }
          </button>
        </Tip>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground tracking-widest">••••••••</span>
        <Tip text="Скопировать пароль">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            onClick={copyPassword}
          >
            {pwdCopied
              ? <Icon name="Check" size={13} className="text-emerald-500" />
              : <Icon name="KeyRound" size={13} />
            }
          </button>
        </Tip>
      </div>
    </div>
  );
}
