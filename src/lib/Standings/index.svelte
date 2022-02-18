<script>
    import { leagueName, round, creationYear, getYearMatchups, processStandings } from '$lib/utils/helper';
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import Standing from './Standing.svelte';
    import { Icon } from '@smui/tab';

    export let standingsData, usersData;

    // Least important to most important (i.e. the most important [usually wins] goes last)
    // Edit this to match your leagues settings
//     const sortOrder = ["fptsAgainst", "divisionTies", "divisionWins", "fpts", "ties", "wins"]; ORIGINAL CODE INCLUDES DIVISIONS
    const sortOrder = ["fptsAgainst", "fpts", "ties", "wins"]; 

    // Column order from left to right
//     const columnOrder = [{name: "W", field: "wins"}, {name: "T", field: "ties"}, {name: "L", field: "losses"}, {name: "Div W", field: "divisionWins"}, {name: "Div T", field: "divisionTies"}, {name: "Div L", field: "divisionLosses"}, {name: "FPTS", field: "fpts"}, {name: "FPTS Against", field: "fptsAgainst"}] ORIGINAL CODE INCLUDES DIVISIONS
    const columnOrder = [{name: "W", field: "wins"}, {name: "T", field: "ties"}, {name: "L", field: "losses"}, {name: "PF", field: "fpts"}, {name: "PA", field: "fptsAgainst"}, {name: "Streak", field: "streak"}]

    let loading = true;
    let showTies = false;
    let showStreak = true;
    let rosters, standings, year, users, currentYear, displayYear, selectedYear;
    onMount(async () => {
        const {standingsInfo, yearData, rostersData} = await standingsData;
        users = await usersData;
        rosters = rostersData;
        currentYear = yearData;
        year = yearData;
        displayYear = yearData;
        selectedYear = yearData;
        for(const standingKey in standingsInfo) {
            const roster = rosters[standingsInfo[standingKey].rosterID - 1];
            standingsInfo[standingKey].fpts = round(roster.settings.fpts + (roster.settings.fpts_decimal / 100));
            standingsInfo[standingKey].fptsAgainst = round(roster.settings.fpts_against + (roster.settings.fpts_against_decimal / 100));
            standingsInfo[standingKey].streak = roster.metadata.streak;
            if(standingsInfo[standingKey].ties > 0) showTies = true;
        }

        let finalStandings = Object.keys(standingsInfo).map((key) => standingsInfo[key]);

        for(const sortType of sortOrder) {
            if(!finalStandings[0][sortType] && finalStandings[0][sortType] != 0) continue;
            finalStandings = [...finalStandings].sort((a,b) => b[sortType] - a[sortType]);
        }

        standings = finalStandings;
        loading = false;
    })

    let innerWidth;
    let newLoading = false;
    const changeYear = async (selectedYear) => {
        showTies = false;
        newLoading = true;
        displayYear = selectedYear;
        let purpose = 'standings';
        let yearMatchups = await getYearMatchups(selectedYear, 1, purpose);

        let regularSeasonLength = yearMatchups.yearLeagueData.settings.playoff_week_start - 1;
        yearMatchups.rawData = displayYear != currentYear ? yearMatchups.rawData.slice(0, regularSeasonLength + 1) : yearMatchups.rawData.slice(0, yearMatchups.week - 1);

        let medianMatch = false;
        if(yearMatchups.yearLeagueData.settings.league_average_match == 1) medianMatch = true;
        let newStandings = {};
        
        for(let i = 0; i < yearMatchups.rawData.length; i++) {
            newStandings = processStandings(yearMatchups.rawData[i], newStandings, yearMatchups.rosters, medianMatch, yearMatchups.managers);
        }

        for(const standingKey in newStandings) {
            const roster = yearMatchups.rosters[newStandings[standingKey].rosterID - 1];
            newStandings[standingKey].fpts = round(roster.settings.fpts + (roster.settings.fpts_decimal / 100));
            newStandings[standingKey].fptsAgainst = round(roster.settings.fpts_against + (roster.settings.fpts_against_decimal / 100));
            newStandings[standingKey].streak = selectedYear >= 2021 ? roster.metadata.streak : '-';
            if(newStandings[standingKey].ties > 0) showTies = true;
        }

        let finalStandings = Object.keys(newStandings).map((key) => newStandings[key]);

        for(const sortType of sortOrder) {
            if(!finalStandings[0][sortType] && finalStandings[0][sortType] != 0) continue;
            finalStandings = [...finalStandings].sort((a,b) => b[sortType] - a[sortType]);
        }

        standings = finalStandings;
        users = yearMatchups.users;
        year = yearMatchups.year;
        rosters = yearMatchups.rosters;
        newLoading = false;
    }
    $: changeYear(selectedYear);

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }

    :global(.center) {
        text-align: center;
    }

    :global(.wrappable) {
        white-space: normal;
        line-height: 1.2em;
    }

    .standingsTable {
        width: 45%;
        overflow-x: scroll;
        margin: 0.5em 0 5em;
        justify-content: center;
        display: inline-flex;
    }

    .spacer {
        width: 20%;
    }

    :global(.changeYear) {
        font-size: 3em;
        cursor: pointer;
        color: #888;
        margin: 0 2.5%;
    }

    :global(.changeYear:hover) {
        color: #00316b;
    }

    .headingText {
        text-align: center;
        font-size: 2.25em;
        font-weight: 450;
        width: 60%;
        color: var(--gcPlayRowText);
    }

    .headingRow {
        display: inline-flex;
        position:relative;
        margin: 5em 0 2em 0;
        align-items: center;
        width: 60%;
        justify-content: center;
    }

    .modal {
        display: inline-flex;
        flex-direction: column;
        position: absolute; 
        z-index: 1; 
        width: 45%;
        height: 77%; 
        background-color: rgb(0,0,0); 
        background-color: rgba(0,0,0,0.8); 
        justify-content: center;
        align-items: center;
    }

    .columnWrap {
        display: inline-flex;
        position: relative;
        flex-direction: column;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
    }

    .modalContent {
        justify-content: center;
        align-items: center;
        color: #ededed;
    }
