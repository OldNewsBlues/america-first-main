import {
	waitForAll,
	getLeagueUsers,
	getLeagueRosters,
	getNflState,
	leagueID,
	managers,
	getLeagueData,
    nflTeams,
    getLeagueMatchups } from '$lib/utils/helper';
import { get } from 'svelte/store';
import { leagueData, scoreboardStore } from '$lib/stores';

export const getPlayByPlay = async (gameID) => {

    let fullPlayByPlay;

    const playbyplayPromises = [];
    playbyplayPromises.push(fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${gameID}/competitions/${gameID}/plays?lang=en&region=us`, {compress: true}));

    const playbyplaysRes = await waitForAll(...playbyplayPromises).catch((err) => { console.error(err); });

    const playbyplayJsonPromises = [];
    if(playbyplaysRes.length) {
        for(const playbyplayRes of playbyplaysRes) {
            const data = playbyplayRes.json();
            playbyplayJsonPromises.push(data)
            if(!playbyplayRes.ok) throw new Error(data);
        }
        const playbyplaysData = await waitForAll(...playbyplayJsonPromises).catch((err) => { console.error(err); });
        if(playbyplaysData.length) {

            let pageCount = playbyplaysData[0].pageCount;
            if(pageCount > 1) {
                const pagePromises = [];
                for(let i = 1; i < pageCount + 1; i++) {
                    pagePromises.push(fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${gameID}/competitions/${gameID}/plays?lang=en&region=us&page=${i}`, {compress: true}));
                }

                const pagesRes = await waitForAll(...pagePromises).catch((err) => { console.error(err); });
                if(pagesRes.length) {

                    const pageJsonPromises = [];
                    for(const pageRes of pagesRes) {
                        const data = pageRes.json();
                        pageJsonPromises.push(data)
                        if(!pageRes.ok) throw new Error(data);
                    }
                    const pagesData = await waitForAll(...pageJsonPromises).catch((err) => { console.error(err); });
                    if(pagesData.length) fullPlayByPlay = pagesData;
                }
            } else {
                fullPlayByPlay = playbyplaysData;
            }
            return fullPlayByPlay;
        }
    }
}

export const getGameDrives = async (gameID) => {

    let fullDrives;

    const drivesPromises = [];
    drivesPromises.push(fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${gameID}/competitions/${gameID}/drives?lang=en&region=us`, {compress: true}));

    const drivesRes = await waitForAll(...drivesPromises).catch((err) => { console.error(err); });

    if(drivesRes.length) {

        const drivesJsonPromises = [];
        for(const driveRes of drivesRes) {
            const data = driveRes.json();
            drivesJsonPromises.push(data)
            if (!driveRes.ok) throw new Error(data);
        }
        const drivesData = await waitForAll(...drivesJsonPromises).catch((err) => { console.error(err); });

        if(drivesData.length) {
            let pageCount = drivesData[0].pageCount;
            if(pageCount > 1) {
                const pagePromises = [];
                for(let i = 1; i < pageCount + 1; i++) {
                    pagePromises.push(fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${gameID}/competitions/${gameID}/drives?lang=en&region=us&page=${i}`, {compress: true}));
                }

                const pagesRes = await waitForAll(...pagePromises).catch((err) => { console.error(err); });
                if(pagesRes.length) {
                    const pageJsonPromises = [];
                    for(const pageRes of pagesRes) {
                        const data = pageRes.json();
                        pageJsonPromises.push(data)
                        if (!pageRes.ok) throw new Error(data);
                    }
                    const pagesData = await waitForAll(...pageJsonPromises).catch((err) => { console.error(err); });
                    if(pagesData.length) fullDrives = pagesData;
                }
            } else {
                fullDrives = drivesData;
            }
            return fullDrives;
        }
    }
}

