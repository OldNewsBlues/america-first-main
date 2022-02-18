<script>
	import {cleanName, gotoManager, round} from '$lib/utils/helper';
	import TransactionMove from './TransactionMove.svelte';
	import { Icon } from '@smui/icon-button';

	export let transaction, masterOffset, currentManagers, prevManagers, players, waiverType;

	const numTraders = transaction.type == 'trade' ? transaction.rosters.length : 0;
	const traders = transaction.type == 'trade' ? transaction.rosters : null;

	let failedBids = transaction.failedAdds ? transaction.failedAdds.sort((a, b) => b.bid - a.bid) : null;

	let selected = "0px";
	const toggleSelected = () => {
		selected = selected == "0px" ? calcHeight() + "px" : "0px";
	}

	let innerWidth;

	const calcHeight = () => {
		const numFailedBids = transaction.failedAdds.length * 48 + 53;
		return numFailedBids;
	}

	let expanded = false;
	$: {
		selected = expanded ? calcHeight() + "px" : "0px";
	}

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
	:global(.transaction) {
		display: block;
		width: 100%;
		margin: 15px auto;
		border: 1px solid var(--ccc);
		box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);
	}

	:global(.transaction table) {
		table-layout:fixed !important;
		width: 100%;
	}

	:global(.transactTeam) {
		text-align: center;
		padding: 5px 0;
		background-color: var(--transactHeader);
	}

	:global(.transact-date) {
		text-align: center;
		padding: 5px 0;
		background-color: var(--transactHeader);
		color: #888;
		font-style: italic;
	}

	.avatar {
		vertical-align: middle;
		border-radius: 50%;
		height: 40px;
		width: 40px;
		margin: 0.1em;
		border: 0.25px solid #777;
	}

	.currentOwner {
		display: block;
		font-style: italic;
		font-size: 0.8em;
		color: #aaa;
	}

	.clickable {
		cursor: pointer;
	}

	.losingBids {
		overflow: hidden;
		width: 100%;
		display: inline-flex;
		flex-direction: column;
		transition: max-height 0.7s ease-in-out;
		margin: 4px 0;
	}

	.interactive {
		display: inline-flex;
		position: relative;
		background-color: var(--fff);
		width: 100%;
		height: 15%;
		align-items: center;
		justify-content: center;
		color: var(--gcPlayRowText);
	}

	:global(.trans) {
		position: relative;
		display: inline-flex;
		width: 100%;
		border-bottom: 0.25px solid var(--ccc);
	}

	:global(.transDate) {
		position: relative;
		display: inline-flex;
		width: 100%;
		padding: 5px 0;
		background-color: var(--transactHeader);
		color: #888;
		font-style: italic;
		align-items: center;
		justify-content: center;
	}

	:global(.transWrapper) {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		width: 100%;
		margin: 15px auto;
		border: 1px solid var(--ccc);
		box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);
	}

	:global(.transManager) {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		width: 25%;
		padding: 5px 0;
		background-color: var(--transactHeader);
		align-items: center;
		justify-content: center;
	}

	:global(.price) {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 25%;
		background-color: var(--transactHeader);
		border-left: 0.25px solid var(--ccc);
	}

	.columnWrap {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.rowWrap {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.header {
		position: relative;
		display: inline-flex;
	}
</style>

<div class="transWrapper">
	<div class="trans">
		{#if transaction.type == 'trade'}
			{#if numTraders == 2}
				<div class="transManager clickable" on:click={() => gotoManager(transaction.recordManIDs[0])} style="border-right: 0.25px solid var(--ccc);">
					<!-- {#if transaction.previousOwners && cleanName(transaction.previousOwners[0].name) != cleanName(currentManagers[transaction.recordManIDs[0]].name)}
						<img class="avatar" src="{transaction.previousOwners[0].avatar}" alt="{transaction.previousOwners[0].name} avatar"/>
						<span>{transaction.previousOwners[0].name}</span>
						<span class="currentOwner">({currentManagers[transaction.recordManIDs[0]].name})</span>
					{:else} -->
						<img class="avatar" src="{prevManagers[transaction.recordManIDs[0]].avatar}" alt="{prevManagers[transaction.recordManIDs[0]].name} avatar"/>
						<span>{prevManagers[transaction.recordManIDs[0]].name}</span>
					<!-- {/if} -->
				</div>
			{/if}
		{:else}
			{#each transaction.recordManIDs as owner, ix}
				<div class="transManager clickable" on:click={() => gotoManager(owner)} style="border-right: 0.25px solid var(--ccc);">
					<!-- {#if transaction.previousOwners && cleanName(transaction.previousOwners[ix].name) != cleanName(prevManagers[owner].name)}
						<img class="avatar" src="{transaction.previousOwners[ix].avatar}" alt="{transaction.previousOwners[ix].name} avatar"/>
						<span>{transaction.previousOwners[ix].name}</span>
						<span class="currentOwner">({currentManagers[owner].name})</span>
					{:else} -->
						<img class="avatar" src="{prevManagers[owner].avatar}" alt="{prevManagers[owner].name} avatar"/>
						<span>{prevManagers[owner].name}</span>
					<!-- {/if} -->
				</div>
			{/each}
		{/if}
		{#if transaction.type == 'trade'}
			<div class="columnWrap" style="width: 50%">
				{#each transaction.moves as move, ix}
					<TransactionMove {players} {move} allMoves={transaction.moves} index={ix} {traders} number={transaction.moves.length} type={transaction.type} {masterOffset} {prevManagers} />
				{/each}
			</div>
		{:else}
			{#each transaction.moves as move, ix}
				<TransactionMove {players} {move} allMoves={transaction.moves} index={ix} {traders} number={transaction.moves.length} type={transaction.type} {masterOffset} {prevManagers} />
			{/each}
		{/if}
		{#if transaction.type == 'trade'}
			{#if numTraders == 2}
				<div class="transManager clickable" on:click={() => gotoManager(transaction.recordManIDs[1])} style="border-left: 0.25px solid var(--ccc);">
					<!-- {#if transaction.previousOwners && cleanName(transaction.previousOwners[1].name) != cleanName(currentManagers[transaction.recordManIDs[1]].name)}
						<img class="avatar" src="{transaction.previousOwners[1].avatar}" alt="{transaction.previousOwners[1].name} avatar"/>
						<span>{transaction.previousOwners[1].name}</span>
						<span class="currentOwner">({currentManagers[transaction.recordManIDs[1]].name})</span>
					{:else} -->
						<img class="avatar" src="{prevManagers[transaction.recordManIDs[1]].avatar}" alt="{prevManagers[transaction.recordManIDs[1]].name} avatar"/>
						<span>{prevManagers[transaction.recordManIDs[1]].name}</span>
					<!-- {/if} -->
				</div>
			{/if}
		{:else}
			<div class="price" style="justify-content: space-between;">
				<div class="columnWrap">
					<div class="rowWrap">
						<div class="columnWrap">
							<div class="header">$ BID</div>
							<div class="header">{transaction.moves[0][0].bid ? transaction.moves[0][0].bid : '0'}</div>
						</div>
						<div class="columnWrap">
							<div class="header">% REM</div>
							<div class="header">{transaction.moves[0][0].bid ? round(transaction.moves[0][0].budgetPercs.remaining) : '0'}</div>
						</div>
						<div class="columnWrap">
							<div class="header">% TOT</div>
							<div class="header">{transaction.moves[0][0].bid ? round(transaction.moves[0][0].budgetPercs.total) : '0'}</div>
						</div>
					</div>
					{#if transaction.failedAdds}
						<div class="losingBids" style="max-height: {selected};">
							{#each failedBids as failedBid}
								<div class="rowWrap">
									<div class="columnWrap clickable" style="width: 90%; align-items: flex-start; padding: 0 0 0 7px;"  on:click={() => gotoManager(failedBid.recordManID)} >
										{prevManagers[failedBid.recordManID].name}
									</div>
									<div class="columnWrap" style="width: 10%; align-items: flex-end; padding: 0 7px 0 0;">
										${failedBid.bid}
									</div>
								</div>
							{/each}
						</div>
						<div class="interactive clickable" on:click={toggleSelected}>
							<Icon class="material-icons icon">close_fullscreen</Icon> Losing Bids
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
	<div class="transDate">
		{transaction.date}
	</div>
</div>





