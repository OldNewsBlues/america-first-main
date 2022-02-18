import {
	waitForAll,
	getLeagueUsers,
	getLeagueRosters,
	leagueID,
	managers,
	getLeagueData,
	getStarterPositions } from '$lib/utils/helper';
import { get } from 'svelte/store';
import {awards} from '$lib/stores';

export const getAwards = async () => {
	if(get(awards).podiums) return get(awards);
	const [rosterRes, users, leagueData] = await waitForAll(
		getLeagueRosters(leagueID),
		getLeagueUsers(leagueID),
		getLeagueData(leagueID),
	).catch((err) => { console.error(err); });

	const rosters = rosterRes.rosters;
	const currentManagers = {};
	const leagueManagers = {}; 

	for(const manager of managers) {
		if(!leagueManagers[manager.roster]) leagueManagers[manager.roster] = [];

		leagueManagers[manager.roster].push({
			managerID: manager.managerID,
			rosterID: manager.roster,
			name: manager.name,
			status: manager.status,
			yearsactive: manager.yearsactive,
		});
	}

	for(const roster of rosters) {
		const user = users[roster.owner_id];

		const recordManager = leagueManagers[roster.roster_id].find(m => m.status == "active");
		const recordManID = recordManager.managerID;

		if(user) {
			currentManagers[recordManID] = {
				avatar: user.avatar != null ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : `https://sleepercdn.com/images/v2/icons/player_default.webp`,
				name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
				realname: recordManager.name,
			}
		} else {
			currentManagers[recordManID] = {
				avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
				name: 'Unknown Manager',
				realname: 'John Q. Rando',
			}
		}
	}

	let podiumStartID = leagueData.status == 'complete' ? leagueData.league_id : leagueData.previous_league_id;

	const {podiums, finalRanks} = await getPodiums(podiumStartID)

	const gatheredAwards = {
		podiums,
		finalRanks,
		currentManagers,
	};

	awards.update(() => gatheredAwards);

	return gatheredAwards;
}