export const getGameStatus = async (statusLink) => {
    const secureStatusLink = 'https' + statusLink.slice(4); 
    const res = await fetch(`${secureStatusLink}`, {compress: true}).catch((err) => { console.error(err); });
    const data = await res.json().catch((err) => { console.error(err); });
    if(data) return data;
}

export const getGameScore = async (scoreLink) => {
    const secureScoreLink = 'https' + scoreLink.slice(4); 
    const res = await fetch(`${secureScoreLink}`, {compress: true}).catch((err) => { console.error(err); });
    const data = await res.json().catch((err) => { console.error(err); });
    if(data) return data.value;
}

let yearSelection, weekSelection, newWeekSelection, newYearSelection;

export const getNflScoreboard = async (yearSelection, weekSelection) => {

	if(newYearSelection == yearSelection && newWeekSelection == weekSelection && get(scoreboardStore).nflWeek) return get(scoreboardStore);

    const [leagueData, nflState] = await waitForAll(
        getLeagueData(leagueID),
        getNflState(),
    ).catch((err) => { console.error(err); });

    const year = parseInt(nflState.season);
    if(!yearSelection) yearSelection = year;

    let week;
    if(yearSelection == year && leagueData.status == 'complete') {
        const playoffRes = await fetch(`https://api.sleeper.app/v1/league/${leagueData.league_id}/winners_bracket`, {compress: true});
        const playoffJson = await playoffRes.json();
        week = leagueData.settings.playoff_week_start - 1 + playoffJson.pop().r;
    } else {
        week = nflState.week;
    }
    if(!weekSelection) weekSelection = week;

    const scoreboardData = {
        nflWeek: [],
        week,
    }

    if(leagueData.status != 'complete' && yearSelection == year && weekSelection == week) {

        const scoreboardPromises = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`, {compress: true});
        const scoreboardsData = await scoreboardPromises.json();
        const nflGames = scoreboardsData.events;
        let gameInfo = {};

        for(const key in nflGames) {
            const nflGame = nflGames[key];
            if(!gameInfo[nflGame.id]) gameInfo[nflGame.id] = [];
            for(let i = 0; i < 2; i++) {
                let team = nflGame.competitions[0].competitors[i];
                let sleeperID = nflTeams.find(n => n.espnID == team.id).sleeperID;

                const teamEntry = {
                    team: nflTeams.find(n => n.sleeperID == sleeperID),
                    sleeperID,
                    score: team.score,
                    homeAway: team.homeAway,
                    record: team.records[0].summary,
                    gameID: nflGame.id,
                    status: nflGame.status,
                    info: {
                        weather: nflGame.weather,
                        dome: nflGame.competitions[0].venue.indoor ? true : false,
                        stadium: nflGame.competitions[0].venue.fullName,
                    },
                };
                gameInfo[nflGame.id].push(teamEntry);
            }
            scoreboardData.nflWeek.push(gameInfo[nflGame.id]);
        }
    } else {

        let weekGamesPromises;
        if((yearSelection >= 2021 && weekSelection < 19) || (yearSelection < 2021 && weekSelection < 18)) {
            weekGamesPromises = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${yearSelection}/types/2/weeks/${weekSelection}/events?lang=en&region=us`, {compress: true});
        } else {
            let adjustedWeekSelection;
            if(yearSelection >= 2021 && weekSelection != 21) {
                adjustedWeekSelection = weekSelection - 17;
            } else if(yearSelection >= 2021 && weekSelection == 21) {
                adjustedWeekSelection = 5;
            }
            weekGamesPromises = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${yearSelection}/types/3/weeks/${adjustedWeekSelection}/events?lang=en&region=us`, {compress: true});
        }

        const weekGamesData = await weekGamesPromises.json();

        const gamesPromises = [];
        for(const game of weekGamesData.items) {
            gamesPromises.push(fetch(`${game.$ref}`))
        }

        const gamesRes = await waitForAll(...gamesPromises).catch((err) => { console.error(err); });
        const gameJsonPromises = [];
        for(const gameRes of gamesRes) {
            const data = gameRes.json();
            gameJsonPromises.push(data)
            if (!gameRes.ok) throw new Error(data);
        }
        const gamesData = await waitForAll(...gameJsonPromises).catch((err) => { console.error(err); });

        const gameInfo = {};

        for(const key in gamesData) {
            const nflGame = gamesData[key];
            gameInfo[nflGame.id] = [];
            for(let i = 0; i < 2; i++) {
                let team = nflGame.competitions[0].competitors[i];
                let sleeperID = nflTeams.find(n => n.espnID == team.id).sleeperID;

                const score = await getGameScore(team.score.$ref);
                const status = await getGameStatus(nflGame.competitions[0].status.$ref);
                if(status) {
                    gameInfo[nflGame.id].push({
                        team: nflTeams.find(n => n.sleeperID == sleeperID),
                        sleeperID,
                        score,
                        homeAway: team.homeAway,
                        gameID: nflGame.id,
                        status,
                        info: {
                            dome: nflGame.competitions[0].venue.indoor ? true : false,
                            stadium: nflGame.competitions[0].venue.fullName,
                        },
                    });
                }
            }
            scoreboardData.nflWeek.push(gameInfo[nflGame.id]);
        }
    }

    newWeekSelection = weekSelection;
    newYearSelection = yearSelection;

    scoreboardStore.update(() => scoreboardData);

    return scoreboardData;
}

let currentYear = null;
let curSeason = leagueID;
const leagueIdArray = [];
const leagueDataArray = [];
leagueIdArray.push(curSeason);

export const getYearMatchups = async (yearSelection, weekSelection, purpose) => {

    let matchupsData;

    const nflState = await getNflState().catch((err) => { console.error(err); });
    if(!yearSelection) {
        yearSelection = parseInt(nflState.season);
        currentYear = yearSelection;
    }

    const [currentLeagueData, currentRosterRes, currentUsers] = await waitForAll(
        getLeagueData(leagueID),
        getLeagueRosters(leagueID),
        getLeagueUsers(leagueID),
    ).catch((err) => { console.error(err); });

    if(leagueDataArray.length == 0) {
        leagueDataArray.push(currentLeagueData);
        curSeason = currentLeagueData.previous_league_id;
        leagueIdArray.push(curSeason);
    }
    
    while (curSeason && curSeason != 0) {
        let previousLeagueData = await getLeagueData(curSeason).catch((err) => { console.error(err); });
        leagueIdArray.push(previousLeagueData.previous_league_id);
        leagueDataArray.push(previousLeagueData);
        curSeason = previousLeagueData.previous_league_id;
    }

    if(yearSelection == currentYear) {
        let currentMatchupsData = await getLeagueMatchups().catch((err) => { console.error(err); });
        currentMatchupsData['yearLeagueData'] = currentLeagueData;
        currentMatchupsData['rosters'] = currentRosterRes.rosters;
        currentMatchupsData['users'] = currentUsers;
        matchupsData = currentMatchupsData;
    } else {

        const idIndex = currentYear - yearSelection;
        const yearLeagueID = leagueIdArray[idIndex];
        const yearLeagueData = leagueDataArray[idIndex];

        const [rosterRes, users, playoffsRes] = await waitForAll(
            getLeagueRosters(yearLeagueID),
            getLeagueUsers(yearLeagueID),
            fetch(`https://api.sleeper.app/v1/league/${leagueID}/winners_bracket`, {compress: true}),
        ).catch((err) => { console.error(err); });

        const playoffs = await playoffsRes.json();
        const regularSeasonLength = yearLeagueData.settings.playoff_week_start - 1;
        const fullSeasonLength = regularSeasonLength + playoffs.pop().r;

        const rosters = rosterRes.rosters;
    
        const yearManagers = {};
        for(const manager of managers) {
            if(manager.yearsactive.includes(yearSelection)) {
                yearManagers[manager.roster] = {
                    managerID: manager.managerID,
                    rosterID: manager.roster,
                    name: manager.name,
                    status: manager.status,
                    yearsactive: manager.yearsactive,
                    abbreviation: manager.abbreviation,
                }
            }
        }

        let searchStart = purpose == 'gameCenter' ? fullSeasonLength : purpose == 'standings' ? regularSeasonLength : null;
        const matchupsPromises = [];

        while(searchStart > 0) {
            matchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${yearLeagueID}/matchups/${searchStart}`, {compress: true}))
            searchStart--;
        }

        const matchupsRes = await waitForAll(...matchupsPromises).catch((err) => { console.error(err); });

        // convert the json matchup responses
        const matchupsJsonPromises = [];
        for(const matchupRes of matchupsRes) {
            const data = matchupRes.json();
            matchupsJsonPromises.push(data)
            if (!matchupRes.ok) throw new Error(data);
        }
        const yearMatchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => { console.error(err); });

        let matchupWeeks = [];
        // process all the matchups
        for(let i = 1; i < yearMatchupsData.length + 1; i++) {
            const processed = processMatchups(yearMatchupsData[i - 1], yearManagers, rosters, users, i);
            if(processed) {
                matchupWeeks.push({
                    matchups: processed.matchups,
                    week: processed.week
                });
            }
        }
        matchupWeeks = matchupWeeks.reverse();

        matchupsData = {
            matchupWeeks,
            year: yearSelection,
            week: weekSelection,
            regularSeasonLength,
            yearLeagueData,
            rosters: rosters,
            users: users,
            rawData: yearMatchupsData,
            managers: yearManagers,
        }
    }
    return matchupsData;
}

export const getGameStats = async (gameID, espnTeamIDs) => {

    const statsPromises = [];
    for(const teamID of espnTeamIDs) {
        statsPromises.push(fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${gameID}/competitions/${gameID}/competitors/${teamID}/statistics?lang=en&region=us`, {compress: true}))
    }
    const statsRes = await waitForAll(...statsPromises).catch((err) => { console.error(err); });

    // convert the json matchup responses
    const statsJsonPromises = [];
    for(const statRes of statsRes) {
        const data = statRes.json();
        statsJsonPromises.push(data)
        if (!statRes.ok) throw new Error(data);
    }
    const statsData = await waitForAll(...statsJsonPromises).catch((err) => { console.error(err); });
    const gameStats = {
        home: statsData[0],
        away: statsData[1],
    }
    return gameStats;
}

