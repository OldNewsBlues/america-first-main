<script>
    import { getNflScoreboard, managers, nflTeams, creationYear, getYearMatchups } from '$lib/utils/helper'; 
    import Scoreboard from './Scoreboard.svelte';
    import PlayByPlay from './PlayByPlay.svelte';
    import GameBox from './GameBox.svelte';
    import ManagerBoard from './ManagerBoard.svelte';
    import { Icon } from '@smui/tab';
    import LinearProgress from '@smui/linear-progress';

    export let nflWeek, matchupsInfo, standingsData, playersInfo, nflPlayerInfo;

    let fantasyProducts = {};
    let completeGames = [];
    let gameSelection, matchSelection, viewPlayerID, leaderBoardInfo;
    let showGameBox = true;
    let showMatchBox = false;

    let managerSelection = 0;

    let nflMatchups = nflWeek.nflWeek;
    const week = matchupsInfo.week;
    const season = matchupsInfo.yearLeagueData.season;

    let leagueManagers = {};
    let managerInfo = {};
    let fantasyStarters = {};
    let positionLeaders = {};
    let weekMatchups = matchupsInfo.matchupWeeks[matchupsInfo.week - 1].matchups; 
    let yearLeagueData = matchupsInfo.yearLeagueData;
    let rosterData = matchupsInfo.rosters;
    let users = matchupsInfo.users;
    let currentYear = null;

    const year = parseInt(yearLeagueData.season);
    if(!currentYear) currentYear = year;

    for(const manager of managers) {
		if(!leagueManagers[manager.roster]) leagueManagers[manager.roster] = [];

		leagueManagers[manager.roster].push({
			managerID: manager.managerID,
			rosterID: manager.roster,
			name: manager.name,
            abbreviation: manager.abbreviation,
			status: manager.status,
			yearsactive: manager.yearsactive,
		});
	}

    let weekSelection = week;
    let yearSelection = year;
    let newLoading = false;
    const changeWeek = async (newWeekSelection) => {
        newLoading = true;
        weekSelection = newWeekSelection;
        weekMatchups = matchupsInfo.matchupWeeks[newWeekSelection - 1].matchups;
        completeGames = [];

        let newNflMatchups = await getNflScoreboard(yearSelection, newWeekSelection).catch((err) => { console.error(err); });;
        viewPlayerID = null;
        if(newNflMatchups.nflWeek) {
            nflMatchups = newNflMatchups.nflWeek;
            gameSelection = nflMatchups[0][0].gameID;
            newLoading = false;
        }
    }

    const changeYearSelection = async (newYearSelection) => {
        newLoading = true;
        yearSelection = newYearSelection;
        completeGames = [];
        if(newYearSelection == year) {
            weekSelection = week;
        } else {
            weekSelection = 1;
        }

        let newNflMatchups = await getNflScoreboard(newYearSelection, weekSelection).catch((err) => { console.error(err); });;
        if(newNflMatchups.nflWeek) {
            nflMatchups = newNflMatchups.nflWeek;
        }

        let purpose = 'gameCenter';
        let newYearMatchups = await getYearMatchups(newYearSelection, weekSelection, purpose).catch((err) => { console.error(err); });;
        viewPlayerID = null;
        if(newYearMatchups.matchupWeeks) {
            weekMatchups = newYearMatchups.matchupWeeks[weekSelection - 1].matchups;
            matchupsInfo = newYearMatchups;
            yearLeagueData = newYearMatchups.yearLeagueData;
            rosterData = newYearMatchups.rosters;
            users = newYearMatchups.users;
            gameSelection = nflMatchups[0][0].gameID;
            newLoading = false;
        }
    }

    const getStarters = (weekMatchups) => {
        fantasyStarters = {};
        for(const key in rosterData) {
            const roster = rosterData[key];
            const rosterID = roster.roster_id;
            const user = users[roster.owner_id];

            const recordManager = leagueManagers[rosterID].find(m => m.yearsactive.includes(year));
            const recordManID = recordManager.managerID;
            if(user) {
                managerInfo[recordManID] = {
                    avatar: user.avatar != null ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : `https://sleepercdn.com/images/v2/icons/player_default.webp`,
                    name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
                    realname: recordManager.name,
                    abbreviation: recordManager.abbreviation,
                    rosterID,
                    recordManID,
                };
            } else {
                managerInfo[recordManID] = {
                    avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
                    name: 'Unknown Manager',
                    realname: 'John Q. Rando',
                    abbreviation: 'JQR',
                    rosterID,
                    recordManID,
                };
            }
            
            // get starters
            for(const matchup in weekMatchups) {
                const match = weekMatchups[matchup];
                
                if(match.find(m => m.recordManID == recordManID)) {
                    fantasyStarters[recordManID] = {
                        players: match.find(m => m.recordManID == recordManID).players,
                        starters: match.find(m => m.recordManID == recordManID).starters,
                        startersPoints: match.find(m => m.recordManID == recordManID).points,
                    }
                    break;
                }
            }
        }
    }
    $: getStarters(weekMatchups);

    //get position leaders
    const getPositionLeaders = (weekMatchups) => {
        positionLeaders = {};
        for(const matchup in weekMatchups) {
            const match = weekMatchups[matchup];
            for(const managerKey in match) {
                const managerWeek = match[managerKey];
                for(let i = 0; i < managerWeek.starters.length; i++) {
                    if(managerWeek.starters[i] == '0') {
                        continue;
                    } else {
                        if(playersInfo.players[managerWeek.starters[i]].pos == 'DEF' && !positionLeaders['DEF']) {
                            positionLeaders['DEF'] = [];
                        } else if(playersInfo.players[managerWeek.starters[i]].pos != 'DEF' && !positionLeaders[playersInfo.players[managerWeek.starters[i]].pos]) {
                            positionLeaders[playersInfo.players[managerWeek.starters[i]].pos] = []; 
                        }
                        const team = playersInfo.players[managerWeek.starters[i]].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == managerWeek.starters[i]).espnAbbreviation : nflPlayerInfo[managerWeek.starters[i]] && nflPlayerInfo[managerWeek.starters[i]].espn.t[yearSelection].length > 1 && nflPlayerInfo[managerWeek.starters[i]].espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection) ? nflPlayerInfo[managerWeek.starters[i]].espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection).team : playersInfo.players[managerWeek.starters[i]].wi[yearSelection][weekSelection] && playersInfo.players[managerWeek.starters[i]].wi[yearSelection][weekSelection].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[managerWeek.starters[i]].wi[yearSelection][weekSelection].t).espnAbbreviation : playersInfo.players[managerWeek.starters[i]].wi[yearSelection][1] && playersInfo.players[managerWeek.starters[i]].wi[yearSelection][1].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[managerWeek.starters[i]].wi[yearSelection][1].t).espnAbbreviation : nflPlayerInfo[managerWeek.starters[i]] ? nflPlayerInfo[managerWeek.starters[i]].espn.t[yearSelection][0] : 'NONE';
                        const entry = {
                            playerID: managerWeek.starters[i],
                            pos: playersInfo.players[managerWeek.starters[i]].pos == 'DEF' ? 'DEF' : playersInfo.players[managerWeek.starters[i]].pos,
                            fpts: managerWeek.points[i],
                            owner: managerWeek.manager,
                            recordManID: managerWeek.recordManID,
                            fn: playersInfo.players[managerWeek.starters[i]].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == managerWeek.starters[i]).fn : playersInfo.players[managerWeek.starters[i]].fn,
                            ln: playersInfo.players[managerWeek.starters[i]].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == managerWeek.starters[i]).ln : playersInfo.players[managerWeek.starters[i]].ln,
                            t: team,
                            avatar: playersInfo.players[managerWeek.starters[i]].pos == "DEF" ? `https://sleepercdn.com/images/team_logos/nfl/${managerWeek.starters[i].toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${managerWeek.starters[i]}.jpg`,
                            teamAvatar: team ? `https://sleepercdn.com/images/team_logos/nfl/${nflTeams.find(t => t.espnAbbreviation == team).sleeperID.toLowerCase()}.png` : null,
                            teamColor: team ? `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).color}6b` : null,
                            teamAltColor: team ? `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).alternateColor}52` : null,
                        }
                        if(playersInfo.players[managerWeek.starters[i]].pos == 'DEF') {
                            positionLeaders['DEF'].push(entry);
                        } else if(playersInfo.players[managerWeek.starters[i]].pos == 'DB' || playersInfo.players[managerWeek.starters[i]].pos == 'CB' || playersInfo.players[managerWeek.starters[i]].pos == 'SS' || playersInfo.players[managerWeek.starters[i]].pos == 'FS') {
                            positionLeaders['DB'].push(entry);
                        } else if(playersInfo.players[managerWeek.starters[i]].pos == 'LB') {
                            positionLeaders['LB'].push(entry);
                        } else if(playersInfo.players[managerWeek.starters[i]].pos == 'DL' || playersInfo.players[managerWeek.starters[i]].pos == 'DE' || playersInfo.players[managerWeek.starters[i]].pos == 'DT') {
                            positionLeaders['DL'].push(entry);
                        } else {
                            positionLeaders[playersInfo.players[managerWeek.starters[i]].pos].push(entry);
                        }
                    }
                }
            }
        }
        // sort position leaders
        for(const key in positionLeaders) {
            positionLeaders[key] = positionLeaders[key].sort((a, b) => b.fpts - a.fpts);
        }
    }
    $: getPositionLeaders(weekMatchups);


