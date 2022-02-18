<script>
  	import RecordsAndRankings from './RecordsAndRankings.svelte'; 

    export let allManagers, recordArrays, headToHeadRecords, displayRecords, positions;

    let showTies = {
        match: false,
        EPE: false,
        median: false,
        bballEPE: false,
        iq: false,
        iqEPE: false,
        bball: false,
    }

    let selection = 'regular';
    let displayPositionRecord = 'ALL';
    let displayAcquisition = 'ALL';
    let headsUp;
    let loading = false;

    const setSelected = (newPeriod, newPosition, newAcquisition) => {      
        loading = true;

        for(const key in displayRecords) {
            if(displayRecords[key].stats) {
                displayRecords[key].stats = recordArrays.league.alltime[newPeriod][key];
            } else {
                for(const key2 in displayRecords[key]) {
                    if(displayRecords[key][key2].stats) {
                        if((newPosition != 'ALL' || newAcquisition != 'ALL') && key == 'players') {
                            if(newPosition != 'ALL') {
                                displayRecords[key][key2].stats = recordArrays.league.alltime[newPeriod].positions[newPosition][key2];
                            } else if(newAcquisition != 'ALL') {
                                displayRecords[key][key2].stats = recordArrays.league.alltime[newPeriod].acquisitions[newAcquisition][key2];
                            } 
                        } else {
                            displayRecords[key][key2].stats = recordArrays.league.alltime[newPeriod][key][key2];
                        }
                    } else {
                        for(const key3 in displayRecords[key][key2]) {
                            if(displayRecords[key][key2][key3].stats) {
                                displayRecords[key][key2][key3].stats = recordArrays.league.alltime[newPeriod][key][key2][key3];
                            } else {
                                for(const key4 in displayRecords[key][key2][key3]) {
                                    if(key3 == 'leagueAverages') {
                                        displayRecords[key][key2][key3][key4].stats = recordArrays.league.alltime[newPeriod][key][key3][key2][key4];

                                    } else {
                                        displayRecords[key][key2][key3][key4].stats = recordArrays.league.alltime[newPeriod][key][key2][key3][key4];
                                    }
                                }
                            }
                        }
                    }
                } 
            }
        }
        headsUp = headToHeadRecords[newPeriod].alltime;
        showTies.EPE = displayRecords.managerBests.epeRecords.stats.find(r => r.outcomes.EPE.T > 0) ? true : false;
        showTies.match = displayRecords.managerBests.winRecords.stats.find(r => r.outcomes.match.T > 0) ? true : false;
        showTies.median = displayRecords.managerBests.medianRecords.stats.find(r => r.outcomes.median.T > 0) ? true : false;
        showTies.bballEPE = displayRecords.managerBests.bestBalls.stats.find(r => r.outcomes.bballEPE.T > 0) ? true : false;
        showTies.iq = displayRecords.managerBests.lineupIqs.stats.find(r => r.outcomes.iq.T > 0) ? true : false;
        showTies.bball = displayRecords.managerBests.bestBalls.stats.find(r => r.outcomes.bball.T > 0) ? true : false;
        showTies.iqEPE = displayRecords.managerBests.lineupIqs.stats.find(r => r.outcomes.iqEPE.T > 0) ? true : false;
        loading = false;
    }

    $: setSelected(selection, displayPositionRecord, displayAcquisition);

</script>

<style>
    .headingContainer {
        display: inline-flex;
        position: relative;
        width: 100%;
        height: 7em;
        background-color: var(--gcBox);
        align-items: center;
        justify-content: center;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 40%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 8px 0px rgb(0 0 0 / 24%);
    }

    .headingText {
        text-align: center;
        font-size: 2.25em;
        font-weight: 450;
        color: var(--gcPlayRowText);
    }

    .modal {
        display: inline-flex;
        position: absolute;
        width: 100%;
        align-items: center;
        justify-content: center;
        background-color: rgb(0,0,0); 
        background-color: rgba(0,0,0,0.8); 
        z-index: 1;
        font-size: 2.25em;
        font-weight: 450;
        color: var(--gcPlayRowText);
    }