export const getPlayerStats = async (statsLink) => {
    const secureStatsLink = 'https' + statsLink.slice(4); 
    const res = await fetch(`${secureStatsLink}`, {compress: true}).catch((err) => { console.error(err); });
	const data = await res.json().catch((err) => { console.error(err); });
    if(data) return data.splits.categories;
}

const processMatchups = (inputMatchups, yearManagers, rosters, users, week) => {
	if(!inputMatchups || inputMatchups.length == 0) return false;
	const matchups = {};
	for(const match of inputMatchups) {
		if(!matchups[match.matchup_id]) matchups[match.matchup_id] = [];
		const user = users[rosters[match.roster_id - 1].owner_id];
        const recordManager = yearManagers[match.roster_id]; 
		const recordManID = recordManager.managerID;

		matchups[match.matchup_id].push({
			manager: {
				name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
				avatar: user.avatar != null ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : `https://sleepercdn.com/images/v2/icons/player_default.webp`,
				realname: recordManager.name,
                abbreviation: recordManager.abbreviation,
                rosterID: match.roster_id,
                recordManID,
			},
			recordManID,
			starters: match.starters,
			points: match.starters_points,
			matchID: match.matchup_id,
			rosterID: match.roster_id,
			totalFpts: match.points,
		})
	}
	return {matchups, week};
}