const getPodiums = async (previousSeasonID) => {
	const podiums = [];
	const finalRanks = [];

	while(previousSeasonID && previousSeasonID != 0) {
		// use the previous season ID to get the previous league, roster, user, and bracket data
		const previousSeasonData = await getPreviousLeagueData(previousSeasonID);

		const {
			losersData,
			winnersData,
			finalMatch,
			rosterPositions,
			numPlayoffMatches,
			numToiletMatches,
			numPOTeams,
			numToiletTeams,
			losersBracketType,
			year,
			previousRosters,
			numDivisions,
			usersData,
			playoffRounds,
			toiletRounds,
			leagueMetadata,
			recordManagers,
		} = previousSeasonData;

		previousSeasonID = previousSeasonData.previousSeasonID;

		const {divisions, prevManagers} = buildDivisionsAndManagers({usersData, previousRosters, leagueMetadata, numDivisions, recordManagers});

		// add manager to division obj and convert to array
		const divisionArr = []
		for(const key in divisions) {
			divisions[key].manager = prevManagers[divisions[key].recordManID];
			divisionArr.push(divisions[key]);
		}

		let finalRank = {
			champion: null,
			second: null,
			third: null,
			fourth: null,
			5: null,
			6: null,
			7: null,
			8: null,
		}
		let toiletArray = [];
		let consolationArray = [];
		let podium = {
			year,
			champion: null,
			second: null,
			third: null,
			divisions: divisionArr,
			toilet: null,
		}
		let champRosterID;
		//final ranks of playoff-bracket teams
		if(numPOTeams == 4){
			const finalsMatch = winnersData.slice().find(f => f.m == numPlayoffMatches - 1);
			podium.champion = prevManagers[recordManagers.find(m => m.rosterID == finalsMatch.w).managerID];
			finalRank.champion = podium.champion;
			champRosterID = finalsMatch.w;
			podium.second = prevManagers[recordManagers.find(m => m.rosterID == finalsMatch.l).managerID];
			finalRank.second = podium.second;

			const runnersUpMatch = winnersData.slice().find(f => f.m == numPlayoffMatches);
			podium.third = prevManagers[recordManagers.find(m => m.rosterID == runnersUpMatch.w).managerID];
			finalRank.third = podium.third;
			finalRank.fourth  = prevManagers[recordManagers.find(m => m.rosterID == runnersUpMatch.l).managerID];
		} else if(numPOTeams == 6) {
			const finalsMatch = winnersData.slice().find(f => f.m == numPlayoffMatches - 1);
			podium.champion = prevManagers[recordManagers.find(m => m.rosterID == finalsMatch.w).managerID];
			finalRank.champion = podium.champion;
			champRosterID = finalsMatch.w;
			podium.second = prevManagers[recordManagers.find(m => m.rosterID == finalsMatch.l).managerID];
			finalRank.second = podium.second;

			const runnersUpMatch = winnersData.slice().find(f => f.m == numPlayoffMatches);
			podium.third = prevManagers[recordManagers.find(m => m.rosterID == runnersUpMatch.w).managerID];
			finalRank.third = podium.third;
			finalRank.fourth  = prevManagers[recordManagers.find(m => m.rosterID == runnersUpMatch.l).managerID];

			const fiveSixMatch = winnersData.slice().find(f => f.m == numPlayoffMatches - 2);
			finalRank[5] = prevManagers[recordManagers.find(m => m.rosterID == fiveSixMatch.w).managerID];
			finalRank[6] = prevManagers[recordManagers.find(m => m.rosterID == fiveSixMatch.l).managerID];	
		} else if(numPOTeams == 8) {
			const finalsMatch = winnersData.slice().find(f => f.m == numPlayoffMatches - 3);
			podium.champion = prevManagers[recordManagers.find(m => m.rosterID == finalsMatch.w).managerID];
			finalRank.champion = podium.champion;
			champRosterID = finalsMatch.w;
			podium.second = prevManagers[recordManagers.find(m => m.rosterID == finalsMatch.l).managerID];
			finalRank.second = podium.second;

			const runnersUpMatch = winnersData.slice().find(f => f.m == numPlayoffMatches - 2);
			podium.third = prevManagers[recordManagers.find(m => m.rosterID == runnersUpMatch.w).managerID];
			finalRank.third = podium.third;
			finalRank.fourth  = prevManagers[recordManagers.find(m => m.rosterID == runnersUpMatch.l).managerID];

			const fiveSixMatch = winnersData.slice().find(f => f.m == numPlayoffMatches - 1);
			finalRank[5] = prevManagers[recordManagers.find(m => m.rosterID == fiveSixMatch.w).managerID];
			finalRank[6] = prevManagers[recordManagers.find(m => m.rosterID == fiveSixMatch.l).managerID];	
			
			const sevenEightMatch = winnersData.slice().find(f => f.m == numPlayoffMatches)[0];
			finalRank[7] = prevManagers[recordManagers.find(m => m.rosterID == sevenEightMatch.w).managerID];
			finalRank[8] = prevManagers[recordManagers.find(m => m.rosterID == sevenEightMatch.l).managerID];	
		}
		// // final ranks of losers-bracket teams
		if(losersBracketType == "toilet") {
			if(numToiletTeams == 0) {
				const toilet = null;
			} else if(numToiletTeams == 2) {
				const toiletBowlMatch = losersData.find(f => f.m == numToiletMatches);
				podium.toilet = prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID];
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID]); // last place
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.l).managerID]); // second to last
			} else if(numToiletTeams == 4) {
				const toiletBowlMatch = losersData.find(f => f.m == numToiletMatches - 1);
				podium.toilet = prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID];
				const bronzeLoserMatch = losersData.find(f => f.m == numToiletMatches);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID]); // last place
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.l).managerID]); // second to last
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.w).managerID]); // third to last
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.l).managerID]); // fourth to last
			} else if(numToiletTeams == 6) {																				// etc below
				const toiletBowlMatch = losersData.find(f => f.m == numToiletMatches - 1);
				podium.toilet = prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID];
				const bronzeLoserMatch = losersData.find(f => f.m == numToiletMatches);
				const fiveSixLoserMatch = losersData.find(f => f.m == numToiletMatches - 2);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.l).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.w).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.l).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == fiveSixLoserMatch.w).managerID]); 
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == fiveSixLoserMatch.l).managerID]); 
			} else if(numToiletTeams > 6) {
				const toiletBowlMatch = losersData.find(f => f.m == numToiletMatches - 3);
				podium.toilet = prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID];
				const bronzeLoserMatch = losersData.find(f => f.m == numToiletMatches - 2);
				const fiveSixLoserMatch = losersData.find(f => f.m == numToiletMatches - 1);
				const sevenEightLoserMatch = losersData.find(f => f.m == numToiletMatches);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.l).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.w).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.l).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == fiveSixLoserMatch.w).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == fiveSixLoserMatch.l).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == sevenEightLoserMatch.w).managerID]);
				toiletArray.push(prevManagers[recordManagers.find(m => m.rosterID == sevenEightLoserMatch.l).managerID]);
			}
		} else if(losersBracketType == "consolation") {
			if(numToiletTeams == 0) {
				podium.toilet = null;
			} else if(numToiletTeams == 2) {
				const toiletBowlMatch = losersData.find(f => f.m == numToiletMatches);
				podium.toilet = prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID];
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID]); // first LOSER (e.g. 7th place in 6-team playoff league)
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.l).managerID]); // second loser 
			} else if(numToiletTeams == 4) {																						// etc below
				const toiletBowlMatch = losersData.find(f => f.m == numToiletMatches - 1);
				podium.toilet = prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID];
				const bronzeLoserMatch = losersData.find(f => f.m == numToiletMatches);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.l).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.l).managerID]);
			} else if(numToiletTeams == 6) {
				const toiletBowlMatch = losersData.find(f => f.m == numToiletMatches - 1);
				podium.toilet = prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID];
				const bronzeLoserMatch = losersData.find(f => f.m == numToiletMatches);
				const fiveSixLoserMatch = losersData.find(f => f.m == numToiletMatches - 2);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.l).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.l).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == fiveSixLoserMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == fiveSixLoserMatch.l).managerID]);
			} else if(numToiletTeams > 6) {
				const toiletBowlMatch = losersData.find(f => f.m == numToiletMatches - 3);
				podium.toilet = prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID];
				const bronzeLoserMatch = losersData.find(f => f.m == numToiletMatches - 2);
				const fiveSixLoserMatch = losersData.find(f => f.m == numToiletMatches - 1);
				const sevenEightLoserMatch = losersData.find(f => f.m == numToiletMatches);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == toiletBowlMatch.l).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == bronzeLoserMatch.l).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == fiveSixLoserMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == fiveSixLoserMatch.l).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == sevenEightLoserMatch.w).managerID]);
				consolationArray.push(prevManagers[recordManagers.find(m => m.rosterID == sevenEightLoserMatch.l).managerID]);
			}
		}
		// translating final ranks depending on league size
		const numTeams = numPOTeams + numToiletTeams;
		// regardless of league size, we already have the top 4
		let processedFinalRanks = {
			year,
			1: finalRank.champion,
			2: finalRank.second,
			3: finalRank.third,
			4: finalRank.fourth,
		};
		// create a rank-child in the parent-object for every team in league (will need later for setting ranks of teams that didn't place in EITHER bracket, if there are any)
		for(let i = 5; i < numTeams; i++) {
			processedFinalRanks[i] = null;
		}
		// now check if 5-8 were named in the winners bracket
		for(let i = 5; i < 8; i++) {
			if(finalRank[i]) processedFinalRanks[i] = finalRank[i];
		}
		
		if(losersBracketType == "toilet") {  									// working backwards from last place, set the rank IF it has not already been set by the winners bracket check above
			for(let i = 0; i < 8; i++) {
				if(toiletArray[i] && toiletArray[i] != null) {
					if(!processedFinalRanks[numTeams - i]) processedFinalRanks[numTeams - i] = toiletArray[i];
				}
			}
		} else if(losersBracketType == "consolation") { 						// up to 8 ranks can be found from consolation bracket, beginning with the winner of that bracket
			for(let i = 1; i < 9; i++) {
				if(consolationArray[i - 1]) processedFinalRanks[numPOTeams + i] = consolationArray[i - 1];			
			}
		}
		const champMatchupInfo = finalMatch.find(m => m.roster_id == champRosterID);
		podium.champRoster = {
			starters: champMatchupInfo.starters,
			startersPoints: champMatchupInfo.starters_points,
			points: champMatchupInfo.points,
			rosterPositions,
		}
		podiums.push(podium);
		finalRanks.push(processedFinalRanks);
	}
	return {podiums, finalRanks};
}

