import { useState } from "react";
import { ActivePanel, OrgData, SystemUser, EmailSettings } from "./settings/types";
import { DEFAULT_ORG, DEFAULT_SYSTEM_USERS, DEFAULT_EMAIL_SETTINGS } from "@/data/mockData";
import SettingsCards from "./settings/SettingsCards";
import OrgPanel from "./settings/OrgPanel";
import UsersPanel from "./settings/UsersPanel";
import EmailPanel from "./settings/EmailPanel";

export default function AdminSettings() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const [org, setOrg] = useState<OrgData>(DEFAULT_ORG);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(DEFAULT_SYSTEM_USERS);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(DEFAULT_EMAIL_SETTINGS);

  return (
    <div className="space-y-6">
      {activePanel === null && (
        <SettingsCards
          org={org}
          systemUsers={systemUsers}
          setActivePanel={setActivePanel}
        />
      )}

      {activePanel === "org" && (
        <OrgPanel
          org={org}
          onSave={setOrg}
          onBack={() => setActivePanel(null)}
        />
      )}

      {activePanel === "users" && (
        <UsersPanel
          systemUsers={systemUsers}
          onUsersChange={setSystemUsers}
          onBack={() => setActivePanel(null)}
        />
      )}

      {activePanel === "email" && (
        <EmailPanel
          emailSettings={emailSettings}
          onEmailSettingsChange={setEmailSettings}
          onBack={() => setActivePanel(null)}
        />
      )}
    </div>
  );
}