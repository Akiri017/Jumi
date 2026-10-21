'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { IconBack, IconSend, IconShield } from '@/components/ui/icons';
import { openingMove } from '@/lib/demo/opening-move';
import { getCandidate, getCompany, getVacancy, matchesFor, useAppStore } from '@/lib/state/app-store';

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { state, sendMessage, typingIn } = useAppStore();
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  // Only the two matched parties may open a thread; the persona check stands in for auth.
  const match = matchesFor(state).find((m) => m.id === matchId);
  const thread = state.messages.filter((m) => m.matchId === matchId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thread.length, typingIn]);

  const vacancy = match && getVacancy(match.vacancyId);
  const candidate = match && getCandidate(match.candidateId);
  const company = vacancy && getCompany(vacancy.companyId);
  if (!match || !vacancy || !candidate || !company) {
    return (
      <div className="rounded-3xl border border-line bg-paper p-6 text-center">
        <p className="font-display text-xl font-bold">Chat not available</p>
        <p className="mt-1 text-sm text-ink-muted">Chats open only after a mutual match.</p>
        <Link href="/matches" className="mt-4 inline-block font-semibold text-moss underline">
          Back to matches
        </Link>
      </div>
    );
  }

  const employer = state.persona === 'employer';
  const myId = employer ? company.id : candidate.id;
  const otherName = employer ? candidate.name : company.name;
  const suggestion = openingMove(state.persona, candidate, vacancy, company);

  const send = (text: string) => {
    if (!text.trim()) return;
    sendMessage(match.id, text);
    setDraft('');
  };

  return (
    <div className="mx-auto flex max-w-md flex-col">
      <div className="mb-3 flex items-center gap-3">
        <Link href="/matches" aria-label="Back to matches" className="-ml-2 grid size-11 place-items-center rounded-xl">
          <IconBack className="size-5" />
        </Link>
        {employer ? (
          <Avatar name={candidate.name} hue={candidate.avatarHue} size={40} />
        ) : (
          <Avatar name={company.name} hue={company.hue} size={40} shape="square" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold">{otherName}</h1>
          <Link href={`/why/${vacancy.id}/${candidate.id}`} className="text-sm text-moss underline">
            {vacancy.title} · why we matched
          </Link>
        </div>
      </div>

      <p className="mb-4 flex items-center gap-2 rounded-2xl bg-paper p-3 text-xs text-ink-muted">
        <IconShield className="size-4 shrink-0 text-moss" />
        Private to you and {otherName}. Don’t share IDs or bank details in chat.
      </p>

      <ol className="flex flex-col gap-2" aria-live="polite">
        {thread.map((m) => {
          const mine = m.senderId === myId;
          return (
            <li
              key={m.id}
              className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] leading-snug ${
                mine ? 'self-end rounded-br-md bg-forest text-cream' : 'self-start rounded-bl-md border border-line bg-paper'
              }`}
            >
              <span className="sr-only">{mine ? 'You' : otherName}: </span>
              {m.body}
            </li>
          );
        })}
        {typingIn === match.id && (
          <li className="self-start rounded-3xl rounded-bl-md border border-line bg-paper px-4 py-3" aria-label={`${otherName} is typing`}>
            <span className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="typing-dot size-2 rounded-full bg-ink-muted" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </span>
          </li>
        )}
      </ol>
      <div ref={endRef} />

      {thread.length === 0 && (
        <div className="mt-2 rounded-2xl border border-dashed border-moss/50 bg-lime/30 p-4">
          <p className="text-[11px] font-bold tracking-[0.2em] text-moss uppercase">Opening move</p>
          <p className="mt-1 text-sm">{suggestion}</p>
          <button
            type="button"
            onClick={() => send(suggestion)}
            className="mt-3 h-11 rounded-xl bg-forest px-4 text-sm font-semibold text-lime"
          >
            Send this
          </button>
        </div>
      )}

      <form
        className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <div className="mx-auto flex max-w-md gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Message {otherName}
          </label>
          <input
            id="chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Say hi…"
            maxLength={1000}
            autoComplete="off"
            className="h-12 flex-1 rounded-2xl border border-line bg-paper px-4 outline-none focus:border-moss"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim()}
            className="grid size-12 place-items-center rounded-2xl bg-forest text-lime disabled:opacity-40"
          >
            <IconSend className="size-5" />
          </button>
        </div>
      </form>
      <div className="h-20" aria-hidden />
    </div>
  );
}