// fetch the previous season's data from sleeper
const getPreviousLeagueData = async (previousSeasonID) => {
	const resPromises = [
		fetch(`https://api.sleeper.app/v1/league/${previousSeasonID}`, {compress: true}),
		getLeagueRosters(previousSeasonID),
		getLeagueUsers(previousSeasonID),
		fetch(`https://api.sleeper.app/v1/league/${previousSeasonID}/losers_bracket`, {compress: true}),
		fetch(`https://api.sleeper.app/v1/league/${previousSeasonID}/winners_bracket`, {compress: true}),
	]

	const [leagueRes, rostersData, usersData, losersRes, winnersRes] = await waitForAll(...resPromises).catch((err) => { console.error(err); });

	if(!leagueRes.ok || !losersRes.ok || !winnersRes.ok) throw new Error(data);

	const jsonPromises = [
		leagueRes.json(),
		losersRes.json(),
		winnersRes.json(),
	]

	const [prevLeagueData, losersData, winnersData] = await waitForAll(...jsonPromises).catch((err) => { console.error(err); });

	const year = prevLeagueData.season;	
	const yearP = parseInt(year);
	const numPOTeams = prevLeagueData.settings.playoff_teams;
	const numToiletTeams = prevLeagueData.total_rosters - numPOTeams;
	const losersBracketType = prevLeagueData.settings.playoff_type == 0 ? 'toilet' : prevLeagueData.settings.playoff_type == 1 ? 'consolation' : null;
	const leagueManagers = {};

	for(const manager of managers) {
		if(!leagueManagers[manager.roster]) leagueManagers[manager.roster] = [];

		leagueManagers[manager.roster].push({
			managerID: manager.managerID,
			rosterID: manager.roster,
			name: manager.name,
			status: manager.status,
			yearsactive: manager.yearsactive,
			yearP,
		});
	}

	const previousRosters = rostersData.rosters;
	const recordManagers = [];

	for(const roster of previousRosters) {
		const recordManager = leagueManagers[roster.roster_id].find(m => m.yearsactive.includes(yearP));
		recordManagers.push(recordManager);
	}

	const rosterPositions = getStarterPositions(prevLeagueData);
	const numDivisions = prevLeagueData.settings.divisions || 1;
	const playoffRounds = winnersData[winnersData.length - 1].r
	const numPlayoffMatches = winnersData[winnersData.length - 1].m
	const toiletRounds = numToiletTeams > 0 ? losersData[losersData.length - 1].r : 0;
	const numToiletMatches = numToiletTeams > 0 ? losersData[losersData.length - 1].m : 0;

	const finalWeek = prevLeagueData.settings.playoff_week_start - 1 + winnersData.slice().pop().r;
	const finalMatchRes = await fetch(`https://api.sleeper.app/v1/league/${previousSeasonID}/matchups/${finalWeek}`, {compress: true});
	const finalMatchJson = await finalMatchRes.json();
	const finalMatch = await finalMatchJson.filter(m => m.matchup_id == 1);
	previousSeasonID = prevLeagueData.previous_league_id;

	return {
		losersData,
		winnersData,
		finalMatch,
		rosterPositions,
		numPlayoffMatches,
		numToiletMatches,
		numPOTeams,
		numToiletTeams,
		losersBracketType,
		year,
		previousRosters,
		numDivisions,
		usersData,
		previousSeasonID,
		playoffRounds,
		toiletRounds,
		leagueMetadata: prevLeagueData.metadata,
		recordManagers,
	}
}

