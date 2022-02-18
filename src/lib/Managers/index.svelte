<script>
    import { getLeagueTransactions } from '$lib/utils/helper';
    import AllManagers from './AllManagers.svelte'
    import Manager from './Manager.svelte'

    export let managers, manager, rostersData, users, leagueData, transactionsData, awards, records, managerRecords;

    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        transactionsData = newTransactions; 
    }

    if(transactionsData.stale) refreshTransactions();
</script>

<div class="matchups"> 
    {#if manager}
        <!-- promise was fulfilled -->
        <Manager {awards} {records} {managerRecords} {manager} {managers} {rostersData} {users} rosterPositions={leagueData.roster_positions} transactions={transactionsData.transactions} currentManagers={transactionsData.currentManagers} prevManagers={transactionsData.prevManagers} />
    {:else}
        <AllManagers {managers} rosters={rostersData} {users}/>
    {/if}
</div>