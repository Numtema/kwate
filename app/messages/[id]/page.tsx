'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { listMessages, markConversationRead, sendMessage } from '@/features/messages/repository';
import type { MessageRecord } from '@/features/messages/types';

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setMessages(await listMessages(id));
      await markConversationRead(id);
      setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Conversation indisponible.'); } finally { if (!silent) setLoading(false); }
  }, [id]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 5000);
    return () => window.clearInterval(interval);
  }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const submit = async () => {
    if (!user || !body.trim()) return;
    setSending(true);
    setError('');
    try {
      const sent = await sendMessage(user.id, id, body);
      setMessages((current) => [...current, sent]);
      setBody('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Envoi impossible.'); } finally { setSending(false); }
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/5 bg-zinc-950/90 px-5 py-5 backdrop-blur-xl"><button onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900"><ArrowLeft className="h-5 w-5" /></button><div><p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Conversation</p><h1 className="font-space text-xl font-black">Messagerie sécurisée</h1></div></header>
      <main className="flex-1 space-y-3 px-5 py-6">
        {loading && <div className="text-center text-sm text-zinc-500">Chargement…</div>}
        {error && <div className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-300">{error}</div>}
        {!loading && messages.length === 0 && <div className="py-16 text-center text-sm text-zinc-500">Écrivez le premier message.</div>}
        {messages.map((message) => {
          const mine = message.sender_id === user?.id;
          return <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-[24px] px-5 py-3 ${mine ? 'bg-green-500 text-black' : 'bg-zinc-900 text-white'}`}><p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed">{message.body}</p><p className={`mt-1 text-[9px] font-bold ${mine ? 'text-black/50' : 'text-zinc-600'}`}>{new Date(message.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p></div></div>;
        })}
        <div ref={bottomRef} />
      </main>
      <footer className="sticky bottom-0 border-t border-white/5 bg-zinc-950/90 p-4 pb-24 backdrop-blur-xl md:pb-4"><div className="flex items-end gap-3 rounded-[28px] bg-zinc-900 p-2 pl-5"><textarea value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit(); } }} rows={1} placeholder="Votre message…" className="max-h-32 min-h-11 flex-1 resize-none bg-transparent py-3 text-sm font-semibold outline-none placeholder:text-zinc-600" /><button onClick={() => void submit()} disabled={sending || !body.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-black disabled:opacity-40">{sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</button></div></footer>
    </div>
  );
}
