<script>
    import Button, { Group, Label } from '@smui/button';
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'; 
	import LinearProgress from '@smui/linear-progress';
    import {loadPlayers, getLeagueStandings, getNflState, getLeagueData, getPositionTable, getTeamTable, leagueID, round} from '$lib/utils/helper';
	import Roster from '../Rosters/Roster.svelte';
	import TransactionsPage from '../Transactions/TransactionsPage.svelte';
    import { goto } from '$app/navigation';
    import ManagerFantasyInfo from './ManagerFantasyInfo.svelte';
    import ManagerAwards from './ManagerAwards.svelte';
    import { onMount } from 'svelte';
    import PositionTable from './PositionTable.svelte';
    import TeamTable from './TeamTable.svelte';
    import ManagerRecords from './ManagerRecords.svelte';
    import ManagerPositionRanks from './ManagerPositionRanks.svelte';

    export let manager, managers, rostersData, users, rosterPositions, transactions, currentManagers, prevManagers, awards, records;

    let showRoster = true;
    let viewManager = managers[manager];
    let recordManID = viewManager.managerID;

    let profilePic = viewManager.photo == '/managers/name.jpg' ? '/managers/profile-empty-gray.png' : viewManager.photo;

    let firstYear = viewManager.yearsactive[0];
    let inactiveLastYear, inactiveLastManaged;
    if(viewManager.status == "inactive") {
        showRoster = false;
        inactiveLastYear = viewManager.yearsactive[viewManager.yearsactive.length - 1];
        inactiveLastManaged = records.allManagers[recordManID];
    }

    let teamTransactions = transactions.filter(t => t.rosters.indexOf(viewManager.roster) > -1 && t.recordManIDs.includes(recordManID));

    let startersAndReserve = rostersData.startersAndReserve;
    let rosters = rostersData.rosters;
    let rosterArrNum = viewManager.roster-1;
    let roster = rosters[rosterArrNum];  
    let user = users[roster.owner_id];

    let players, playersInfo, positionsInfo, teamsInfo, nflStated, leagueDatum, standings;
    let loading = true;
    let curSeason = leagueID;
    let seasons = [];
    const currentYear = records.currentYear;

    for(const year in records.recordArrays.league.years) {
        if(!records.recordArrays.league.years[year].regular.managerBests.winRecords.find(m => m.recordManID == recordManID)) continue;
        const season = records.recordArrays.league.years[year].regular.managerBests.winRecords.find(m => m.recordManID == recordManID);
        
        seasons.push({
            year: season.year,
            wins: season.outcomes.match.W,
            losses: season.outcomes.match.L,
            ties: season.outcomes.match.T,
            fpts: season.fpts.starters.real,
            fptsAgainst: season.fpts.opp.real,
            fptspg: season.fpts.starters.realPPG,
            manager: season.manager,
            regSeasonRank: 0,
            regSeasonRankSuper: null,
            finalRank: null,
            finalRankSuper: null,
            showTies: season.outcomes.match.T > 0 ? true : false,
        });
    }

    for(const key in seasons) {
        const season = seasons[key];
        const sortOrder = ['fptsAgainst', 'fpts', 'ties', 'wins'];
        const playerSeasons = [];
        const yearManagers = managers.filter(m => m.yearsactive.includes(season.year));

        for(const yearManager of yearManagers) {
            const yearRecordManID = yearManager.managerID;
            const playerSeason = records.recordArrays.league.years[season.year].regular.managerBests.winRecords.find(m => m.recordManID == yearRecordManID);
            playerSeasons.push({
                recordManID: yearRecordManID,
                wins: playerSeason.outcomes.match.W,
                ties: playerSeason.outcomes.match.T,
                fpts: playerSeason.fpts.starters.real,
                fptsAgainst: playerSeason.fpts.opp.real,
            });
        }

        const calculateRank = (playerSeasons, sortOrder, recordManID) => {
            for(const sortType of sortOrder) {
                // if(!playerSeasons[sortType] && playerSeasons[sortType] != 0) continue;
                playerSeasons = [...playerSeasons].sort((a,b) => b[sortType] - a[sortType]);
            }
            let regSeasonRank = playerSeasons.indexOf(playerSeasons.find(p => p.recordManID == recordManID)) + 1;
            let playerSeasonRanked = playerSeasons;
            let regSeasonRankSuper;
            if(regSeasonRank == 1) {
                regSeasonRankSuper = "st";
            } else if(regSeasonRank == 2) {
                regSeasonRankSuper = "nd";
            } else if(regSeasonRank == 3) {
                regSeasonRankSuper = "rd";
            } else if(regSeasonRank > 3) {
                regSeasonRankSuper = "th";
            }            

            return {playerSeasonRanked, regSeasonRank, regSeasonRankSuper};
        }
        let {playerSeasonRanked, regSeasonRank, regSeasonRankSuper} = calculateRank(playerSeasons, sortOrder, recordManID);

        // TO-DO: need to get final ranks of managers who didn't place in either bracket
        // this bit only works because that doesn't apply in my league (12 teams, 6 playoff, 6 losers)
        for(const completedSeason in awards.finalRanks) {
            if(awards.finalRanks[completedSeason].year == season.year) {
                for(const rank in awards.finalRanks[completedSeason]) {
                    if(awards.finalRanks[completedSeason][rank]?.recordManID == recordManID) {
                        season.finalRank = rank;
                    }
                }
            }
        }

        if(season.finalRank == 1) {
            season.finalRankSuper = "st";
        } else if(season.finalRank == 2) {
            season.finalRankSuper = "nd";
        } else if(season.finalRank == 3) {
            season.finalRankSuper = "rd";
        } else if(season.finalRank > 3) {
            season.finalRankSuper = "th";
        }       

        season.regSeasonRank = regSeasonRank;
        season.regSeasonRankSuper = regSeasonRankSuper;
    }

    // Win - Loss Record
    const recordsObj = records.recordArrays.league.alltime.combined.managerBests.winRecords.find(m => m.recordManID == recordManID);
    const recordHistory = {
        wins: recordsObj.outcomes.match.W,
        losses: recordsObj.outcomes.match.L,
        ties: recordsObj.outcomes.match.T,
        winPerc: recordsObj.outcomes.match.perc,
        showTies: recordsObj.outcomes.match.T > 0 ? true : false,
    }
    // EPE Win - Loss Record
    const epeHistory = {
        wins: recordsObj.outcomes.EPE.W,
        losses: recordsObj.outcomes.EPE.L,
        ties: recordsObj.outcomes.EPE.T,
        epePerc: recordsObj.outcomes.EPE.perc,
        showTies: recordsObj.outcomes.EPE.T > 0 ? true : false,
    }
    // FPTS history
    const fptsHistory = {
        fpts: recordsObj.fpts.starters.real,
        fptsAgainst: recordsObj.fpts.opp.real,
        fptsPoss: recordsObj.fpts.starters.poss,
        iq: recordsObj.iq,
        fptspg: recordsObj.fpts.starters.realPPG,
    }
    // Median Win - Loss Record
    const medianHistory = {
        wins: recordsObj.outcomes.median.W,
        losses: recordsObj.outcomes.median.L,
        ties: recordsObj.outcomes.median.T,
        medianPerc: recordsObj.outcomes.median.perc,
        topScores: recordsObj.outcomes.EPE.top,
        bottomScores: recordsObj.outcomes.EPE.bottom,
        showTies: recordsObj.outcomes.median.T > 0 ? true : false,
    }
    // Championship icons
    let shipsTrophies = [];
    let championships = 0;
    for(const podium of awards.podiums) {
        if(podium.champion.recordManID == recordManID) championships++;
    }
    if(championships > 0) {
        for(let i = 0; i < championships; i++) {
            shipsTrophies.push(i);
        }
    }

    onMount(async () => {
        const playerData = await loadPlayers();
        playersInfo = playerData;
        players = playerData.players;

        if(playerData.stale) {
            const newPlayerData = await loadPlayers(true);
            playersInfo = newPlayerData;
            players = newPlayerData.players;
        }

        let recordManID = viewManager.managerID;
        const positionsData = await getPositionTable(recordManID);
        positionsInfo = positionsData;

        const teamsData = await getTeamTable(recordManID);
        teamsInfo = teamsData;

        loading = false;
    })
    // current standings info
    const calculateRecord = async (standings, leagueDatum, nflStated, curSeason, viewManager) => {
        const standingsData = await getLeagueStandings().catch((err) => { console.error(err); });
        standings = standingsData;
        const leagueData = await getLeagueData(curSeason).catch((err) => { console.error(err); });
        leagueDatum = leagueData;
        const nflState = await getNflState().catch((err) => { console.error(err); });
        nflStated = nflState; 

        const standingsObject = standings.standingsInfo;
        for(const standingKey in standingsObject) {
            const rosterX = standings.rostersData[standingsObject[standingKey].rosterID - 1];

            standingsObject[standingKey].fpts = round(rosterX.settings.fpts + (rosterX.settings.fpts_decimal / 100));
            standingsObject[standingKey].fptsAgainst = round(rosterX.settings.fpts_against + (rosterX.settings.fpts_against_decimal / 100));
            standingsObject[standingKey].streak = rosterX.metadata.streak;
        }

        let finalStandings = Object.keys(standingsObject).map((key) => standingsObject[key]);

        const sortOrder = ['fptsAgainst', 'fpts', 'ties', 'wins'];
        for(const sortType of sortOrder) {
            if(!finalStandings[0][sortType] && finalStandings[0][sortType] != 0) continue;
            finalStandings = [...finalStandings].sort((a,b) => b[sortType] - a[sortType]);
        }

        standingsRank = finalStandings.indexOf(finalStandings.find(m => m.rosterID == viewManager.roster)) + 1;
    
        if(standingsRank == 1) {
            rankSuper = "st";
        } else if(standingsRank == 2) {
            rankSuper = "nd";
        } else if(standingsRank == 3) {
            rankSuper = "rd";
        } else if(standingsRank > 3) {
            rankSuper = "th";
        }

        if(leagueDatum.status == "complete" || nflStated.season_type == "pre" || viewManager.status == "inactive") {
            showRecord = false;
        } else {
            showRecord = true;
            wins = standings.standingsInfo[viewManager.roster].wins;
            losses = standings.standingsInfo[viewManager.roster].losses;
            ties = standings.standingsInfo[viewManager.roster].ties;
            showTies = ties == 0 ? false : true;
        }

        return {wins, losses, ties, showTies, showRecord, standingsRank, rankSuper};
    }

    let { wins, losses, ties, showTies, showRecord, standingsRank, rankSuper } = calculateRecord(standings, leagueDatum, nflStated, curSeason, viewManager);

    const changeManager = (newManager, noscroll = false) => {
        manager = newManager;
        recordManID = newManager;
        viewManager = managers[newManager];

        teamTransactions = transactions.filter(t => t.rosters.indexOf(viewManager.roster) > -1);

        startersAndReserve = rostersData.startersAndReserve;
        rosters = rostersData.rosters;
        showRecord = viewManager.status == 'active' ? true : false;
        rosterArrNum = viewManager.roster-1;
        roster = rosters[rosterArrNum];
        user = users[roster.owner_id];
        goto(`/managers?manager=${manager}`, {noscroll})
    }

    let el, masterOffset, innerWidth;

    const setOffset = (w) => {
        return el?.getBoundingClientRect() ? el?.getBoundingClientRect().left  : 0;
    }

    $: masterOffset = setOffset(innerWidth);
