<script>
  	import RecordsAndRankings from './RecordsAndRankings.svelte';
    import { Icon } from '@smui/tab';

    export let recordArrays, allManagers, currentYear, lastYear, headToHeadRecords, displayRecords, rosterPositions;

    let showTies = {
        match: false,
        EPE: false,
        median: false,
        bballEPE: false,
        iq: false,
        iqEPE: false,
        bball: false,
    }

    let displayPositionRecord = 'ALL';
    let displayAcquisition = 'ALL';
    let displayYear = currentYear;
    let selection = 'regular';
    let headsUp;
    let positions = rosterPositions[displayYear];
    let loading = false;

    const setSelected = (newPeriod, newYear, newPosition, newAcquisition) => {

        loading = true;
        for(const key in displayRecords) {
            if(displayRecords[key].stats) {
                displayRecords[key].stats = recordArrays.league.years[newYear][newPeriod][key];
            } else {
                for(const key2 in displayRecords[key]) {
                    if(displayRecords[key][key2].stats) {
                        if((newPosition != 'ALL' || newAcquisition != 'ALL') && key == 'players') {
                            if(newPosition != 'ALL') {
                                displayRecords[key][key2].stats = recordArrays.league.years[newYear][newPeriod].positions[newPosition][key2];
                            } else if(newAcquisition != 'ALL') {
                                displayRecords[key][key2].stats = recordArrays.league.years[newYear][newPeriod].acquisitions[newAcquisition][key2];
                            } 
                        } else {
                            displayRecords[key][key2].stats = recordArrays.league.years[newYear][newPeriod][key][key2];
                        }
                    } else {
                        for(const key3 in displayRecords[key][key2]) {
                            if(displayRecords[key][key2][key3].stats) {
                                displayRecords[key][key2][key3].stats = recordArrays.league.years[newYear][newPeriod][key][key2][key3];
                            } else {
                                for(const key4 in displayRecords[key][key2][key3]) {
                                    if(key3 == 'leagueAverages') {
                                        displayRecords[key][key2][key3][key4].stats = recordArrays.league.years[newYear][newPeriod][key][key3][key2][key4];

                                    } else {
                                        displayRecords[key][key2][key3][key4].stats = recordArrays.league.years[newYear][newPeriod][key][key2][key3][key4];
                                    }                                
                                }
                            }
                        }
                    }
                } 
            }
        }
        headsUp = headToHeadRecords[newPeriod].years[newYear];
        positions = rosterPositions[newYear];
        showTies.EPE = displayRecords.managerBests.epeRecords.stats.find(r => r.outcomes.EPE.T > 0) ? true : false;
        showTies.match = displayRecords.managerBests.winRecords.stats.find(r => r.outcomes.match.T > 0) ? true : false;
        showTies.median = displayRecords.managerBests.medianRecords.stats.find(r => r.outcomes.median.T > 0) ? true : false;
        showTies.bballEPE = displayRecords.managerBests.bestBalls.stats.find(r => r.outcomes.bballEPE.T > 0) ? true : false;
        showTies.iq = displayRecords.managerBests.lineupIqs.stats.find(r => r.outcomes.iq.T > 0) ? true : false;
        showTies.iqEPE = displayRecords.managerBests.lineupIqs.stats.find(r => r.outcomes.iqEPE.T > 0) ? true : false;
        showTies.bball = displayRecords.managerBests.bestBalls.stats.find(r => r.outcomes.bball.T > 0) ? true : false;
        loading = false
    }
    $: setSelected(selection, displayYear, displayPositionRecord, displayAcquisition);


</script>

<style>
    .yearContainer {
        display: inline-flex;
        position: relative;
        width: 100%;
        height: 7em;
        align-items: center;
        justify-content: space-evenly;
        background-color: var(--gcBox);
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 40%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 8px 0px rgb(0 0 0 / 24%);
    }

    .yearText {
        position: relative;
        display: inline-flex;
        text-align: center;
        justify-content: center;
        font-size: 2.25em;
        font-weight: 450;
        width: 60%;
        color: var(--gcPlayRowText);
    }

    :global(.changeYear) {
        position: relative;
        display: inline-flex;
        width: 20%;
        z-index: 1;
        font-size: 2.25em;
        cursor: pointer;
        color: #888;
        justify-content: center;
    }

    :global(.changeYear:hover) {
        color: #00316b;
    }

    .spacer {
        width: 20%;
        position: relative;
        display: inline-flex;
        margin: 0 2.5%;
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
    }

</style>

<div class="yearContainer">
    {#if loading}
        <div class="modal">Loading Records...</div>
    {:else}
        {#if displayYear > lastYear}
            <Icon class="material-icons changeYear" on:click={() => displayYear = displayYear - 1}>chevron_left</Icon>
        {:else}
            <span class="spacer" />
        {/if}  

        <div class="yearText">{displayYear} Records</div>

        {#if displayYear < currentYear}
            <Icon class="material-icons changeYear" on:click={() => displayYear = displayYear + 1}>chevron_right</Icon>
        {:else}
            <span class="spacer" />
        {/if}  
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
        projRecords = {displayRecords.managerBests.projRecords.stats}
        fptsHistories = {displayRecords.managerBests.fptsHistories.stats}
        medianRecords = {displayRecords.managerBests.medianRecords.stats}
        lineupIQs = {displayRecords.managerBests.lineupIqs.stats}
        blowouts = {displayRecords.biggestBlowouts.stats}
        closestMatchups = {displayRecords.narrowestVictories.stats}
        gamesTOPS = {displayRecords.players.gamesHighs.stats}
        weekOvers = {displayRecords.players.weekOvers.stats}
        weekUnders = {displayRecords.players.weekUnders.stats}
        seasonOvers = {displayRecords.players.seasonOvers.stats}
        seasonUnders = {displayRecords.players.seasonUnders.stats}
        gamesBests = {displayRecords.players.managerBests.gamesHighs.stats}
        weekBestOvers = {displayRecords.players.managerBests.weekOvers.stats}
        weekBestUnders = {displayRecords.players.managerBests.weekUnders.stats}
        seasonBestOvers = {displayRecords.players.managerBests.seasonOvers.stats}
        seasonBestUnders = {displayRecords.players.managerBests.seasonUnders.stats}
        blowoutBests = {displayRecords.managerBests.blowoutBests.stats}
        blowoutWorsts = {displayRecords.managerBests.blowoutWorsts.stats}
        narrowBests = {displayRecords.managerBests.narrowBests.stats}
        narrowWorsts = {displayRecords.managerBests.narrowWorsts.stats}
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
        prefix={displayYear}
        bind:selection={selection}
        bind:displayYear={displayYear}
        bind:displayPositionRecord={displayPositionRecord}
    />