</script>

<style>
    .default {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .banner {
        position: absolute;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 5%;
        width: 100%;
        background-color: var(--gcBox);
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 40%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 3px 2px rgb(0 0 0 / 40%);
    }

    .mainWrapper {
        width: 100%;
        height: 100%;
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
    }

    .mainConstrained {
        width: 100%;
        min-height: 132em;
        max-width: 1500px;
        margin: 0 auto 4em;
        background-color: var(--gcMain);
        display: inline-flex;
        align-content: center;
        position: relative;
        border-radius: 3em;
        padding: 3% 0;
    }

    .weekInfo {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 5%;
        width: 100%;
        color: var(--gcBannerText);
        font-size: 1.5em;
        font-weight: 500;
        margin: 0 0 2% 0;
    }

    .weekInfoSeason {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 50%;
    }

    .weekInfoWeek {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 50%;
    }

    .scoreboard {
        position: relative;
        display: inline-flex;
        height: 95%;
        flex-direction: column;
        justify-content: center;
    }

    .managerboard {
        position: relative;
        display: inline-flex;
        height: 95%;
        flex-direction: column;
        justify-content: flex-start;
    }

    .leftWrapper {
        display: inline-flex;
        flex-direction: column;
        position:relative;
        width: 20%;
        height: 100%;
        justify-content: center;
        align-items: center;
    }

    .centerWrapper {
        display: inline-flex;
        flex-direction: column;
        position:relative;
        width: 58%;
        margin: 9% 1% 2%;
        align-content: center;
        align-items: center;
    }
    .rightWrapper {
        display: inline-flex;
        flex-direction: column;
        position:relative;
        width: 20%;
        height: 100%;
        justify-content: flex-start;
        align-items: center;
    }

    .gameBox {
        display: inline-flex;
        flex-direction: column;
        width: 100%;
        position: relative;
        align-items: center;
        justify-content: center;
        align-content: center;
        align-self: center;
    }

    .playByPlay {
        display: inline-flex;
        flex-direction: column;
        position: relative;
        align-items: center;
        width: 102%;
        min-height: 72em;
        max-height: 92em;
    }

    :global(.changeWeekSelection) {
        cursor: pointer;
        color: #888;
        transform: rotate(90deg) scale(2.2);
        margin: 0.5em 0;
    }

   :global(.changeWeekSelection:hover) {
        color: #00316b;
    }

    .spacer {
        height: 48px;
    }

    .modal {
        display: inline-flex;
        flex-direction: column;
        position: absolute; 
        z-index: 1; 
        width: 100%;
        height: 99%; 
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
</style>

<div class="mainWrapper">
    <div class="mainConstrained">
        <div class="banner" />
        <div class="leftWrapper">
            <div class="weekInfo">
                <div class="weekInfoSeason">
                    {#if yearSelection < season}
                        <Icon class="material-icons changeWeekSelection" on:click={() => changeYearSelection(yearSelection + 1)}>chevron_left</Icon>
                    {:else}
                        <div class ="spacer" />
                    {/if}
                    <div class="default" style="height: 33.333%;" >{yearSelection}</div>
                    {#if yearSelection > creationYear}
                        <Icon class="material-icons changeWeekSelection" on:click={() => changeYearSelection(yearSelection - 1)}>chevron_right</Icon>
                    {:else}
                        <div class ="spacer" />
                    {/if}
                </div>
                <div class="weekInfoWeek">
                    {#if weekSelection < 17}
                        <Icon class="material-icons changeWeekSelection" on:click={() => changeWeek(weekSelection + 1)}>chevron_left</Icon>
                    {:else}
                        <div class ="spacer" />
                    {/if}
                    <div class="default" style="height: 33.333%;" >Week {weekSelection}</div>
                    {#if weekSelection > 1}
                        <Icon class="material-icons changeWeekSelection" on:click={() => changeWeek(weekSelection - 1)}>chevron_right</Icon>
                    {:else}
                        <div class ="spacer" />
                    {/if}
                </div>
            </div>
            <div class="scoreboard">
                {#if newLoading}
                    <div class="modal">
                        <div class="modalContent">Loading NFL Scores...</div>
                        <LinearProgress indeterminate />
                    </div>
                {/if}
                <Scoreboard {nflMatchups} bind:gameSelection={gameSelection} {completeGames} bind:showGameBox={showGameBox} bind:showMatchBox={showMatchBox} />
            </div>
        </div>
        <div class="centerWrapper">
            <div class="gameBox">
                <GameBox {nflTeams} {nflMatchups} bind:newLoading={newLoading} bind:weekSelection={weekSelection} bind:yearSelection={yearSelection} {currentYear} bind:yearLeagueData={yearLeagueData} {playersInfo} {nflPlayerInfo} bind:fantasyStarters={fantasyStarters} bind:positionLeaders={positionLeaders} bind:managerInfo={managerInfo} bind:weekMatchups={weekMatchups} {standingsData} bind:managerSelection={managerSelection} bind:matchSelection={matchSelection} bind:fantasyProducts={fantasyProducts} bind:gameSelection={gameSelection} bind:viewPlayerID={viewPlayerID} bind:showGameBox={showGameBox} bind:showMatchBox={showMatchBox} bind:leaderBoardInfo={leaderBoardInfo} />
            </div>
            <div class="playByPlay">
                <PlayByPlay {nflTeams} {nflMatchups} bind:newLoading={newLoading} bind:weekSelection={weekSelection} bind:yearSelection={yearSelection} bind:yearLeagueData={yearLeagueData} {playersInfo} {nflPlayerInfo} bind:fantasyStarters={fantasyStarters} bind:managerInfo={managerInfo} bind:weekMatchups={weekMatchups} bind:fantasyProducts={fantasyProducts} bind:gameSelection={gameSelection} bind:managerSelection={managerSelection} bind:matchSelection={matchSelection} bind:viewPlayerID={viewPlayerID} bind:showGameBox={showGameBox} bind:showMatchBox={showMatchBox} bind:leaderBoardInfo={leaderBoardInfo} />
            </div>
        </div>
        <div class="rightWrapper">
            <div class="weekInfo" style="margin: 17% 0;">
                <div class="weekInfoSeason">
                    <div class="default" style="height: 33.333%;" >{yearSelection}</div>
                </div>
                <div class="weekInfoWeek">
                    <div class="default" style="height: 33.333%;" >Week {weekSelection}</div>
                </div>
            </div>
            <div class="managerboard">
                {#if newLoading}
                    <div class="modal">
                        <div class="modalContent">Loading League Scores...</div>
                        <LinearProgress indeterminate />
                    </div>
                {/if}
                <ManagerBoard bind:weekMatchups={weekMatchups} {nflTeams} {week} {currentYear} bind:weekSelection={weekSelection} bind:yearSelection={yearSelection} {completeGames} {playersInfo} {nflPlayerInfo} bind:matchSelection={matchSelection} bind:showGameBox={showGameBox} bind:showMatchBox={showMatchBox} />
            </div>
        </div>
    </div>
</div>