</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    .managerContainer {
        width: 100%;
        margin: 2em 0 5em;
        position: relative;
        display: inline-flex;
        flex-direction: column;
    }

    .managerConstrained {
        width: 75em;
        min-height: 60em;
        margin: 0 auto 4em;
        position: relative;
        display: inline-flex;
        flex-direction: column;
    }

    .pancakeTables {
        width: 100%;
        position: relative;
        display: inline-flex;
    }

    .managerBlock {
        position: relative;
        width: 100%;
        min-height: 100%;
		background-color: var(--gcBanner);
		box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 40%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 8px 0px rgb(0 0 0 / 24%);
    }

    #managerName {
        display: inline-flex;
        position: relative;
        width: 100%;
        padding: 15px 0;
		background-color: var(--gcMain);
        box-shadow: 5px 0 8px var(--champShadow);
    }

    .managerNamed {
        display: inline-flex;
        position: relative;
        flex-direction: column;
		background-color: var(--gcMain);
        text-align: left;
        vertical-align: top;
        font-size: 2em;
        margin: 0.2em 0em 0em;
        line-height: 1.3em;
    }

    .teamSub {
        font-size: 0.47em;
        line-height: 1em;
        text-align: left;
        margin: 10px 0 0 0;
        color: var(--gcPlayText);
    }

    .managerPlacement {
        display: inline-flex;
		background-color: var(--gcMain);
        position: relative;
        right: 0.7em;
        text-align: left;
        vertical-align: top;
        font-size: 2em;
        margin: 0.2em 0em 0em 1.7em ;
        line-height: 1em;
    }

    .managerRecord {
        display: inline-block;
		background-color: var(--gcMain);
        position: relative;
        right: 0.7em;
        text-align: left;
        vertical-align: top;
        font-size: 2em;
        margin: 2em 0em 0em 1.7em ;
        line-height: 1em;
    }

    .managerPhoto {
        display: inline-flex;
        border-radius: 20%;
        width: 20%;
        max-width: 200px;
        height: auto;
        margin: 0.15em 1em 0.15em;
        box-shadow: 0 0 8px 4px #aaa;
    }

    .shipsTrophies {
        max-width: 20px;
        max-height: 60px;
        margin: 10px 0 0 0;
    }

    .historyProfile {
        position: relative;
        display: inline-flex;
        min-height: 40em;
        width: 100%;
		background-color: var(--gcBox);
		box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 40%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 8px 0px rgb(0 0 0 / 24%);
    }

    .profileRow {
        position: relative;
        display: inline-flex;
        width: 100%;
        align-items: center;
        justify-content: center;
    }

    .seasonHistoryRow {
        position: relative;
        display: inline-flex;
        width: 98%;
        height: 2.5em;
        align-items: center;
        border: 0.25px solid var(--gcBanner);
        border-radius: 0.65em;
        margin: 0.5% 0;
    }

    .seasonHistoryContent {
        display: inline-flex;
        position: relative;
        justify-content: flex-start;
        margin: 0 1%;
        font-size: 0.85em;
    }

    .winRecordWrap {
        display: inline-flex;
        position: relative;
        width: 100%; 
    }

    .columnWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 50%;
        height: 100%;
        align-items: center;
        color: var(--gcBannerText);
    }

    .seasonHistory {
        width: 100%;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        display: inline-flex;
        position: relative;
        background-color: var(--gcComponent);
    }

    .overallHistory {
        width: 98%;
        position: relative;
        display: inline-flex;
        justify-content: center;
        background-color: var(--gcComponent);
        padding: 1%;
    }

    .summaryHeadings {
        display: inline-flex;
        position: relative;
        justify-content: space-evenly;
        align-items: center;
        vertical-align: center;
        background-color: var(--gcBanner);
        height: 8%;
        width: 100%;
    }

    .summaryHeadings span {
        color: var(--gcPlayRowText);
        font-size: 0.9em;
    }

    .summaryChild {
        font-style: italic;
    }

    .rosterContainer {
        width: 100%;
        height: 100%;
        display: inline-flex;
        position: relative;
        justify-content: center;
        align-items: center;
    }

    :global(.historyTable) {
        box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);
        margin: 0em;
        font-size: 0.6em;
    }

    :global(.historyTable th) {
        font-size: 1.5em;
        padding: 5px;
        height: 50px;
    }
    :global(.historyTable span) {
        font-size: 1.5em;
        padding: 5px;
        height: 50px;
    }
    :global(.historyTable td) {
        font-size: 1em;
        padding: 7px;
        height: 30px;
    }

    :global(.header) {
        text-align: center;
    }

    :global(.teamName) {
        text-align: left;
    }

    h3 {
        text-align: center;
        font-size: 1.5em;
        margin: 1.5em 0 0.5em;
        font-weight: 200;
    }

    .basicInfo {
        display: inline-flex;
        position: relative;
        justify-content: space-evenly;
        align-items: center;
        height: 50px;
        width: 100%;
    }

    .basicInfo span {
        color: var(--gcPlayRowText);
        font-size: 0.9em;
    }

    .infoChild {
        font-style: italic;
    }

    .infoContact {
        height: 20px;
        vertical-align: middle;
        padding-left: 1em;
    }

    .infoTeam {
        height: 48px;
    }

    .bio {
        margin: 2em 1.5em 2em;
        text-indent: 4em;
    }

    .philosophy {
        margin: 2em 1.5em 2em;
        text-indent: 4em;
    }

    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }

    .managerNav {
        margin: 4em 0 2em;
        text-align: center;
    }

    .upper {
        margin-top: 0;
    }

    /* media queries */

    @media (max-width: 505px) {
        :global(.selectionButtons span) {
            font-size: 0.8em;
        }
    }

    @media (max-width: 435px) {
        :global(.selectionButtons span) {
            line-height: 1.2em;
            font-size: 0.8em;
        }
    }

	@media (max-width: 450px) {

        .basicInfo {
            height: 20px;
        }

        .basicInfo span {
            font-size: 0.75em;
        }

        .infoTeam {
            height: 30px;
        }
	}

    @media (max-width: 370px) {

        .basicInfo {
            height: 18px;
        }

        .basicInfo span {
            font-size: 0.6em;
        }

        .infoTeam {
            height: 24px;
        }
    }
