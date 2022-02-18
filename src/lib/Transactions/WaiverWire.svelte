<script>
	import { getLeagueTransactions, getLeagueRosters, getLeagueData, waitForAll, leagueID, managers, gotoManager } from '$lib/utils/helper';
	import LinearProgress from '@smui/linear-progress';
	import { onMount } from 'svelte';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

	let loading = true;
	let transactionTotals, currentManagers, rosters, year, waiverType, waiverBudget, waiverWire;

    const leagueManagers = {};
	for(const manager of managers) {
		if(!leagueManagers[manager.roster]) leagueManagers[manager.roster] = [];
		
		leagueManagers[manager.roster].push({
			managerID: manager.managerID,
			rosterID: manager.roster,
			name: manager.name,
			yearsactive: manager.yearsactive,
		});
	}

	const getWaiverWire = (transactionTotals, rosters, waiverBudget, waiverType, currentManagers, year) => {
		waiverWire = [];
		for(const key in rosters) {
            const rosterID = rosters[key].roster_id;
            const recordManID = leagueManagers[rosterID].find(m => m.yearsactive.includes(year)).managerID;

			let remainingFaab;
			if(waiverType == 2) remainingFaab = waiverBudget - rosters[key].settings.waiver_budget_used;
			const moves = transactionTotals[recordManID].regular.waiver + transactionTotals[recordManID].playoffs.waiver;
			waiverWire.push({
                recordManID,
				rosterID: rosters[key].roster_id,
				faab: remainingFaab,
				priority: rosters[key].settings.waiver_position,
				manager: currentManagers[recordManID],
				moves,
			})
		}
		waiverWire = waiverWire.sort((a, b) => a.priority - b.priority);
	}

	onMount(async () => {
		const [transactionsData, rostersData, leagueData] = await waitForAll(getLeagueTransactions(true),getLeagueRosters(leagueID), getLeagueData(leagueID));
		currentManagers = transactionsData.currentManagers;
		rosters = rostersData.rosters;
		waiverType = leagueData.settings.waiver_type;
        year = parseInt(leagueData.season);
        transactionTotals = transactionsData.totals.seasons[year];

		if(waiverType == 2) waiverBudget = leagueData.settings.waiver_budget;

		if(transactionsData.stale) {
			const newTransactions = await getLeagueTransactions(true, true);
			transactionTotals = newTransactions.totals.seasons[year];
			currentManagers = newTransactions.currentManagers;
		}

		if(rosters) getWaiverWire(transactionTotals, rosters, waiverBudget, waiverType, currentManagers, year);

		loading = false;
	})
</script>

<style>

    .transactions {
		position: relative;
		width: 100%;
		z-index: 1;
	}

	.avatar {
		vertical-align: middle;
		border-radius: 50%;
		height: 25px;
		width: 25px;
		margin: 0 0.2em 0 0;
		border: 0.25px solid #777;
	}

	.clickable {
		cursor: pointer;
	}
</style>

<div class="transactions">
    {#if loading}
        <p>Loading league transactions...</p>
        <LinearProgress indeterminate />
    {:else}
        <!-- waiver wire summary -->
        {#if waiverWire.length}
            <DataTable table$aria-label="Waiver Priority" style="width: 100%; box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);">
                <Head> 
                    <Row>
                        <Cell class="center" />
                        <Cell class="center">Team</Cell>
                        <Cell class="center">Moves</Cell>
                        {#if waiverType == 2}
                            <Cell class="center">FAAB</Cell>
                        {/if}
                    </Row>
                </Head>
                <Body>
                    {#each waiverWire as waiver}
                        <Row>
                            <Cell class="center">{waiver.priority}</Cell>
                            <Cell class="cellname">
                                <img class="avatar clickable" on:click={() => gotoManager(waiver.rosterID)} src="{waiver.manager.avatar}" alt="{waiver.manager.name} avatar"/>
                                {waiver.manager.name}
                            </Cell>
                            <Cell class="center">{waiver.moves}</Cell>
                            {#if waiverType == 2}
                                <Cell class="center">${waiver.faab}</Cell>
                            {/if}
                        </Row>
                    {/each}
                </Body>
            </DataTable>
        {/if}
    {/if}
</div>