</style>

<div class="headingContainer">
    {#if loading}
        <div class="modal">Loading Records...</div>
    {:else}
        <div class="headingText">All-Time Records</div>
    {/if}
</div>


<RecordsAndRankings
    {displayRecords}
    waiversData = {displayRecords.transactions.waiver.stats}
    tradesData = {displayRecords.transactions.trade.stats}
    transactions = {displayRecords.transactions.moves.stats}
    wiresData = {displayRecords.transactions.wires.stats}
    freeAgentData = {displayRecords.transactions.freeAgent.stats}
    weekRecords = {displayRecords.weekHighs.stats}
    weekLows = {displayRecords.weekLows.stats}
    seasonLongRecords = {displayRecords.periodHighs.stats}
    seasonLongLows = {displayRecords.periodLows.stats}
    {showTies}
    winRecords = {displayRecords.managerBests.winRecords.stats}
    bestBalls = {displayRecords.managerBests.bestBalls.stats}
    potentialPoints = {displayRecords.managerBests.fptsPoss.stats}
    fptsHistories = {displayRecords.managerBests.fptsHistories.stats}
    medianRecords = {displayRecords.managerBests.medianRecords.stats}
    projRecords = {displayRecords.managerBests.projRecords.stats}
    lineupIQs = {displayRecords.managerBests.lineupIqs.stats}
    blowouts = {displayRecords.biggestBlowouts.stats}
    closestMatchups = {displayRecords.narrowestVictories.stats}
    gamesTOPS = {displayRecords.players.gamesHighs.stats}
    gamesBests = {displayRecords.players.managerBests.gamesHighs.stats}
    blowoutBests = {displayRecords.managerBests.blowoutBests.stats}
    blowoutWorsts = {displayRecords.managerBests.blowoutWorsts.stats}
    narrowBests = {displayRecords.managerBests.narrowBests.stats}
    narrowWorsts = {displayRecords.managerBests.narrowWorsts.stats}
    weekBestOvers = {displayRecords.players.managerBests.weekOvers.stats}
    weekBestUnders = {displayRecords.players.managerBests.weekUnders.stats}
    seasonBestOvers = {displayRecords.players.managerBests.seasonOvers.stats}
    seasonBestUnders = {displayRecords.players.managerBests.seasonUnders.stats}
    weekOvers = {displayRecords.players.weekOvers.stats}
    weekUnders = {displayRecords.players.weekUnders.stats}
    seasonOvers = {displayRecords.players.seasonOvers.stats}
    seasonUnders = {displayRecords.players.seasonUnders.stats}
    weekBests = {displayRecords.managerBests.weekHighs.stats}
    weekWorsts = {displayRecords.managerBests.weekLows.stats}
    seasonBests = {displayRecords.managerBests.periodHighs.stats}
    seasonWorsts = {displayRecords.managerBests.periodLows.stats}
    seasonEPERecords = {displayRecords.managerBests.epeRecords.stats}
    playerSeasonTOPS = {displayRecords.players.periodHighs.stats}
    playerSeasonBests = {displayRecords.players.managerBests.periodHighs.stats}
    playerWeekTOPS = {displayRecords.players.weekHighs.stats}
    playerWeekBests = {displayRecords.players.managerBests.weekHighs.stats}
    playerWeekMissedBests = {displayRecords.players.managerBests.weekMissedHighs.stats}
    playerWeekMissedTOPS = {displayRecords.players.weekMissedHighs.stats}
    playerOverallBests = {displayRecords.players.managerBests.overallHighs.stats}
    playerOverallMissedBests = {displayRecords.players.managerBests.overallMissedHighs.stats}
    playerOverallMissedTOPS = {displayRecords.players.overallMissedHighs.stats}
    playerOverallTOPS = {displayRecords.players.overallHighs.stats}
    headToHeadRecords = {headsUp}
    {positions}
    {allManagers}
    prefix="All-Time"
    allTime={true}
    bind:selection={selection}
    bind:displayPositionRecord={displayPositionRecord}
/>