</style>

<div class="managerContainer">
    <div class="managerConstrained">
        <div class="managerNav upper">
            <Group variant="outlined">
                {#if manager == 0}
                    <Button disabled class="selectionButtons" on:click={() => changeManager(parseInt(manager) - 1, true)} variant="outlined">
                        <Label>Previous Manager</Label>
                    </Button>
                {:else}
                    <Button class="selectionButtons" on:click={() => changeManager(parseInt(manager) - 1, true)} variant="outlined">
                        <Label>Previous Manager</Label>
                    </Button>
                {/if}
                <Button class="selectionButtons" on:click={() => goto('/managers')} variant="outlined">
                    <Label>All Managers</Label>
                </Button>
                {#if manager == managers.length - 1}
                    <Button disabled class="selectionButtons" on:click={() => changeManager(parseInt(manager) + 1, true)} variant="outlined">
                        <Label>Next Manager</Label>
                    </Button>
                {:else}
                    <Button class="selectionButtons" on:click={() => changeManager(parseInt(manager) + 1, true)} variant="outlined">
                        <Label>Next Manager</Label>
                    </Button>
                {/if}
            </Group>
        </div>
        <div class="managerBlock">
            <div id="managerName">
                <div class="columnWrap" style="flex-direction: row;">
                    <img class="managerPhoto" src="{profilePic}" alt="manager"/>
                    <div class="managerNamed">
                        {viewManager.name}
                        <br>
                        {#if showRoster}
                            <div class="teamSub">{roster.co_owners ? 'Co-' : ''}Manager: <i>{user.metadata.team_name ? user.metadata.team_name : user.display_name}</i></div>
                        {:else}
                            <div class="teamSub">Last Managed: <i>{inactiveLastManaged.name}</i></div>
                        {/if}
                        {#each shipsTrophies as shipsTrophy}
                            <img class="shipsTrophies" src="/awards/champion.png" alt={shipsTrophy}/>                
                        {/each}
                    </div>
                </div>
                {#if showRecord}
                    <div class="columnWrap" style="align-items: flex-end;">
                        <div class="managerPlacement">{standingsRank}<sup>{rankSuper}</sup></div>
                        <div class="managerRecord">{showTies ? '(' + wins + ' - ' + ties + ' - ' + losses + ')' : '(' + wins + ' - ' + losses + ')'}</div>
                    </div>
                {/if}
            </div>
        </div>
        <div class="managerBlock">
            <div class="basicInfo">
                <span class="infoChild">{viewManager.location || 'Undisclosed Location'}</span>
                {#if viewManager.fantasyStart}
                    <!-- fantasyStart is an optional field -->
                    <span class="seperator">|</span>
                    <span class="infoChild">{showRoster ? 'Joined ' + firstYear : 'Managed ' + firstYear + ' - ' + inactiveLastYear}</span>
                {/if}
                {#if viewManager.preferredContact}
                    <!-- preferredContact is an optional field -->
                    <span class="seperator">|</span>
                    <span class="infoChild">{viewManager.preferredContact}<img class="infoChild infoContact" src="/{viewManager.preferredContact}.png" alt="favorite team"/></span>
                {/if}
                <!-- <span class="infoChild">{viewManager.preferredContact}</span> -->
                {#if viewManager.favoriteTeam}
                    <!-- favoriteTeam is an optional field -->
                    <span class="seperator">|</span>
                    <img class="infoChild infoTeam" src="https://sleepercdn.com/images/team_logos/nfl/{viewManager.favoriteTeam}.png" alt="favorite team"/>
                {/if}
            </div>
        </div>
        <div class="historyProfile">
            <div class="columnWrap">
                <div class="seasonHistory">
                    <div class="profileRow" style="font-size: 1.5em; font-weight 420; padding: 2%;">Season History</div>
                    {#if seasons && seasons.length}
                        {#each seasons as season}
                            <div class="seasonHistoryRow">
                                <div class="seasonHistoryContent" style="width: 7%; font-size: 1em;">{season.year}</div>
                                <div class="seasonHistoryContent" style="width: 28%;">{season.manager.name}</div>
                                <div class="seasonHistoryContent" style="width: 2%; justify-content: center;">{season.wins}</div>
                                {#if season.showTies}
                                    <div class="seasonHistoryContent" style="width: 1%; justify-content: center;">-</div>
                                    <div class="seasonHistoryContent" style="width: 2%; justify-content: center;">{season.ties}</div>
                                {/if}
                                <div class="seasonHistoryContent" style="width: 1%; justify-content: center;">-</div>
                                <div class="seasonHistoryContent" style="width: 2%; justify-content: center;">{season.losses}</div>
                                <div class="seasonHistoryContent" style="width: 10%; justify-content: center; margin: 0 1%;">{round(season.fpts)}</div>
                                <div class="seasonHistoryContent" style="width: 10%; justify-content: center; margin: 0 1%;">{round(season.fptsAgainst)}</div>
                                <div class="seasonHistoryContent" style="width: 10%; justify-content: center; margin: 0 1%;">{round(season.fptspg)}</div>
                                <div class="seasonHistoryContent" style="width: 4%; justify-content: center; margin: 0 1%;">{season.regSeasonRank}</div>
                                {#if season.finalRank}
                                    <div class="seasonHistoryContent" style="width: 4%; justify-content: center; margin: 0 1%;">{season.finalRank}</div>
                                {:else}
                                    <div class="seasonHistoryContent" style="width: 4%; justify-content: center; margin: 0 1%;">-</div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                    <div class="profileRow" style="font-size: 1.5em; font-weight 420; padding: 2%;">Manager History</div>
                    <div class="winRecordWrap">
                        <div class="columnWrap" style="width: 33.333%; align-items: flex-start;">
                            <div class="profileRow">Win Records</div>
                            <div class="seasonHistoryRow">
                                <div class="seasonHistoryContent" style="width: 20%; padding: 0 3%; margin: 0;">TOT:</div>
                                <div class="seasonHistoryContent" style="width: 25%; justify-content: center; margin: 0;">{round(recordHistory.winPerc)}%</div>
                                <div class="seasonHistoryContent" style="width: 55%; justify-content: space-evenly; margin: 0;">
                                    <div class="seasonHistoryContent">{recordHistory.wins}</div>
                                    {#if recordHistory.showTies}
                                        <div class="seasonHistoryContent">-</div>
                                        <div class="seasonHistoryContent">{recordHistory.ties}</div>
                                    {/if}
                                    <div class="seasonHistoryContent">-</div>
                                    <div class="seasonHistoryContent">{recordHistory.losses}</div>
                                </div>
                            </div>
                            <div class="seasonHistoryRow">
                                <div class="seasonHistoryContent" style="width: 20%; padding: 0 3%; margin: 0;">EPE:</div>
                                <div class="seasonHistoryContent" style="width: 25%; justify-content: center; margin: 0;">{round(epeHistory.epePerc)}%</div>
                                <div class="seasonHistoryContent" style="width: 55%; justify-content: space-evenly; margin: 0;">
                                    <div class="seasonHistoryContent">{epeHistory.wins}</div>
                                    {#if epeHistory.showTies}
                                        <div class="seasonHistoryContent">-</div>
                                        <div class="seasonHistoryContent">{epeHistory.ties}</div>
                                    {/if}
                                    <div class="seasonHistoryContent">-</div>
                                    <div class="seasonHistoryContent">{epeHistory.losses}</div>
                                </div>
                            </div>
                            <div class="seasonHistoryRow">
                                <div class="seasonHistoryContent" style="width: 20%; padding: 0 3%; margin: 0;">AVG:</div>
                                <div class="seasonHistoryContent" style="width: 25%; justify-content: center; margin: 0;">{round(medianHistory.medianPerc)}%</div>
                                <div class="seasonHistoryContent" style="width: 55%; justify-content: space-evenly; margin: 0;">
                                    <div class="seasonHistoryContent">{medianHistory.wins}</div>
                                    {#if medianHistory.showTies}
                                        <div class="seasonHistoryContent">-</div>
                                        <div class="seasonHistoryContent">{medianHistory.ties}</div>
                                    {/if}
                                    <div class="seasonHistoryContent">-</div>
                                    <div class="seasonHistoryContent">{medianHistory.losses}</div>
                                </div>
                            </div>
                        </div>
                        <div class="columnWrap" style="width: 33.333%; align-items: flex-start;">
                            <div class="profileRow">Scoring</div>
                            <div class="seasonHistoryRow">
                                <div class="seasonHistoryContent" style="width: 50%; padding: 0 3%; justify-content: flex-end; margin: 0;">PF:</div>
                                <div class="seasonHistoryContent" style="width: 48%; padding: 0 3%; justify-content: center; margin: 0 2% 0 0;">{round(fptsHistory.fpts)}</div>
                            </div>
                            <div class="seasonHistoryRow">
                                <div class="seasonHistoryContent" style="width: 50%; padding: 0 3%; justify-content: flex-end; margin: 0;">PA:</div>
                                <div class="seasonHistoryContent" style="width: 48%; padding: 0 3%; justify-content: center; margin: 0 2% 0 0;">{round(fptsHistory.fptsAgainst)}</div>
                            </div>
                            <div class="seasonHistoryRow">
                                <div class="seasonHistoryContent" style="width: 50%; padding: 0 3%; justify-content: flex-end; margin: 0;">PPG:</div>
                                <div class="seasonHistoryContent" style="width: 48%; padding: 0 3%; justify-content: center; margin: 0 2% 0 0;">{round(fptsHistory.fptspg)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="columnWrap">
                <div class="rosterContainer">
                    {#if loading}
                    <!-- promise is pending -->
                    <div class="loading">
                        <p>Retrieving players...</p>
                        <LinearProgress indeterminate />
                    </div>
                    {:else}
                        {#if showRoster == true}
                            <Roster division="1" expanded={false} {rosterPositions} {roster} {users} {players} {startersAndReserve} />
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <!-- <div class="managerConstrained">
        <p class="bio">{@html viewManager.bio}</p>

        {#if viewManager.philosophy}
            philosophy is an optional field
            <h3>Team Philosophy</h3>
            <p class="philosophy">{@html viewManager.philosophy}</p>
        {/if}
    </div> -->
    <div class="managerConstrained">
        {#if !loading}
            <!-- Favorite player -->
            <ManagerFantasyInfo {viewManager} {players} {records} />
        {/if}

        <ManagerPositionRanks {recordManID} {records} />

        <ManagerAwards {recordManID} {awards} {records} {roster} />

        <ManagerRecords {recordManID} {firstYear} {currentYear} {records} />
    </div>

    <div class="managerConstrained" style="min-height: auto">
        <div class="pancakeTables">
            <div class="columnWrap">
                {#if loading}
                    Loading positions records...
                {:else}
                    <PositionTable {positionsInfo} />
                {/if}
            </div>
            <div class="columnWrap">
                {#if loading}
                    Loading teams records...
                {:else}
                    <TeamTable {teamsInfo} />
                {/if}
            </div>
        </div>
    </div>

    <h3>Team Transactions</h3>
    <div class="managerConstrained" bind:this={el}>
        {#if loading}
            <!-- promise is pending -->
            <div class="loading">
                <p>Retrieving players...</p>
                <LinearProgress indeterminate />
            </div>
        {:else}
            <TransactionsPage {playersInfo} transactions={teamTransactions} {currentManagers} {prevManagers} {masterOffset} show='both' query='' page={0} perPage={5} />
        {/if}
    </div>

    <div class="managerNav">
        <Group variant="outlined">
            {#if manager == 0}
                <Button disabled class="selectionButtons" on:click={() => changeManager(parseInt(manager) - 1)} variant="outlined">
                    <Label>Previous Manager</Label>
                </Button>
            {:else}
                <Button class="selectionButtons" on:click={() => changeManager(parseInt(manager) - 1)} variant="outlined">
                    <Label>Previous Manager</Label>
                </Button>
            {/if}
            <Button class="selectionButtons" on:click={() => goto('/managers')} variant="outlined">
                <Label>All Managers</Label>
            </Button>
            {#if manager == managers.length - 1}
                <Button disabled class="selectionButtons" on:click={() => changeManager(parseInt(manager) + 1)} variant="outlined">
                    <Label>Next Manager</Label>
                </Button>
            {:else}
                <Button class="selectionButtons" on:click={() => changeManager(parseInt(manager) + 1)} variant="outlined">
                    <Label>Next Manager</Label>
                </Button>
            {/if}
        </Group>
    </div>

</div>