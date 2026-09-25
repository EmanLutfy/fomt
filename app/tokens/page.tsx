"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTokens } from "@/lib/api";
import { container, sectionPad } from "@/lib/ui";
import { DemoDataBadge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { TokenCard } from "@/components/tokens/TokenCard";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";

export default function TokensPage() {
  const [query, setQuery] = useState("");
  const { data: tokens, isLoading, isError } = useQuery({
    queryKey: ["tokens", query],
    queryFn: () => getTokens(query),
  });

  return (
    <div className={`${sectionPad} pt-10 sm:pt-14`}>
      <div className={container}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-sans font-extrabold tracking-tight text-2xl text-ink sm:text-3xl">Token activity</h1>
            <p className="mt-1 text-sm text-ink-muted">Tokens tracked wallets have been trading on Robinhood Chain.</p>
          </div>
          <DemoDataBadge />
        </div>

        <SearchInput value={query} onChange={setQuery} placeholder="Search by symbol or name" className="mb-6 max-w-md" />

        {isLoading && <LoadingState label="Loading tokens" />}
        {isError && (
          <EmptyState title="Couldn't load tokens" description="Something went wrong fetching this list. Try again in a moment." />
        )}
        {!isLoading && !isError && tokens?.length === 0 && (
          <EmptyState
            title="No tokens match your search"
            description={`No tracked token symbol or name contains "${query}".`}
          />
        )}
        {!isLoading && !isError && tokens && tokens.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tokens.map((t) => (
              <TokenCard key={t.symbol} token={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