// determine division champions and construct previousManagers object
const buildDivisionsAndManagers = ({usersData, previousRosters, leagueMetadata, numDivisions, recordManagers}) => {
	const prevManagers = {};
	const divisions = {};

	for(let i = 0; i < numDivisions; i++) {
		divisions[i+1] = {
			name: leagueMetadata ? leagueMetadata[`division_${i + 1}`] : null,
			roster: null,
			wins: -1,
			points: -1,
			pointsAgainst: -1,
			recordManID: null,
		}
	}

	for(const roster of previousRosters) {
		const rSettings = roster.settings;
		const div = rSettings.division ? rSettings.division : 1;

		const recordManager = recordManagers.find(m => m.rosterID == roster.roster_id);
		const recordManID = recordManager.managerID;
		const points = rSettings.fpts + rSettings.fpts_decimal / 100;
		if(rSettings.wins > divisions[div].wins || (rSettings.wins == divisions[div].wins && rSettings.ties > divisions[div].ties) || (rSettings.wins == divisions[div].wins && rSettings.ties == divisions[div].ties && (rSettings.fpts + rSettings.fpts_decimal / 100) > divisions[div].points) || (rSettings.wins == divisions[div].wins && rSettings.ties == divisions[div].ties && (rSettings.fpts + rSettings.fpts_decimal / 100) == divisions[div].points && (rSettings.fpts_against + rSettings.fpts_against_decimal / 100) >= divisions[div].pointsAgainst)) {
			divisions[div].points = rSettings.fpts  + rSettings.fpts_decimal / 100;
			divisions[div].pointsAgainst = rSettings.fpts_against + rSettings.fpts_against_decimal / 100;
			divisions[div].wins = rSettings.wins;
			divisions[div].ties = rSettings.ties;
			divisions[div].roster = roster.roster_id;
			divisions[div].recordManID = recordManID;
		}

		const user = usersData[roster.owner_id];
		prevManagers[recordManID] = {
			rosterID: roster.roster_id,
			avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
			name: 'Unknown Manager',
			realname: 'John Q. Rando',
			recordManID,
			ownerID: roster.owner_id,
		}
		if(user) {
			prevManagers[recordManID].avatar = user.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : `https://sleepercdn.com/images/v2/icons/player_default.webp`;
			prevManagers[recordManID].name = user.metadata.team_name ? user.metadata.team_name : user.display_name;
			prevManagers[recordManID].realname = recordManager.name;
		}
	}
	return {divisions, prevManagers}
}