<script>
	import LinearProgress from '@smui/linear-progress';
	import { getNflState, cleanName, leagueName, homepageText, managers, gotoManager, enableBlog, getLeagueStandings, getLeagueUsers, leagueID, getAwards, round, waitForAll } from '$lib/utils/helper';
	import { Transactions, PowerRankings, HomePost, WaiverWire } from '$lib/components';
    import Standing from "$lib/Standings/Standing.svelte";
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    import { onMount } from 'svelte';

    const sortOrder = ["fptsAgainst", "fpts", "ties", "wins"]; 
    const columnOrder = [{name: "W", field: "wins"}, {name: "T", field: "ties"}, {name: "L", field: "losses"}, {name: "PF", field: "fpts"}, {name: "PA", field: "fptsAgainst"}, {name: "Streak", field: "streak"}];
    let rosters, standings, year, users;
    let showTies = false;
    let showStreak = false;

    onMount(async () => {
        const [standingsData, usersData] = await waitForAll(
            getLeagueStandings(),
            getLeagueUsers(leagueID),
        ).catch((err) => { console.error(err); });

        if(standingsData) {
            users = usersData;
            rosters = standingsData.rostersData;
            year = standingsData.yearData;
            const standingsInfo = standingsData.standingsInfo;

            for(const standingKey in standingsInfo) {
                const roster = rosters[standingsInfo[standingKey].rosterID - 1];
                standingsInfo[standingKey].fpts = round(roster.settings.fpts + (roster.settings.fpts_decimal / 100));
                standingsInfo[standingKey].fptsAgainst = round(roster.settings.fpts_against + (roster.settings.fpts_against_decimal / 100));
                standingsInfo[standingKey].streak = roster.metadata.streak;
                if(standingsInfo[standingKey].ties > 0) {
                    showTies = true;
                }
            }

            let finalStandings = Object.keys(standingsInfo).map((key) => standingsInfo[key]);

            for(const sortType of sortOrder) {
                if(!finalStandings[0][sortType] && finalStandings[0][sortType] != 0) {
                    continue;
                }
                finalStandings = [...finalStandings].sort((a,b) => b[sortType] - a[sortType]);
            }

            standings = finalStandings;
        }
    })

    let nflState = getNflState();
    let podiumsData = getAwards();

    const getNames = (name, rosterID, currentManagers) => {
		if(cleanName(name) != cleanName(currentManagers[rosterID].name)) {
			return `${name}<div class="curOwner">(${currentManagers[rosterID].name})</div>`;
		}
		return name;
	}

    let el, left;

    const resize = (w) => {
        left = el?.getBoundingClientRect() ? el?.getBoundingClientRect().left  : 0;
    }

    $: resize(innerWidth);

    let innerWidth;

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    #home {
        display: flex;
        flex-wrap: nowrap;
        position: relative;
        overflow-y: hidden;
        z-index: 1;
    }

    #main {
        flex-grow: 1;
        min-width: 320px;
        margin: 0 auto;
        padding: 60px 0;
    }

    .mainConstrained {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto 4em;
        align-content: center;
        position: relative;
        padding: 3% 0;
    }

    .text {
        padding: 0 30px;
        max-width: 620px;
        margin: 0 auto;
    }

    .leagueData {
        position: relative;
        z-index: 1;
        width: 100%;
        min-width: 470px;
        max-width: 470px;
        min-height: 100%;
		background-color: var(--ebebeb);
        border-left: var(--eee);
		box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 40%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 8px 0px rgb(0 0 0 / 24%);
    }

    @media (max-width: 950px) {
        .leagueData {
            max-width: 100%;
            min-width: 100%;
            width: 100%;
        }
        #home {
            flex-wrap: wrap;
        }
    }

    .transactions {
        display: block;
        width: 95%;
        margin: 10px auto;
    }

    .standings {
        display: block;
        width: 95%;
        margin: 10px auto 20px auto;
    }

    .homeBanner {
        font-weight: 420;
        font-size: 1.5em;
    }

    .sectionBanner {
        font-weight: 420;
        font-size: 1.5em;
        display: inline-flex;
        position: relative;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin: 0.7em 0;
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

    .modalContent {
        justify-content: center;
        align-items: center;
        color: #ededed;
    }

    .center {
        text-align: center;
    }

    h6 {
        text-align: center;
    }

    /* champ styling */
    #currentChamp {
        padding: 25px 0;
		background-color: var(--f3f3f3);
        box-shadow: 5px 0 8px var(--champShadow);
        border-left: 1px solid var(--ddd);
    }

    #champ {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto;
        cursor: pointer;
    }

    .first {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        border-radius: 100%;
        border: 1px solid #ccc;
        left: 50%;
        top: 43%;
    }

    .laurel {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 135px;
        height: auto;
        left: 50%;
        top: 50%;
    }

    h4 {
        text-align: center;
        font-size: 1.6em;
        margin: 10px;
    }

    .label {
        display: table;
        text-align: center;
        line-height: 1.1em;
        padding: 6px 20px;
        background-color: var(--fff);
        border: 1px solid #aaa;
        margin: 10px auto 0;
        cursor: pointer;
    }
    
	:global(.curOwner) {
		font-size: 0.75em;
		color: #bbb;
		font-style: italic;
	}
