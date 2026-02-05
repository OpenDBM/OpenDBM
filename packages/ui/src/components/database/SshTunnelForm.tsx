import { useState } from "react";
import type { SshConfig, SshAuthMethod } from "@/types/connection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SshTunnelFormProps {
    initialValues?: Partial<SshConfig>;
    onSubmit: (config: SshConfig) => void;
    onCancel?: () => void;
    submitLabel?: string;
}

export function SshTunnelForm({
    initialValues,
    onSubmit,
    onCancel,
    submitLabel = "Save Tunnel",
}: SshTunnelFormProps) {
    const [form, setForm] = useState<SshConfig>({
        id: initialValues?.id || crypto.randomUUID(),
        name: initialValues?.name || "",
        host: initialValues?.host || "",
        port: initialValues?.port || 22,
        username: initialValues?.username || "root",
        authMethod: initialValues?.authMethod || "password",
        password: initialValues?.password || "",
        keyPath: initialValues?.keyPath || "",
        passphrase: initialValues?.passphrase || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="ssh-name" className="text-xs font-semibold text-foreground/70">Tunnel Name</Label>
                <Input
                    id="ssh-name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. My Bastion Host"
                    required
                    className="h-9"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="ssh-host" className="text-xs font-semibold text-foreground/70">SSH Host</Label>
                    <Input
                        id="ssh-host"
                        value={form.host}
                        onChange={(e) => setForm((prev) => ({ ...prev, host: e.target.value }))}
                        placeholder="1.2.3.4"
                        required
                        className="h-9"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ssh-port" className="text-xs font-semibold text-foreground/70">Port</Label>
                    <Input
                        id="ssh-port"
                        type="number"
                        value={form.port}
                        onChange={(e) => setForm((prev) => ({ ...prev, port: parseInt(e.target.value) || 0 }))}
                        className="h-9 font-mono text-xs"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="ssh-username" className="text-xs font-semibold text-foreground/70">Username</Label>
                <Input
                    id="ssh-username"
                    value={form.username}
                    onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="root"
                    required
                    className="h-9"
                />
            </div>

            <div className="space-y-3 pt-1">
                <Label className="text-xs font-semibold text-foreground/70">Authentication Method</Label>
                <RadioGroup
                    value={form.authMethod}
                    onValueChange={(val: SshAuthMethod) => setForm((prev) => ({ ...prev, authMethod: val }))}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="password" id="auth-password" />
                        <Label htmlFor="auth-password" className="text-[11px] font-medium cursor-pointer">Password</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="key" id="auth-key" />
                        <Label htmlFor="auth-key" className="text-[11px] font-medium cursor-pointer">Private Key</Label>
                    </div>
                </RadioGroup>
            </div>

            {form.authMethod === "password" ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label htmlFor="ssh-password" className="text-xs font-semibold text-foreground/70">Password</Label>
                    <Input
                        id="ssh-password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        className="h-9"
                    />
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-2">
                        <Label htmlFor="ssh-keypath" className="text-xs font-semibold text-foreground/70">Key File Path</Label>
                        <Input
                            id="ssh-keypath"
                            value={form.keyPath}
                            onChange={(e) => setForm((prev) => ({ ...prev, keyPath: e.target.value }))}
                            placeholder="/Users/name/.ssh/id_rsa"
                            className="h-9 text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ssh-passphrase" className="text-xs font-semibold text-foreground/70">Passphrase (Optional)</Label>
                        <Input
                            id="ssh-passphrase"
                            type="password"
                            value={form.passphrase}
                            onChange={(e) => setForm((prev) => ({ ...prev, passphrase: e.target.value }))}
                            placeholder="••••••••"
                            className="h-9"
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-9 text-[11px] font-bold uppercase">
                        Cancel
                    </Button>
                )}
                <Button type="submit" className="flex-1 h-9 text-[11px] font-bold uppercase">
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
