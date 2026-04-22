import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  type: "tenant" | "support";
  onClose: () => void;
  onCreate: (subject: string, firstMessage: string) => void;
}

export default function NewThreadModal({ type, onClose, onCreate }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const title = type === "tenant" ? "Новый вопрос к тенанту" : "Обращение в техподдержку";

  function validate(): boolean {
    const e: typeof errors = {};
    if (!subject.trim()) e.subject = "Укажите тему обращения";
    if (!message.trim()) e.message = "Введите текст сообщения";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onCreate(subject.trim(), message.trim());
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name={type === "support" ? "Headphones" : "MessageSquare"} size={18} className="text-violet-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Тема */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Тема обращения <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Кратко опишите суть вопроса"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
              }}
              className={cn(errors.subject && "border-red-400 focus-visible:ring-red-400")}
            />
            {errors.subject && (
              <p className="text-xs text-red-500">{errors.subject}</p>
            )}
          </div>

          {/* Сообщение */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Сообщение <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Подробно опишите вашу проблему или вопрос..."
              value={message}
              rows={4}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
              }}
              className={cn("resize-none", errors.message && "border-red-400 focus-visible:ring-red-400")}
            />
            {errors.message && (
              <p className="text-xs text-red-500">{errors.message}</p>
            )}
          </div>

          {/* Прикрепить файл */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Вложение</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="Paperclip" size={14} />
                Прикрепить файл
              </Button>
              {fileName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="File" size={12} className="text-violet-500" />
                  <span className="truncate max-w-[200px]">{fileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFileName(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-muted-foreground hover:text-foreground ml-1"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Icon name="Send" size={14} />
            Отправить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