</style>

<div id="home">
    <div id="main">
        <div class="text">
            <h6>{leagueName}</h6>
            <!-- homepageText contains the intro text for your league, this gets edited in /src/lib/utils/leagueInfo.js -->
            {@html homepageText }
            <!-- Most recent Blog Post (if enabled) -->
            {#if enableBlog}
                <HomePost />
            {/if}
        </div>
        <PowerRankings />
        
        <div class="mainConstrained">
            <Transactions masterOffset={left} />
        </div>
    </div>
    
    <div class="leagueData">
        <div class="homeBanner">
            {#await nflState}
                <p class="center">Retrieving NFL state...</p>
                <LinearProgress indeterminate />
            {:then nflStateData}
                <p class="center">NFL {nflStateData.season} 
                    {#if nflStateData.season_type == 'pre'}
                        Preseason
                    {:else if nflStateData.season_type == 'post'}
                        Postseason
                    {:else}
                        {nflStateData.week > 0 ? `Week ${nflStateData.week}` : "Preseason"}
                    {/if}
                </p>
            {:catch error}
                <p class="center">Something went wrong: {error.message}</p>
            {/await}
        </div>

        <div id="currentChamp">
            {#await podiumsData}
                <p class="center">Retrieving awards...</p>
                <LinearProgress indeterminate />
            {:then {podiums, currentManagers}}
                {#if podiums[0]}
                    <h4>{podiums[0].year} Champ</h4>
                    <div id="champ" on:click={() => {if(managers.length) gotoManager(parseInt(podiums[0].champion.rosterID))}} >
                        <img src="{podiums[0].champion.avatar}" class="first" alt="champion" />
                        <img src="./laurel.png" class="laurel" alt="laurel" />
                    </div>
                    <span class="label" on:click={() => gotoManager(parseInt(podiums[0].champion.rosterID))} >{@html getNames(podiums[0].champion.name, podiums[0].champion.rosterID, currentManagers)}</span>
                {:else}
                    <p class="center">No former champs.</p>
                {/if}
            {:catch error}
                <p class="center">Something went wrong: {error.message}</p>
            {/await}
        </div>

        <div class="standings" bind:this={el} >
            {#await standings}
                <div class="modal">
                    <div class="modalContent">Loading Standings...</div>
                    <LinearProgress indeterminate />
                </div>
            {:then standings}
                {#if standings && standings.length}
                    <div class="sectionBanner">
                        {year} Standings
                    </div>
                    <DataTable table$aria-label="League Standings" style="width: 100%; box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);">
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
                {/if}
            {/await}
        </div>

        <div class="transactions" bind:this={el} >
            <div class="sectionBanner">Waiver Priority</div>
            <WaiverWire />
        </div>
    </div>
</div>