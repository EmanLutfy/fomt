"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTraders } from "@/lib/api";
import { container, sectionPad } from "@/lib/ui";
import { DemoDataBadge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { TraderCard } from "@/components/traders/TraderCard";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";

export default function TradersPage() {
  const [query, setQuery] = useState("");
  const { data: traders, isLoading, isError } = useQuery({
    queryKey: ["traders", query],
    queryFn: () => getTraders(query),
  });

  return (
    <div className={`${sectionPad} pt-10 sm:pt-14`}>
      <div className={container}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink sm:text-3xl">Tracked traders</h1>
            <p className="mt-1 text-sm text-ink-muted">Wallets FOMT follows for on-chain activity on Robinhood Chain.</p>
          </div>
          <DemoDataBadge />
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by handle or wallet address"
          className="mb-6 max-w-md"
        />

        {isLoading && <LoadingState label="Loading tracked traders" />}
        {isError && (
          <EmptyState title="Couldn't load traders" description="Something went wrong fetching this list. Try again in a moment." />
        )}
        {!isLoading && !isError && traders?.length === 0 && (
          <EmptyState
            title="No traders match your search"
            description={`No tracked handle or wallet contains "${query}". Try a shorter fragment of a handle or address.`}
          />
        )}
        {!isLoading && !isError && traders && traders.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {traders.map((t) => (
              <TraderCard key={t.handle} trader={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
