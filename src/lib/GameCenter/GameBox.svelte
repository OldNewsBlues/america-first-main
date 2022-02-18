<script>
    import {round, getStarterPositions} from '$lib/utils/helper'; 
    import LinearProgress from '@smui/linear-progress';
    import Icon from 'mdi-svelte';
    // import {mdiWeatherPouring,
    //         mdiWeatherCloudy,
    //         mdiWeatherSunny, 
    //         mdiWeatherPartlyCloudy, 
    //         mdiWeatherRainy,
    //         mdiWeatherPartlyRainy,
    //         mdiWeatherPartlySnowy,
    //         mdiWeatherSnowy,
    //         mdiWeatherPartlySnowyRainy,
    //         mdiWeatherNight,
    //         mdiWeatherLightning,
    //         mdiWeatherFog,
    //         mdiWeatherWindy,
    //         } from '@mdi-js';

    export let nflTeams, nflMatchups, weekSelection, yearSelection, currentYear, yearLeagueData, playersInfo, nflPlayerInfo, fantasyStarters, positionLeaders, managerInfo, weekMatchups, standingsData, matchSelection, managerSelection, fantasyProducts, gameSelection = nflMatchups[0][0].gameID, viewPlayerID, showGameBox, showMatchBox, leaderBoardInfo, newLoading;
    
    const positions = getStarterPositions(yearLeagueData);
    const nflPositions = [];
    for(const position in positions) {
        if(!nflPositions.includes(positions[position]) && positions[position] != 'FLEX' && positions[position] != 'WRRB_FLEX' && positions[position] != 'REC_FLEX' && positions[position] != 'SUPER_FLEX') {
            nflPositions.push(positions[position]);
        }
    }
    let freshGame = false;
    let freshManager = false;
    let positionLB;
    let positionPlayFilter = [];

    let leaderBoardType;
    let leaderBoardSpec;
    let leaderboardHeading = 'Game';

    let allStarters = {};

    const getAllStarters = (fantasyStarters) => {
        allStarters = {};
        for(const recordManID in fantasyStarters) {
            const starters = fantasyStarters[recordManID].starters;
            allStarters[recordManID] = [];
            for(const starter of starters) {
                const starterInfo = nflPlayerInfo[starter];
                if(starter != '0') {
                    const team = playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).espnAbbreviation : starterInfo && starterInfo.espn.t[yearSelection].length > 1 && starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection) ? starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection).team : playersInfo.players[starter].wi[yearSelection][weekSelection] && playersInfo.players[starter].wi[yearSelection][weekSelection].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[starter].wi[yearSelection][weekSelection].t).espnAbbreviation : playersInfo.players[starter].wi[yearSelection][1] && playersInfo.players[starter].wi[yearSelection][1].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[starter].wi[yearSelection][1].t).espnAbbreviation : starterInfo ? starterInfo.espn.t[yearSelection][0] : 'NONE';
                    const starterEntry = {
                        playerID: starter,
                        fpts: fantasyStarters[recordManID].startersPoints[starters.indexOf(starter)],
                        owner: managerInfo[recordManID],
                        recordManID,
                        fn: playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).ln : playersInfo.players[starter].fn,
                        ln: playersInfo.players[starter].pos == 'DEF' ? 'DEF' : playersInfo.players[starter].ln,
                        pos: playersInfo.players[starter].pos,
                        t: team,
                        projection: playersInfo.players[starter].wi[yearSelection][weekSelection] ? Number.parseFloat(playersInfo.players[starter].wi[yearSelection][weekSelection].p) : 0,
                        avatar: playersInfo.players[starter].pos == 'DEF' ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                        teamAvatar: `https://sleepercdn.com/images/team_logos/nfl/${nflTeams.find(t => t.espnAbbreviation == team).sleeperID.toLowerCase()}.png` || `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                        teamColor: `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).color}6b`,
                        teamAltColor: `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).alternateColor}52`,
                    }
                    allStarters[recordManID].push(starterEntry);
                }
            }
        }
    }
    $: getAllStarters(fantasyStarters);

    // create top 10 points-scorers arrays for each position
    let positionRankArrays = {};
    const getPositionRankArrays = (positionLeaders) => {
        positionRankArrays = {}; 
        if(positions.includes('FLEX')) positionRankArrays['FLEX'] = [];
        if(positions.includes('WRRB_FLEX')) positionRankArrays['WRRB_FLEX'] = [];
        if(positions.includes('REC_FLEX')) positionRankArrays['REC_FLEX'] = [];
        if(positions.includes('SUPER_FLEX')) positionRankArrays['SUPER_FLEX'] = [];
        if(positions.includes('IDP_FLEX')) positionRankArrays['IDP_FLEX'] = [];
        
        for(const position in positionLeaders) {
            positionRankArrays[position] = positionLeaders[position];
            if(positions.includes('FLEX') && (position == 'RB' || position == 'WR' || position == 'TE')) {
                for(let i = 0; i < 10 && i < positionLeaders[position].length; i++) {
                    positionRankArrays['FLEX'].push(positionLeaders[position][i]);
                }
            }
            if(positions.includes('SUPER_FLEX') && (position == 'QB' || position == 'RB' || position == 'WR' || position == 'TE')) {
                for(let i = 0; i < 10 && i < positionLeaders[position].length; i++) {
                    positionRankArrays['SUPER_FLEX'].push(positionLeaders[position][i]);
                }
            }
            if(positions.includes('WRRB_FLEX') && (position == 'RB' || position == 'WR')) {
                for(let i = 0; i < 10 && i < positionLeaders[position].length; i++) {
                    positionRankArrays['WRRB_FLEX'].push(positionLeaders[position][i]);
                }
            }
            if(positions.includes('REC_FLEX') && (position == 'WR' || position == 'TE')) {
                for(let i = 0; i < 10 && i < positionLeaders[position].length; i++) {
                    positionRankArrays['REC_FLEX'].push(positionLeaders[position][i]);
                }
            }
            if(positions.includes('IDP_FLEX') && (position == 'DL' || position == 'LB' || position == 'DB')) {
                for(let i = 0; i < 10 && i < positionLeaders[position].length; i++) {
                    positionRankArrays['IDP_FLEX'].push(positionLeaders[position][i]);
                }
            }
        }
        if(positionRankArrays['FLEX']) positionRankArrays['FLEX'] = positionRankArrays['FLEX'].sort((a, b) => b.fpts - a.fpts);
        if(positionRankArrays['SUPER_FLEX']) positionRankArrays['SUPER_FLEX'] = positionRankArrays['SUPER_FLEX'].sort((a, b) => b.fpts - a.fpts);
        if(positionRankArrays['WRRB_FLEX']) positionRankArrays['WRRB_FLEX'] = positionRankArrays['WRRB_FLEX'].sort((a, b) => b.fpts - a.fpts);
        if(positionRankArrays['REC_FLEX']) positionRankArrays['REC_FLEX'] = positionRankArrays['REC_FLEX'].sort((a, b) => b.fpts - a.fpts);
        if(positionRankArrays['IDP_FLEX']) positionRankArrays['IDP_FLEX'] = positionRankArrays['IDP_FLEX'].sort((a, b) => b.fpts - a.fpts);
    }
    $: getPositionRankArrays(positionLeaders);
    // assign managers for selected matchID
    const displayMatch = (matchSelection, showMatchBox) => {
        if(showMatchBox == true && matchSelection != null && matchSelection > 0) {
            let match = weekMatchups[matchSelection];
            const projections = {};
            const matchStarters = {};
            for(const opponent in match) {
                projections[match[opponent].recordManID] = 0;
                for(const starter of match[opponent].starters) {
                    if(starter != '0') {
                        const starterInfo = nflPlayerInfo[starter];
                        const team = playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).espnAbbreviation : starterInfo && starterInfo.espn.t[yearSelection].length > 1 && starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection) ? starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection).team : playersInfo.players[starter].wi[yearSelection][weekSelection] && playersInfo.players[starter].wi[yearSelection][weekSelection].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[starter].wi[yearSelection][weekSelection].t).espnAbbreviation : playersInfo.players[starter].wi[yearSelection][1] && playersInfo.players[starter].wi[yearSelection][1].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[starter].wi[yearSelection][1].t).espnAbbreviation : starterInfo ? starterInfo.espn.t[yearSelection][0] : 'NONE';
                        const starterEntry = {
                            playerID: starter,
                            fpts: match[opponent].points[match[opponent].starters.indexOf(starter)],
                            rosterSpot: positions[match[opponent].starters.indexOf(starter)],
                            owner: match[opponent].manager,
                            recordManID: match[opponent].recordManID,
                            fn: playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).ln : playersInfo.players[starter].fn,
                            ln: playersInfo.players[starter].pos == 'DEF' ? 'DEF' : playersInfo.players[starter].ln,
                            pos: playersInfo.players[starter].pos,
                            t: team,
                            projection: playersInfo.players[starter].wi[yearSelection][weekSelection] ? Number.parseFloat(playersInfo.players[starter].wi[yearSelection][weekSelection].p) : 0,
                            avatar: playersInfo.players[starter].pos == 'DEF' ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                            teamAvatar: `https://sleepercdn.com/images/team_logos/nfl/${nflTeams.find(t => t.espnAbbreviation == team).sleeperID.toLowerCase()}.png` || `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                            teamColor: `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).color}6b`,
                            teamAltColor: `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).alternateColor}52`,
                        }

                        projections[match[opponent].recordManID] += starterEntry.projection;

                        if(!matchStarters[match[opponent].recordManID]) matchStarters[match[opponent].recordManID] = [];
                        matchStarters[match[opponent].recordManID].push(starterEntry);
                    }
                }
            }
            let records = {
                0: null,
                1: null,
            }
            for(let i = 0; i < match.length; i++) {
                for(const key in standingsData.standingsInfo) {
                    if(standingsData.standingsInfo[key].recordManID == match[i].recordManID) {
                        records[i] = {
                            wins: standingsData.standingsInfo[key].wins,
                            ties: standingsData.standingsInfo[key].ties,
                            losses: standingsData.standingsInfo[key].losses,
                            showTies: false,
                        }
                        if(records[i].ties != 0) records[i].showTies = true;
                        break;
                    }
                }
            }
            let home = {
                matchInfo: match[0],
                manager: match[0].manager,
                fpts: match[0].totalFpts,
                projection: projections[match[0].recordManID],
                starters: matchStarters[match[0].recordManID],
                record: records[0],
            }
            let away = {
                matchInfo: match[1],
                manager: match[1].manager,
                fpts: match[1].totalFpts,
                projection: projections[match[1].recordManID],
                starters: matchStarters[match[1].recordManID],
                record: records[1],
            }
            freshGame = true;
            viewPlayerID = 'flush';
            positionLB = matchStarters;
            leaderboardHeading = `${home.matchInfo.manager.abbreviation} v ${away.matchInfo.manager.abbreviation}`;
            if(document.querySelector(".leaderboardContainer")) {
                document.querySelector(".leaderboardContainer").scrollTo({
                    behavior: 'smooth',
                    top: 0,
                })
            }
            return {home, away, matchStarters};
        } 
    }
    $: match = displayMatch(matchSelection, showMatchBox);

    // assign teams for selected gameID
    const selectGame = (gameSelection) => {
        const game = nflMatchups.find(m => m[0].gameID == gameSelection);
        const home = game[0].team;
        const away = game[1].team;
        const gameInfo = game[0].info;

        freshGame = true;
        viewPlayerID = 'flush';

        return {home, away, gameInfo};
    }
    $: game = selectGame(gameSelection);

    const positionGameStarters = {
        positions: {},
        rowHeights: {},
    };
    const findStarters = (game, showGameBox, fantasyStarters) => {
        if(showGameBox == true) {
            const gameStarters = {};
            for(const nflPosition of nflPositions){
                positionGameStarters.positions[nflPosition] = [];
            }            

            if(!positionGameStarters[gameSelection]) positionGameStarters[gameSelection] = {};
            if(!positionGameStarters[gameSelection][game.home.sleeperID]) {
                positionGameStarters[gameSelection][game.home.sleeperID] = {
                    starters: [],
                };
            }
            if(!positionGameStarters[gameSelection][game.away.sleeperID]) {
                positionGameStarters[gameSelection][game.away.sleeperID] = {
                    starters: [],
                };
            }
            if(!positionGameStarters.rowHeights[gameSelection]) positionGameStarters.rowHeights[gameSelection] = [];
            positionGameStarters[gameSelection][game.home.sleeperID].starters = [];
            positionGameStarters[gameSelection][game.away.sleeperID].starters = [];
            positionGameStarters.rowHeights[gameSelection] = [];

            for(const recordManID in fantasyStarters) {
                const starters = fantasyStarters[recordManID].starters;
                for(const starter of starters) {
                    const starterInfo = nflPlayerInfo[starter];
                    if(starter != '0') {
                        const team = playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).espnAbbreviation : starterInfo && starterInfo.espn.t[yearSelection].length > 1 && starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection) ? starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection).team : playersInfo.players[starter].wi[yearSelection][weekSelection] && playersInfo.players[starter].wi[yearSelection][weekSelection].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[starter].wi[yearSelection][weekSelection].t).espnAbbreviation : playersInfo.players[starter].wi[yearSelection][1] && playersInfo.players[starter].wi[yearSelection][1].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[starter].wi[yearSelection][1].t).espnAbbreviation : starterInfo ? starterInfo.espn.t[yearSelection][0] : 'NONE';
                        if(nflTeams.find(t => t.espnAbbreviation == team).sleeperID == game.home.sleeperID || nflTeams.find(t => t.espnAbbreviation == team).sleeperID == game.away.sleeperID) {
                            const starterEntry = {
                                playerID: starter,
                                fpts: fantasyStarters[recordManID].startersPoints[starters.indexOf(starter)],
                                rosterSpot: positions[starters.indexOf(starter)],
                                owner: managerInfo[recordManID],
                                recordManID,
                                fn: playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).ln : playersInfo.players[starter].fn,
                                ln: playersInfo.players[starter].pos == 'DEF' ? 'DEF' : playersInfo.players[starter].ln,
                                pos: playersInfo.players[starter].pos,
                                t: team,
                                projection: playersInfo.players[starter].wi[yearSelection][weekSelection] ? Number.parseFloat(playersInfo.players[starter].wi[yearSelection][weekSelection].p) : 0,
                                avatar: playersInfo.players[starter].pos == "DEF" ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                                teamAvatar: `https://sleepercdn.com/images/team_logos/nfl/${nflTeams.find(t => t.espnAbbreviation == team).sleeperID.toLowerCase()}.png` || `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                                teamColor: `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).color}6b`,
                                teamAltColor: `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).alternateColor}52`,
                            }

                            if(!gameStarters[recordManID]) gameStarters[recordManID] = [];
                            gameStarters[recordManID].push(starterEntry);

                            if(!positionGameStarters.positions[starterEntry.pos].includes(starterEntry)) positionGameStarters.positions[starterEntry.pos].push(starterEntry);
                        }
                    }
                }
            }

            if(positionGameStarters[gameSelection][game.home.sleeperID].starters.length == 0 && positionGameStarters.rowHeights[gameSelection].length == 0) {
                for(const pos in positionGameStarters.positions) {
                    positionGameStarters[gameSelection][game.home.sleeperID].starters.push(positionGameStarters.positions[pos].filter(s => nflTeams.find(t => t.espnAbbreviation == s.t).sleeperID == game.home.sleeperID));
                    positionGameStarters[gameSelection][game.away.sleeperID].starters.push(positionGameStarters.positions[pos].filter(s => nflTeams.find(t => t.espnAbbreviation == s.t).sleeperID == game.away.sleeperID));
                    if(positionGameStarters.positions[pos].filter(s => nflTeams.find(t => t.espnAbbreviation == s.t).sleeperID == game.home.sleeperID).length >= positionGameStarters.positions[pos].filter(s => nflTeams.find(t => t.espnAbbreviation == s.t).sleeperID == game.away.sleeperID).length) {
                        positionGameStarters.rowHeights[gameSelection].push(positionGameStarters.positions[pos].filter(s => nflTeams.find(t => t.espnAbbreviation == s.t).sleeperID == game.home.sleeperID).length);
                    } else {
                        positionGameStarters.rowHeights[gameSelection].push(positionGameStarters.positions[pos].filter(s => nflTeams.find(t => t.espnAbbreviation == s.t).sleeperID == game.away.sleeperID).length);
                    }
                }
            }
            freshGame = true;
            positionLB = gameStarters;
            leaderboardHeading = `${game.home.sleeperID} v ${game.away.sleeperID}`;
            if(document.querySelector(".leaderboardContainer")) {
                document.querySelector(".leaderboardContainer").scrollTo({
                    behavior: 'smooth',
                    top: 0,
                })
            }
            return gameStarters;
        }
        if(document.querySelector(".leaderboardContainer")) {
            document.querySelector(".leaderboardContainer").scrollTo({
                behavior: 'smooth',
                top: 0,
            })
        }
    }
    $: gameStarters = findStarters(game, showGameBox, fantasyStarters);

    export const changePlayer = (viewPlayerID) => {
        let newViewPlayer;
        let newViewPlayerRank;
        if(viewPlayerID == 'flush') {
            newViewPlayer = null;
            newViewPlayerRank = null;
        } else {
            if(showGameBox) {
                for(const recordManID in gameStarters) {
                    if(gameStarters[recordManID].find(s => s.playerID == viewPlayerID)) {
                        newViewPlayer = gameStarters[recordManID].find(s => s.playerID == viewPlayerID);
                        newViewPlayerRank = positionLeaderboard.indexOf(positionLeaderboard.find(l => l.playerID == viewPlayerID)) + 1;
                        let leaderboardRows = document.getElementsByClassName('leaderboardRow');
                        for(const row in leaderboardRows) {
                            if(row != 'length' && leaderboardRows[row].textContent?.includes(`${playersInfo.players[viewPlayerID].fn} ${playersInfo.players[viewPlayerID].ln}`) && leaderboardRows[row].textContent.includes(`${newViewPlayerRank}`)) {
                                leaderboardRows[row].scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                });
                                break;
                            }
                        }
                        break;
                    }
                }
            } else if(showMatchBox) {
                for(const recordManID in fantasyStarters) {
                    if(allStarters[recordManID].find(s => s.playerID == viewPlayerID)) {
                        newViewPlayer = allStarters[recordManID].find(s => s.playerID == viewPlayerID);
                        newViewPlayerRank = positionLeaderboard.indexOf(positionLeaderboard.find(l => l.playerID == viewPlayerID)) + 1;
                        let leaderboardRows = document.getElementsByClassName('leaderboardRow');
                        for(const row in leaderboardRows) {
                            if(row != 'length' && leaderboardRows[row].textContent?.includes(`${playersInfo.players[viewPlayerID].fn} ${playersInfo.players[viewPlayerID].ln}`) && leaderboardRows[row].textContent.includes(`${newViewPlayerRank}`)) {
                                leaderboardRows[row].scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                });
                                break;
                            }
                        }
                        break;
                    }
                }
            }

        }
        viewPlayer = {
            player: newViewPlayer,
            rank: newViewPlayerRank,
        }
        return viewPlayer;
    }
    $: viewPlayer = changePlayer(viewPlayerID);

    const getDisplayStats = async (viewPlayer) => {
        let newFantasyProducts = await fantasyProducts;
        const viewPlayerStats = {};
        let displayStats = [];
        if(newFantasyProducts.fantasyProducts && newFantasyProducts.fantasyProducts.length > 0 && viewPlayer.player != null  && newFantasyProducts.runningTotals[viewPlayer.player.playerID]) {
            let runningTotals = newFantasyProducts.runningTotals;
            viewPlayerStats[viewPlayer.player.playerID] = {
                stats: runningTotals[viewPlayer.player.playerID]?.stats || null,
                totalFpts: runningTotals[viewPlayer.player.playerID]?.fpts || null,
                playerID: viewPlayer.player.playerID,
            }
            displayStats.push(viewPlayerStats[viewPlayer.player.playerID]);
        // if game has started, show Fpts as 0.00
        } else if(viewPlayer.player != null && newFantasyProducts.fantasyProducts.length > 0 && !newFantasyProducts.runningTotals[viewPlayer.player.playerID] &&
                (nflMatchups.find(m => m.some(m => (m.team.espnAbbreviation == viewPlayer.player.t)))[0].status.type.state == 'in' 
                || nflMatchups.find(m => m.some(m => m.team.espnAbbreviation == viewPlayer.player.t))[0].status.type.state == 'post')) {
                viewPlayerStats[viewPlayer.player.playerID] = {
                    stats: [],
                    totalFpts: 0.00,
                    playerID: viewPlayer.player.playerID,
                }
                displayStats.push(viewPlayerStats[viewPlayer.player.playerID]);
        } else {
            displayStats = null;
        }
        return displayStats;
    }
    $: displayStats = getDisplayStats(viewPlayer);

    const getPositionLeaders = (positionLB, gameStarters, match) => {
        let positionLeaderboard = [];
        if(!freshGame && !freshManager) {
            positionLeaderboard = positionRankArrays[positionLB];
        } else if(freshGame && !freshManager) {
            if(showGameBox) {
                positionLB = gameStarters;
            } else if(showMatchBox) {
                positionLB = match.matchStarters;
            }
            for(const recordManID in positionLB) {
                for(const starter of positionLB[recordManID]) {
                    positionLeaderboard.push(starter);
                }
            }
            positionLeaderboard = positionLeaderboard.sort((a, b) => b.fpts - a.fpts);
            freshGame = false;
        } else if(freshManager) {
            for(const starter of positionLB) {
                positionLeaderboard.push(starter);
            }
            positionLeaderboard = positionLeaderboard.sort((a, b) => b.fpts - a.fpts);
            freshManager = false;
            freshGame = false;
        }
        if(document.querySelector(".leaderboardContainer")) {
            document.querySelector(".leaderboardContainer").scrollTo({
                behavior: 'smooth',
                top: 0,
            })
        }
        return positionLeaderboard;
    }
    $: positionLeaderboard = getPositionLeaders(positionLB, gameStarters, match);

    const multiFunction = (playerID, teamID, leaderBoardType, leaderBoardSpec, recordManID) => {

        if(playerID && teamID) viewPlayerID = playerID == viewPlayerID ? 'flush' : playerID;

        if(leaderBoardType != null && leaderBoardSpec != null && recordManID == 0) {
            if(leaderBoardType == 'matchup') {
                matchSelection = leaderBoardSpec;
            } else if(leaderBoardType == 'nflGame') {
                game = leaderBoardSpec;
            }
            managerSelection = recordManID;
            viewPlayerID = null;
            changeLeaderBoard(leaderBoardType, leaderBoardSpec, recordManID);
        } else if(recordManID != 0 && recordManID) {

            if(leaderBoardType == 'matchup') matchSelection = leaderBoardSpec;
            managerSelection = recordManID == managerSelection ? 0 : recordManID;
            viewPlayerID = null;
            changeLeaderBoard(leaderBoardType, leaderBoardSpec, recordManID);
        }
    }

    const changeLeaderBoard = (leaderBoardType, leaderBoardSpec, managerSelection) => {
        if(leaderBoardType == 'position') {
            let newPlayFilter;
            if(positionPlayFilter.length > 0 && positionPlayFilter.includes(leaderBoardSpec)) {
                newPlayFilter = positionPlayFilter.filter(p => p != leaderBoardSpec);
                positionPlayFilter = newPlayFilter;
            } else {
                newPlayFilter = positionPlayFilter;
                newPlayFilter.push(leaderBoardSpec);
                positionPlayFilter = newPlayFilter;
            }
            positionLB = leaderBoardSpec;
            if(leaderBoardSpec == 'DEF') {
                leaderboardHeading = 'Defense';
            } else if(leaderBoardSpec == 'QB') {
                leaderboardHeading = 'Quarterback';
            } else if(leaderBoardSpec == 'RB') {
                leaderboardHeading = 'Running Back';
            } else if(leaderBoardSpec == 'WR') {
                leaderboardHeading = 'Wide Receiver';
            } else if(leaderBoardSpec == 'TE') {
                leaderboardHeading = 'Tight End';
            } else if(leaderBoardSpec == 'K') {
                leaderboardHeading = 'Kicker';
            } else if(leaderBoardSpec == 'DB') {
                leaderboardHeading = 'Defensive Back';
            } else if(leaderBoardSpec == 'DL') {
                leaderboardHeading = 'Defensive Lineman';
            } else if(leaderBoardSpec == 'LB') {
                leaderboardHeading = 'Linebacker';
            } else if(leaderBoardSpec == 'FLEX') {
                leaderboardHeading = 'FLEX';
            } else if(leaderBoardSpec == 'SUPER_FLEX') {
                leaderboardHeading = 'Super FLEX';
            } else if(leaderBoardSpec == 'WRRB_FLEX') {
                leaderboardHeading = 'WR/RB FLEX';
            } else if(leaderBoardSpec == 'REC_FLEX') {
                leaderboardHeading = 'WR/TE FLEX';
            } else if(leaderBoardSpec == 'IDP_FLEX') {
                leaderboardHeading = 'IDP FLEX';
            }
            if(positionPlayFilter.length > 0) {
                leaderBoardSpec = positionPlayFilter;
            } else {
                leaderBoardSpec = nflPositions;
            }
        } else if(leaderBoardType == 'matchup') {
            if(managerSelection == 0) {
                let newMatch = displayMatch(leaderBoardSpec, showMatchBox);
                positionLB = newMatch.matchStarters;
                leaderboardHeading = `${managerInfo[newMatch.home.matchInfo.recordManID].abbreviation} v ${managerInfo[newMatch.away.matchInfo.recordManID].abbreviation}`;
                positionPlayFilter = [];
                managerSelection = 0;
            } else {
                let newMatch = displayMatch(leaderBoardSpec, showMatchBox);
                freshManager = true;
                positionLB = newMatch.matchStarters[managerSelection];
                leaderboardHeading = managerInfo[managerSelection].name;
                positionPlayFilter = [];
            }
        } else if(leaderBoardType == 'nflGame') {
            let newGameStarters = findStarters(leaderBoardSpec, showGameBox);
            freshGame = true;
            positionLB = newGameStarters;
            leaderboardHeading = `${leaderBoardSpec.home.sleeperID} v ${leaderBoardSpec.away.sleeperID}`;
            positionPlayFilter = [];
            managerSelection = 0;
            matchSelection = null;
        }
        leaderBoardInfo = {
            type: leaderBoardType,
            spec: leaderBoardSpec,
        }
        if(document.querySelector(".leaderboardContainer")) {
            document.querySelector(".leaderboardContainer").scrollTo({
                behavior: 'smooth',
                top: 0,
            })
        }
        return leaderBoardInfo;
    }

    $: leaderBoardInfo = changeLeaderBoard(leaderBoardType, leaderBoardSpec, managerSelection);

</script>

<style>
    .bigBox {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        flex-wrap: wrap;
        z-index: auto;
        margin: 0.2em 0.2em 0.8em 0.2em;
        width: 100%;
        height: 45em;
		background-color: var(--gcBox);
        border-radius: 1em;
        padding: 1%;
        align-content: center;
        align-self: center;
        align-items: center;
        justify-content: center;
        justify-items: center;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 3px 2px rgb(0 0 0 / 30%);
    }

    .fptsContainer {
        position: relative;
        display: inline-flex;
        height: 100%;
        width: 25%;
        align-items: center;
        justify-content: center;
    }

    .fptsBox {
        position: relative;
        display: inline-flex;
        border-radius: 1em;
        height: 70%;
        width: 70%;
        border: 0.25px solid #777;
        justify-content: center;
        align-items: center;
        font-size: 1.2em;
        font-weight: 600;
        color: var(--gcPlayRowText);
    }

    .statsContainer {
        position: relative;
        display: inline-flex;
        flex-wrap: wrap;
        flex-direction: column;
        justify-content: space-around;
        align-content: flex-start;
        color: var(--gcPlayRowText);
        font-size: 0.82em;
        font-weight: 420;
        height: 100%;
        width: 71%;
        margin: 0 4% 0 0;
        overflow: hidden;
    }

    .statWrap {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        line-height: 1.2em;
        align-items: center;
        width: 94%;
        padding: 0 0 0 2%;
        border-radius: 0.3em;
        margin: 0 4%;
        justify-content: center;
    }

    .statCat {
        position: relative;
        display: inline-flex;
        color: var(--gcStats);
        justify-content: flex-start;
        width: 50%;
    }

    .statMetric {
        position: relative;
        display: inline-flex;
        color: var(--gcStats);
        width: 25%;
        justify-content: center;
    }

    .statFpts {
        position: relative;
        display: inline-flex;
        color: var(--gcStats);
        width: 25%;
        justify-content: center;
    }

    .viewPlayer {
        position: relative;
        display: inline-flex;
        width: 90%;
        height: 24%;
        border-radius: 1em;
        background-color: var(--gcComponent);
        padding: 2%;
        margin: 0 0 1% 0;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 3px 2px var(--gcScoreShadow);
    }

    .viewPlayerBlock {
        position: relative;
        display: inline-flex;
        align-items: center;
        flex-direction: column;
        width: 100%;
        height: 100%;
        align-content: center;
        justify-content: center;
    }

    .viewPlayerTop {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 39%;
        margin: 0 0 1% 0;
    }

    .viewPlayerBottom {
        position: relative;
        display: inline-flex;
        width: 100%;
        height: 59%;
        margin: 1% 0 0 0;
        align-items: center;
        justify-content: center;
    }

    .viewPlayerProfile {
        position: relative;
        display: inline-flex;
        height: 100%;
        width: 80%;
    }

    .viewPlayerInfo {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        width: 20%;
    }

    .viewPlayerName {
        position: relative;
        display: inline-flex;
        top: 0.4em;
        font-size: 1.2em;
        width: auto;
        justify-content: flex-start;
        color: var(--gcPlayRowText);
    }

    .viewPlayerAvatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: auto;
        justify-content: center;
        height: 100%;
        margin: 0 0.7em 0 0;
    }

    .viewDefenseAvatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: auto;
        justify-content: center;
        height: 100%;
        margin: 0 1.04em;
        top: 0.2em;
    }

    .posPlayerRank {
        position: relative;
        display: inline-flex;
        color: var(--gcPlayRowText);
        align-items: center;
        font-weight: 420;
        width: 3%;
        margin: 0 0 0 1%;
        justify-content: center;
    }

    .posPlayerProfile {
        position: relative;
        display: inline-flex;
        height: 100%;
        width: 48%;
        margin: 0 1%;
        flex-direction: row;
        align-items: center;
    }

    .posPlayerManager {
        position: relative;
        display: inline-flex;
        color: var(--gcPlayRowText);
        align-items: center;
        font-style: italic;
        font-size: 0.7em;
        overflow: hidden;
        width: 33%;
        margin: 0 1%;
        font-weight: 410;
        justify-content: center;
        line-height: 1em;
    }

    .posPlayerFpts {
        position: relative;
        display: inline-flex;
        color: var(--gcPlayRowText);
        align-items: center;
        width: 8%;
        font-size: 0.85em;
        font-weight: 500;
        margin: 0 1%;
        justify-content: center;
    }

    .posPlayerName {
        position: relative;
        display: inline-flex;
        font-size: 0.85em;
        font-weight: 500;
        width: 72%;
        height: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
        align-items: center;
        color: var(--gcPlayRowText);
        line-height: 1em;
    }

    .posPlayerAvatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: auto;
        height: 100%;
        justify-content: center;
    }

    .posPlayerAvatarHolder {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: 22%;
        margin: 0 4% 0 2%;
        height: 100%;
        justify-content: center;
    }

    .posDefenseAvatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: auto;
        justify-content: center;
        height: 100%;
    }

    .leaderboardPOS {
        display: inline-flex;
        flex-direction: column;
        position: relative;
        height: 70%;
        width: 95%;
        margin: 1% 0 0 1%;
        border-radius: 1em;
        padding: 2%;
        background-color: var(--gcComponent);
        align-content: center;
        justify-content: center;
        align-self: center;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 4px 3px var(--gcScoreShadow);
    }

    .leaderboardContainer {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        height: 93%;
        margin: 1% 0 0 0;
        overflow-y: scroll;
        scroll-snap-type: y mandatory;
    }

    .leaderboardRow {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border: 0.25px solid #343434;
        border-radius: 1em;
        width: 99%;
        height: 8.25%;
        margin: 0.7% 0;
        scroll-snap-align: start;
    }

    .bigBoxRightWrap {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        width: 50%;
        height: 100%;
        align-items: center;
    }

    .bigBoxLeftWrap {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        width: 50%;
        height: 100%;
        align-items: center;
    }

    .gameManagers {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 99%;
        margin: 0 1% 0 0;
        height: 100%;
        border-radius: 1em;
        background-color: var(--gcComponent);
        align-self: center;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 4px 3px var(--gcScoreShadow);
    }

    .managerBlock {
        position: relative;
        display: inline-flex;
        align-items: flex-start;
        flex-direction: column;
    }

    .managerInfo {
        position: relative;
        display: inline-flex;
        align-items: center;
        height: 0.4em;
    }

    .managerName {
        position: relative;
        display: inline-flex;
        font-style: italic;
    }

    .managerAvatar {
        width: 2.4em;
        height: fit-content;
        margin: 0 1em 0 0;
        border: 0.25px solid #777;
        border-radius: 50%;
    }

    :global(.managerAvatar:hover) {
        cursor: pointer;
        background-color: var(--gcSelect);
        border: 0.5px solid var(--g111);
    }

    .managerStarters {
        display: inline-flex;
        position: relative;
        align-items: center;
        left: 3em;
        top: 1em;
        height: 2.5em;
    }

    .playerAvatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: auto;
        margin: 0 0.1em;
        justify-content: center;
        height: 100%;
        border: 0.25px solid #777;
        border-radius: 1em;
        padding: 0.175em;
    }

    .playerAvatar:hover {
        cursor: pointer;
        background-color: var(--gcSelect);
        border: 0.5px solid var(--g111);
    }

    .defenseAvatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: auto;
        margin: 0 0.1em;
        justify-content: center;
        height: 100%;
        border: 0.25px solid #777;
        border-radius: 1em;
        padding: 0.175em;
    }

    .defenseAvatar:hover {
        cursor: pointer;
        background-color: var(--gcSelect);
        border: 0.5px solid var(--g111);
    }

    .heading {
        position: relative;
        display: inline-flex;
        color: var(--gcPlayRowText);
        font-weight: 430;
        font-size: 1.4em;
        height: 6%;
        justify-content: center;
        align-items: center;
    }
    .gameHeaderBox {
        display: inline-flex;
        position: absolute;
        z-index: 2;
        width: 96%;
        height: 104%;
        border: 0.25px solid #555;
        border-radius: 1em;
        top: 8%;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 3px 2px var(--gcScoreShadow);
    }

    .gameHeaderBox:hover {
        cursor: pointer;
        border: 0.5px solid var(--g111);
        border-radius: 1em;
    }

    .gameHeader {
        display: inline-flex;
        flex-direction: row;
        position: relative;
        width: 96%;
        height: 10%;
        padding: 2%;
        justify-content: space-around;
    }

    .gameOpponent {
        display: inline-flex;
        flex-direction: row;
        position: relative;
        height: 100%;
        width: 47.5%;
        align-items: center;
        justify-content: center;
    }

    .matchOpponent {
        display: inline-flex;
        flex-direction: column;
        position: relative;
        height: 100%;
        width: 48.5%;
        justify-content: center;
    }

    .matchTop {
        display: inline-flex;
        flex-direction: row;
        position: relative;
        height: 75%;
        width: 100%;
        align-items: center;
        justify-content: center;
    }

    .versus {
        display: inline-flex;
        position: relative;
        height: 128%;
        width: 3%;
        justify-content: center;
        font-style: italic;
        font-weight: 420;
        font-size: 0.8em;
        color: var(--g555);
        align-items: center;
    }

    .gameTeamWrapper {
        display: inline-flex;
        flex-direction: column;
        position: relative;
        height: 100%;
        margin: 0 2.5%;
        justify-content: center;
    }

    .gameTeam {
        display: inline-flex;
        flex-direction: row;
        position: relative;
        height: 100%;
        color: var(--gcPlayRowText);
        font-weight: 700;
    }

    .gameAvatar {
        display: inline-flex;
        flex-direction: row;
        position: relative;
        height: 100%;
        width: auto;
    }

    .matchAvatar {
        z-index: 2;
        display: inline-flex;
        flex-direction: row;
        position: relative;
        border: 0.25px solid #777; 
        border-radius: 50%; 
        height: 90%; 
        width: auto;
    }

    .matchAvatar:hover {
        border: 0.5px solid var(--g111); 
        background-color: var(--gcSelect);
        cursor: pointer;
    }

    .matchContainer {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: flex-start;
        height: 86%;
        padding: 2%;
    }

    .gameContainer {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: flex-start;
        height: 86%;
        padding: 2%;
    }

    .pos {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5em;
        width: 40%;
		height: 40%;
        position: relative;
	}

    .t {
        display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5em;
        width: 40%;
		height: auto;
        position: relative;
    }

    .QB {
		background-color: var(--QB);
	}

	.WR {
		background-color: var(--WR);
	}

	.RB {
		background-color: var(--RB);
	}

	.TE {
		background-color: var(--TE);
	}

	.FLEX {
		background: linear-gradient(to right, var(--WR), var(--WR) 33.33%, var(--RB) 33.33%, var(--RB) 66.66%, var(--TE) 66.66%);
	}

	.WRRB_FLEX {
		background: linear-gradient(to right, var(--WR), var(--WR) 50%, var(--RB) 50%);
	}

    .REC_FLEX {
		background: linear-gradient(to right, var(--WR), var(--WR) 50%, var(--TE) 50%);
	}

    .SUPER_FLEX {
		background: conic-gradient(var(--RB) 0deg, var(--RB) 90deg, var(--QB) 90deg, var(--QB) 180deg, var(--TE) 180deg, var(--TE) 270deg, var(--WR) 270deg, var(--WR) 360deg);
	}

	.K {
		background-color: var(--K);
	}

	.DEF {
		background-color: var(--DEF);
	}

    .DL, .DE, .DT {
        background-color: var(--DL);
    }

    .LB {
        background-color: var(--LB);
    }

    .DB, .CB, .SS, .FS {
        background-color: var(--DB);
    }

    .IDP_FLEX {
        background: #000000;
    }

    .rosterWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        height: 100%;
        width: 44%;
        justify-content: space-evenly;
        align-items: center;
    }

    .rosterPlayerInfo {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        height: 100%;
        width: 95%;
        font-size: 0.85em;
        font-weight: 500;
        color: var(--gcPlayRowText);
    }

    .rosterPlayer {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        height: 50%;
        width: 100%;
        align-items: center;
        line-height: 1em;
    }

    .rosterAvatar {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        height: 96%;
        top: 3%;
        width: auto;
        align-items: center;
        overflow: hidden;
    }

    .avatarHolder:hover {
        cursor: pointer;
        background-color: var(--aaa);
        border: 0.5px solid var(--g111);
        z-index: 2;
    }

    .rosterRow {
        position: relative;
        display: inline-flex;
        align-items: center;
        flex-direction: row;
        height: 8%;
        width: 100%;
    }

    .positionGroup {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: 44%;
        height: 100%;
    }
    
    .avatarHolder {
        position: relative;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        height: 100%;
        width: 50%;
        border: 0.5px solid #555;
        border-radius: 1em 0 0 1em;
        overflow: hidden;
    }

    .positionsWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        height: 100%;
        width: 12%;
        justify-content: space-evenly;
        align-items: center;
    }

    .rosterPosition {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 8%;
        width: 100%;
        border-radius: 25%;
        font-weight: 900;
    }

    .selectedPosition {
        position: absolute;
        display: inline-flex;
        height: 100%;
        width: 100%;
        border-radius: 25%;
    }

    .selectedPosition:hover {
        cursor: pointer;
        border: 0.5px solid var(--g111);
        z-index: 2;
    }

    .rosterRowBox {
    	position: absolute;
        display: inline-flex;
        align-items: center;
        flex-direction: column;
        height: 100%;
        width: 835%;
        border: 0.25px solid #555;
        border-radius: 1em;
        box-shadow: inset 0px 0px 0px -2px rgb(0 0 0 / 30%), inset 0px 1px 1px -1px rgb(0 0 0 / 28%), inset 0px 1px 4px 0px var(--gcScoreShadow);
    }

    .totalPointsRow {
        position: relative;
        display: inline-flex;
        justify-content: space-around;
        flex-direction: row;
        width: 100%;
        top: -1.8em;
    }

    .totalPointsWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 25%;
        height: 145%;
        border: 0.25px solid #777;
        border-radius: 0.9em;
        align-items: center;
        justify-content: center;
        line-height: 1em;
    }

    .projectedPoints {
        position: relative;
        display: inline-flex;
        font-weight: 420;
        font-size: 0.85em;
        color: var(--g555);
        top: 15%;
    }

    .totalPoints {
        position: relative;
        display: inline-flex;
        font-weight: 600;
        font-size: 1.2em;
        color: var(--g111);
        top: 5%;
    }

    .gameRow {
        position: relative;
        display: inline-flex;
        width: 100%;
        align-items: center;
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
        border-radius: 1em;
    }

    .modalContent {
        justify-content: center;
        align-items: center;
        color: #ededed;
    }
</style>

<div class="bigBox">
    <div class="bigBoxLeftWrap">
        <div class="gameManagers">
            {#if newLoading}
                <div class="modal">
                    <div class="modalContent">Loading Scores...</div>
                    <LinearProgress indeterminate />
                </div>
            {/if}
            <!-- shows specific NFL games -->
            {#if showGameBox == true}
                <div class="gameHeader">
                    <div class="gameHeaderBox" style="{showGameBox == true && newLoading == false  && positionPlayFilter.length == 0 && managerSelection == 0 ? "border: 0.5px solid var(--g111); border-radius: 1em;" : null}" on:click={() => multiFunction(null, null, 'nflGame', game, 0)} />
                    <div class="gameOpponent">
                        <img class="gameAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{game.home.sleeperID.toLowerCase()}.png" alt="{game.home.sleeperID}">
                        <div class="gameTeamWrapper" style="align-items: flex-start;">
                            <div class="gameTeam" style="align-items: flex-end;">{game.home.fn}</div>
                            <div class="gameTeam" style="align-items: flex-start;">{game.home.ln}</div>
                        </div>
                    </div>
                    <div class="versus">V</div>
                    <div class="gameOpponent">
                        <div class="gameTeamWrapper" style="align-items: flex-end;">
                            <div class="gameTeam" style="align-items: flex-end;">{game.away.fn}</div>
                            <div class="gameTeam" style="align-items: flex-start;">{game.away.ln}</div>
                        </div>
                        <img class="gameAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{game.away.sleeperID.toLowerCase()}.png" alt="{game.away.sleeperID}">
                    </div>
                </div>
                <div class="gameContainer">
                    {#each positionGameStarters.rowHeights[gameSelection] as row, ix}
                        {#if row != 0}
                            <div class="gameRow" style="height: {8 * row}%">
                                <div class="positionGroup">
                                    {#each positionGameStarters[gameSelection][game.home.sleeperID].starters[ix] as starter, iv}
                                        <div class="rosterRow" style="justify-content: flex-start; height: {100 / row}%">
                                            <div class="avatarHolder" style="{row >= 2 && iv == 0 ? "border-radius: 1em 0 0 0;" : row >= 2 && iv == positionGameStarters[gameSelection][game.home.sleeperID].starters[ix].length - 1 ? "border-radius: 0 0 0 1em;" : row >= 2 && iv > 0 && iv < positionGameStarters[gameSelection][game.home.sleeperID].starters[ix].length - 1 ? "border-radius: 0;" : null} {starter.pos == 'DEF' ? "width: 52%; top: 1%; margin: 0 1% 0 0;" : "margin: 0 1% 0 0;"} right: 1%; {viewPlayer?.player?.playerID == starter.playerID ? "z-index: 2; background-color: var(--aaa); border: 0.5px solid var(--g111);" : null}">
                                                <img class="rosterAvatar" src="{starter.avatar}" alt="" on:click={() => multiFunction(starter.playerID, starter.t, null, null, null)} style="z-index: 2; {viewPlayer?.player?.playerID == starter.playerID ? "background-color: var(--aaa);" : null}">
                                            </div>
                                            <div class="rosterPlayerInfo" style="{starter.pos == 'DEF' ? "margin: 0 2% 0 0;" : null}" >
                                                <div class="rosterPlayer" style="justify-content: flex-start; {starter.pos == 'DEF' ? "margin: 0 7% 0 0;" : "margin: 0 3% 0 0;"}">{starter.pos == 'DEF' ? `${starter.fn} ${starter.ln}` : `${starter.fn.slice(0, 1)}. ${starter.ln}`}</div>
                                                <div class="rosterPlayer" style="justify-content: flex-start; color: var(--g555); font-size: 0.75em; line-height: 1em; {starter.pos == 'DEF' ? "margin: 0 7% 0 0;" : "margin: 0 3% 0 0;"}">{starter.owner.name}</div>
                                                <div class="rosterPlayer" style="justify-content: space-between; {starter.pos == 'DEF' ? "margin: 0 7% 0 0;" : "margin: 0 3% 0 0;"}">
                                                    <div style="display: inline-flex; color: var(--g555);">({round(starter.projection)})</div>
                                                    <div style="display: inline-flex; font-weight: 600; {starter.pos == 'DEF' ? "margin: 0 2% 0 0;" : "margin: 0 5% 0 0;"}">{round(starter.fpts)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                                <div class="positionsWrap" style="justify-content: flex-start;">
                                    <div class="rosterPosition {nflPositions[ix]}" style="height: {100 / row}%;">
                                        <div class="rosterRowBox" style="top: -2%; height: {100 * row}%; {positionPlayFilter.length > 0 && positionPlayFilter.includes(nflPositions[ix]) ? "border: 0.5px solid var(--g111); border-radius: 1em;" : null}"></div>
                                        {nflPositions[ix]}
                                        <div class="selectedPosition" id="selectedPosition" on:click={() => multiFunction(null, null, 'position', nflPositions[ix], 0)} style="{positionPlayFilter.length > 0 && positionPlayFilter.includes(nflPositions[ix]) ? "border: 0.5px solid var(--g111); border-radius: 1em; z-index: 2;" : null}"></div>
                                    </div>
                                </div>
                                <div class="positionGroup">
                                    {#each positionGameStarters[gameSelection][game.away.sleeperID].starters[ix] as starter, iv}
                                        <div class="rosterRow" style="justify-content: flex-end; height: {100 / row}%;">
                                            <div class="rosterPlayerInfo">
                                                <div class="rosterPlayer" style="justify-content: flex-end; {starter.pos == 'DEF' ? "margin: 0 0 0 7%;" : "margin: 0 0 0 3%;"}">{starter.pos == 'DEF' ? `${starter.fn} ${starter.ln}` : `${starter.fn.slice(0, 1)}. ${starter.ln}`}</div>
                                                <div class="rosterPlayer" style="justify-content: flex-end; color: var(--g555); font-size: 0.75em; line-height: 1em; {starter.pos == 'DEF' ? "margin: 0 0 0 7%;" : "margin: 0 0 0 3%;"}">{starter.owner.name}</div>
                                                <div class="rosterPlayer" style="justify-content: space-between; {starter.pos == 'DEF' ? "margin: 0 0 0 7%;" : "margin: 0 0 0 3%;"}">
                                                    <div style="display: inline-flex; font-weight: 600; {starter.pos == 'DEF' ? "margin: 0 0 0 -2%;" : "margin: 0 0 0 2%;"}">{round(starter.fpts)}</div>  
                                                    <div style="display: inline-flex; color: var(--g555);">({round(starter.projection)})</div>
                                                </div>
                                            </div>                                
                                            <div class="avatarHolder" style="{starter.pos == 'DEF' ? "width: 52%; top: 1%; margin: 0 0 0 5%;" : "margin: 0 0 0 2%;"} left: 1%; {row >= 2 && iv == 0 ? "border-radius: 0 1em 0 0;" : row >= 2 && iv == positionGameStarters[gameSelection][game.away.sleeperID].starters[ix].length - 1 ? "border-radius: 0 0 1em 0;" : row >= 2 && iv > 0 && iv < positionGameStarters[gameSelection][game.away.sleeperID].starters[ix].length - 1 ? "border-radius: 0;" : "border-radius: 0 1em 1em 0;"} {viewPlayer?.player?.playerID == starter.playerID ? "z-index: 2; background-color: var(--aaa); border: 0.5px solid var(--g111);" : null}">
                                                <img class="rosterAvatar" src="{starter.avatar}" alt="" on:click={() => multiFunction(starter.playerID, starter.t, null, null, null)} style="{viewPlayer?.player?.playerID == starter.playerID ? "background-color: var(--aaa);" : null}">
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
                <!-- shows league matchups -->
            {:else if showMatchBox == true}        
                <div class="gameHeader">
                    <div class="gameHeaderBox" style="height: 120%; {showMatchBox == true && newLoading == false && positionPlayFilter.length == 0 && managerSelection == 0 ? "border: 0.5px solid var(--g111); border-radius: 1em;" : null}" on:click={() => multiFunction(null, null, 'matchup', match.home.matchInfo.matchID, 0)} />
                    <div class="matchOpponent">
                        <div class="matchTop" style="justify-content: flex-start; left: 2%; top: 8%;">
                            <img class="matchAvatar" src="{match.home.manager.avatar}" alt="" on:click={() => multiFunction(null, null, 'matchup',  match.home.matchInfo.matchID, match.home.manager.recordManID)} style="{match.home.manager.recordManID == managerSelection ? "background-color: var(--gcSelect); border: 0.5px solid var(--g111);" : null}" >
                            <div class="gameTeamWrapper">
                                <div class="gameTeam" style="margin: 0 0 5% 0; left: -2%;">{match.home.manager.realname}</div>
                            </div>
                        </div>
                        <div class="gameTeam" style="align-items: center; font-size: 0.75em; font-style: italic; color: var(--g555); top: -40%; left: 30%; width: 69%; line-height: 1em;">{match.home.manager.name}</div>
                        <div class="gameTeam" style="align-items: center; font-size: 0.75em; font-style: italic; color: var(--g555); top: -40%; left: 30%; width: 69%; line-height: 1em;">{match.home.record.showTies == true ? '(' + match.home.record.wins + ' - ' + match.home.record.ties + ' - ' + match.home.record.losses + ')' : '(' + match.home.record.wins + ' - ' + match.home.record.losses + ')'}</div>
                    </div>
                    <div class="versus">V</div>
                    <div class="matchOpponent">
                        <div class="matchTop" style="justify-content: flex-end; right: 2%; top: 8%;">
                            <div class="gameTeamWrapper">
                                <div class="gameTeam" style="margin: 0 0 5% 0; right: -2%;">{match.away.manager.realname}</div>
                            </div>
                            <img class="matchAvatar" src="{match.away.manager.avatar}" alt="" on:click={() => multiFunction(null, null, 'matchup',  match.away.matchInfo.matchID, match.away.manager.recordManID)} style="{match.away.manager.recordManID == managerSelection ? "background-color: var(--gcSelect); border: 0.5px solid var(--g111);" : null}" >
                        </div>
                        <div class="gameTeam" style="align-items: center; justify-content: flex-end; font-size: 0.75em; font-style: italic; color: var(--g555); top: -40%; width: 69%; line-height: 1em;">{match.away.manager.name}</div>
                        <div class="gameTeam" style="align-items: center; justify-content: flex-end; font-size: 0.75em; font-style: italic; color: var(--g555); top: -40%; width: 69%; line-height: 1em;">{match.away.record.showTies == true ? '(' + match.away.record.wins + ' - ' + match.away.record.ties + ' - ' + match.away.record.losses + ')' : '(' + match.away.record.wins + ' - ' + match.away.record.losses + ')'}</div>
                    </div>
                </div>
                <div class="totalPointsRow">
                    <div class="totalPointsWrap">
                        <div class="totalPoints">{round(match.home.fpts)}</div>
                        <div class="projectedPoints">{round(match.home.projection)}</div>
                    </div>
                    <div class="totalPointsWrap">
                        <div class="totalPoints">{round(match.away.fpts)}</div>
                        <div class="projectedPoints">{round(match.away.projection)}</div>
                    </div>
                </div>
                <div class="matchContainer">
                    <div class="rosterWrap">
                        {#each match.home.starters as starter}
                            <div class="rosterRow" style="justify-content: flex-start;">
                                <div class="avatarHolder" style="{starter.pos == 'DEF' ? "width: 52%; top: 1%; margin: 0 1% 0 0;" : "margin: 0 1% 0 0;"} right: 1%; {viewPlayer?.player?.playerID == starter.playerID ? "z-index: 2; background-color: var(--aaa); border: 0.5px solid var(--g111);" : null}"> 
                                    <img class="rosterAvatar" src="{starter.avatar}" alt="" on:click={() => multiFunction(starter.playerID, starter.t, null, null, null)} style="z-index: 2; {viewPlayer?.player?.playerID == starter.playerID ? "background-color: var(--aaa);" : null}">
                                </div>
                                <div class="rosterPlayerInfo" style="{starter.pos == 'DEF' ? "margin: 0 2% 0 0;" : null}" >
                                    <div class="rosterPlayer" style="justify-content: flex-start; {starter.pos == 'DEF' ? "margin: 0 7% 0 0;" : "margin: 0 3% 0 0;"}">{starter.pos == 'DEF' ? `${starter.fn} ${starter.ln}` : `${starter.fn.slice(0, 1)}. ${starter.ln}`}</div>
                                    <div class="rosterPlayer" style="justify-content: space-between; {starter.pos == 'DEF' ? "margin: 0 7% 0 0;" : "margin: 0 3% 0 0;"}">
                                        <div style="display: inline-flex; color: var(--g555);">({round(starter.projection)})</div>
                                        <div style="display: inline-flex; font-weight: 600; {starter.pos == 'DEF' ? "margin: 0 2% 0 0;" : "margin: 0 5% 0 0;"}">{round(starter.fpts)}</div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div class="positionsWrap">
                        {#each positions as position}
                            <div class="rosterPosition {position}">
                                <div class="rosterRowBox" style="{positionPlayFilter.length > 0 && positionPlayFilter.includes(position)  ? "border: 0.5px solid var(--g111); border-radius: 1em;" : null}" />
                                {position}
                                <div class="selectedPosition" on:click={() => multiFunction(null, null, 'position', position, 0)} style="{positionPlayFilter.length > 0 && positionPlayFilter.includes(position) ? "border: 0.5px solid var(--g111); border-radius: 1em; z-index: 2;" : null}"></div>
                            </div>
                        {/each}
                    </div>
                    <div class="rosterWrap">
                        {#each match.away.starters as starter}
                            <div class="rosterRow" style="justify-content: flex-end;">
                                <div class="rosterPlayerInfo">
                                    <div class="rosterPlayer" style="justify-content: flex-end; {starter.pos == 'DEF' ? "margin: 0 0 0 7%;" : "margin: 0 0 0 3%;"}">{starter.pos == 'DEF' ? `${starter.fn} ${starter.ln}` : `${starter.fn.slice(0, 1)}. ${starter.ln}`}</div>
                                    <div class="rosterPlayer" style="justify-content: space-between; {starter.pos == 'DEF' ? "margin: 0 0 0 7%;" : "margin: 0 0 0 3%;"}">
                                        <div style="display: inline-flex; font-weight: 600; {starter.pos == 'DEF' ? "margin: 0 0 0 -2%;" : "margin: 0 0 0 2%;"}">{round(starter.fpts)}</div>  
                                        <div style="display: inline-flex; color: var(--g555);">({round(starter.projection)})</div>
                                    </div>
                                </div>                                
                                <div class="avatarHolder" style="{starter.pos == 'DEF' ? "width: 52%; top: 1%; margin: 0 0 0 5%;" : "margin: 0 0 0 2%;"} left: 1%; border-radius: 0 1em 1em 0; {viewPlayer?.player?.playerID == starter.playerID ? "z-index: 2; background-color: var(--aaa); border: 0.5px solid var(--g111);" : null}">
                                    <img class="rosterAvatar" src="{starter.avatar}" alt="" on:click={() => multiFunction(starter.playerID, starter.t, null, null, null)} style="{viewPlayer?.player?.playerID == starter.playerID ? "background-color: var(--aaa);" : null}">
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
    <div class="bigBoxRightWrap">
        <div class="viewPlayer">
            <div class="viewPlayerBlock">
                <!-- {#if !viewPlayer.player}
                    <img style="height: 40px; width:auto;" src="./dome_dark.png" alt="">
                    <Icon path={mdiWeatherCloudy}/>
                    {game.gameInfo.dome}
                    {game.gameInfo.stadium}
                {/if} -->
                <div class="viewPlayerTop">
                    <div class="viewPlayerProfile">
                        {#if viewPlayer?.player?.pos != 'DEF'}
                            <img class="viewPlayerAvatar" src="{viewPlayer?.player?.avatar}" alt="" style="{viewPlayer?.player != null && viewPlayer?.player != 'flush' ? "border: 0.25px solid #777; border-radius: 1em;" : null}">
                            <div class="viewPlayerName">{viewPlayer?.player?.fn || ''} {viewPlayer?.player?.ln || ''}</div>
                        {:else}
                            <img class="viewDefenseAvatar" src="{viewPlayer?.player?.avatar}" alt="" style="{viewPlayer?.player != null && viewPlayer?.player != 'flush' ? "border: 0.25px solid #777; border-radius: 1em;" : null}">
                            <div class="viewPlayerName">{viewPlayer?.player?.ln + ' Defense' || ''}</div>  
                        {/if}
                    </div>
                    <div class="viewPlayerInfo">
                        <img class="t" src="{viewPlayer?.player?.teamAvatar || ''}" alt="">
                        <div class="pos {viewPlayer?.player?.pos}">{viewPlayer?.player?.pos || ''}</div>
                    </div>
                </div>
                {#if viewPlayer}
                    <div class="viewPlayerBottom">                       
                        {#await displayStats}
                            {''}
                        {:then displayStats} 
                            {#if displayStats}
                                {#each displayStats as player}
                                    <div class="fptsContainer">
                                        <div class="fptsBox">{round(player.totalFpts)}</div>
                                    </div>
                                    <div class="statsContainer">
                                        {#each player.stats as statCat}  
                                            <div class="statWrap" style="{viewPlayer.player.teamColor}">
                                                <div class="statCat">{statCat.statDesc}</div>
                                                <div class="statMetric" style="{viewPlayer.player.teamAltColor}">{statCat.metric}</div>
                                                <div class="statFpts">{round(statCat.fpts)}</div>
                                            </div>
                                        {/each}
                                    </div>
                                {/each}
                            {/if}
                        {/await}         
                    </div>
                {/if}
            </div>
        </div>
        <div class="leaderboardPOS">
            {#if newLoading}
                <div class="modal" style="width: 98%">
                    <div class="modalContent">Loading Leaderboard...</div>
                    <LinearProgress indeterminate />
                </div>
            {/if}
            <div class="heading">
                {leaderboardHeading} Leaderboard
            </div>
            <div class="leaderboardContainer">
                {#if positionLeaderboard && positionLeaderboard.length > 0}
                    {#each positionLeaderboard as positionLeader, ix}
                        <div class="leaderboardRow" id="{positionLeader.playerID == viewPlayer?.player?.playerID ? "viewPlayer" : null}" style="{positionLeader.playerID == viewPlayer?.player?.playerID ? "background-color: var(--aaa); border: 0.5px solid var(--g111); font-weight: 700;" : null}">
                            <div class="posPlayerRank">{ix + 1}</div>
                            <div class="posPlayerProfile">
                                <div class="posPlayerAvatarHolder">
                                    <img class="{positionLeader.pos == 'DEF' ? "posDefenseAvatar" : "posPlayerAvatar"}" src="{positionLeader.avatar}" alt="">
                                </div>
                                <div class="posPlayerName">{positionLeader.fn || ''} {positionLeader.ln || ''}</div> 
                            </div>
                            <div class="posPlayerManager">{positionLeader.owner.name}</div>
                            <div class="posPlayerFpts">{round(positionLeader.fpts)}</div>
                        </div>
                    {/each}
                {:else}
                    No leaderboard yet...
                {/if}
            </div>
        </div>
    </div>
</div>