</style>

{#if loading}
    <!-- promise is pending -->
    <div class="loading">
        <p>Loading Standings...</p>
        <LinearProgress indeterminate />
    </div>
{:else}
    <div class="columnWrap">
        <div class="headingRow">
            {#if displayYear > creationYear}
                <Icon class="material-icons changeYear" style="width: 15%;" on:click={() => changeYear(displayYear - 1)}>chevron_left</Icon>
            {:else}
                <span class="spacer" />
            {/if}  
            <div class="headingText">{displayYear} {leagueName} Standings</div>
            {#if displayYear < currentYear}
                <Icon class="material-icons changeYear" style="width: 15%;" on:click={() => changeYear(displayYear + 1)}>chevron_right</Icon>
            {:else}
                <span class="spacer" />
            {/if}  
        </div>
        <div class="standingsTable">
            {#if newLoading}
                <div class="modal">
                    <div class="modalContent">Loading Standings...</div>
                    <LinearProgress indeterminate />
                </div>
            {/if}
            <DataTable table$aria-label="League Standings" style="width: 100%;">
                <Head> <!-- Team name  -->
                    <Row>
                        <Cell class="center">Team</Cell>
                        {#each columnOrder as column}
                            {#if (column.field != 'ties' && column.field != 'streak') || (column.field == 'ties' && showTies == true) || (column.field == 'streak' && showStreak == true)}
                                <Cell class="center wrappable">{column.name}</Cell>
                            {/if}
                        {/each}
                    </Row>
                </Head>
                <Body>
                    <!-- 	Standing	 -->
                    {#each standings as standing}
                        <Standing {columnOrder} {standing} user={users[rosters[standing.rosterID - 1].owner_id]} roster={rosters[standing.rosterID - 1]} {showTies} {showStreak} />
                    {/each}
                </Body>
            </DataTable>
        </div>
    </div>
{/if}
